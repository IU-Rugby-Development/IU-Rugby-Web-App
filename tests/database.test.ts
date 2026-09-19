import assert from "node:assert/strict";
import { before, after, test } from "node:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const ids = {
  player: "11111111-1111-4111-8111-111111111111", parent: "22222222-2222-4222-8222-222222222222",
  executive: "33333333-3333-4333-8333-333333333333", admin: "44444444-4444-4444-8444-444444444444",
};
let playerGroup: string;
let linkId: string;
before(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant usage, select on sequences to anon, authenticated;
  `);
  const migrationDir = new URL("../supabase/migrations/", import.meta.url);
  for (const file of (await readdir(migrationDir)).filter((name) => name.endsWith(".sql")).sort()) {
    await db.exec(await readFile(new URL(file, migrationDir), "utf8"));
  }
  for (const id of Object.values(ids)) await db.query("insert into auth.users(id, raw_user_meta_data) values ($1, $2)", [id, { first_name: "Test", role: "ADMIN" }]);
  await db.query("update public.profiles set role='ADMIN' where id=$1", [ids.admin]);
  await db.query("update public.profiles set role='EXECUTIVE' where id=$1", [ids.executive]);
  playerGroup = (await db.query<{ id: string }>("select id from public.groups where name='PLAYER'")).rows[0].id;
  await db.query("insert into public.group_memberships(user_id, group_id) values ($1, $2)", [ids.player, playerGroup]);
  for (const visibility of ["PUBLIC", "MEMBERS", "GROUPS"]) {
    const event = await db.query<{ id: string }>("insert into public.events(title,event_type,starts_at,visibility,created_by) values ($1,'EVENT','2026-09-23T22:00Z',$1,$2) returning id", [visibility, ids.admin]);
    if (visibility === "GROUPS") await db.query("insert into public.event_groups(event_id,group_id) values ($1,$2)", [event.rows[0].id, playerGroup]);
  }
  linkId = (await db.query<{ id: string }>("insert into public.ticket_links(player_id,code,destination_url) values ($1,'test-player','https://tickets.kuntzstadium.com/') returning id", [ids.player])).rows[0].id;
  await db.query("insert into public.ticket_activity(ticket_link_id) values ($1)", [linkId]);
});
after(async () => { await db.close(); });
async function asUser(id: string | null, run: () => Promise<void>) {
  await db.exec("begin");
  try {
    await db.exec("set local role " + (id ? "authenticated" : "anon"));
    await db.query("select set_config('request.jwt.claim.sub', $1, true)", [id ?? ""]);
    await run();
  } finally { await db.exec("rollback"); }
}
test("signup trigger ignores supplied role metadata", async () => {
  const result = await db.query<{ role: string }>("select role from public.profiles where id=$1", [ids.player]);
  assert.equal(result.rows[0].role, "MEMBER");
});
test("members can change their own names", async () => {
  await asUser(ids.player, async () => {
    const result = await db.query<{ first_name: string }>("update public.profiles set first_name='Changed' where id=$1 returning first_name", [ids.player]);
    assert.equal(result.rows[0].first_name, "Changed");
  });
});
test("name edits preserve an existing ADMIN role and group changes do not touch it", async () => {
  await asUser(ids.admin, async () => {
    const result = await db.query<{ role: string }>("update public.profiles set first_name='Updated' where id=$1 returning role", [ids.admin]);
    assert.equal(result.rows[0].role, "ADMIN");
    await db.query("insert into public.group_memberships(user_id,group_id) values ($1,$2)", [ids.admin, playerGroup]);
    await db.query("delete from public.group_memberships where user_id=$1 and group_id=$2", [ids.admin, playerGroup]);
    assert.equal((await db.query<{ role: string }>("select role from public.profiles where id=$1", [ids.admin])).rows[0].role, "ADMIN");
  });
});
test("trigger functions are private and authorization helpers remain usable by authenticated RLS", async () => {
  for (const name of ["handle_new_user()", "set_updated_at()", "is_admin(uuid)", "is_executive_or_admin(uuid)", "is_in_group(uuid,text)"]) {
    const result = await db.query<{ anon: boolean; authenticated: boolean }>("select has_function_privilege('anon',$1,'EXECUTE') as anon, has_function_privilege('authenticated',$1,'EXECUTE') as authenticated", ["public." + name]);
    assert.equal(result.rows[0].anon, false);
    assert.equal(result.rows[0].authenticated, name.startsWith("is_"));
  }
});
test("members cannot delete events, and staff delete cascades audience records", async () => {
  await asUser(ids.player, async () => assert.equal((await db.query("delete from public.events returning id")).rows.length, 0));
  await asUser(ids.executive, async () => {
    const event = await db.query<{ id: string }>("select public.save_event(null,'Temporary test',null,'MEETING',null,'2026-09-23T22:00Z',null,'GROUPS',array[$1::uuid]) as id", [playerGroup]);
    await db.query("delete from public.events where id=$1", [event.rows[0].id]);
    assert.equal((await db.query("select * from public.event_groups where event_id=$1", [event.rows[0].id])).rows.length, 0);
  });
});
test("members cannot elevate their role", async () => {
  await assert.rejects(asUser(ids.player, async () => { await db.query("update public.profiles set role='ADMIN' where id=$1", [ids.player]); }), /row-level security|permission denied/i);
});
test("members cannot assign themselves stakeholder groups", async () => {
  await assert.rejects(asUser(ids.parent, async () => { await db.query("insert into public.group_memberships(user_id,group_id) values ($1,$2)", [ids.parent, playerGroup]); }), /row-level security|permission denied/i);
});
test("anonymous, member, targeted player and staff event visibility", async () => {
  for (const [id, expected] of [[null, ["PUBLIC"]], [ids.parent, ["MEMBERS", "PUBLIC"]], [ids.player, ["GROUPS", "MEMBERS", "PUBLIC"]], [ids.executive, ["GROUPS", "MEMBERS", "PUBLIC"]], [ids.admin, ["GROUPS", "MEMBERS", "PUBLIC"]]] as const) {
    await asUser(id, async () => { assert.deepEqual((await db.query<{ visibility: string }>("select visibility from public.events order by visibility")).rows.map((row) => row.visibility), expected); });
  }
});
test("only administrators can assign roles", async () => {
  await asUser(ids.executive, async () => {
    const result = await db.query("update public.profiles set role='ADMIN' where id=$1 returning id", [ids.parent]);
    assert.equal(result.rows.length, 0);
  });
  await asUser(ids.admin, async () => {
    const result = await db.query<{ role: string }>("update public.profiles set role='EXECUTIVE' where id=$1 returning role", [ids.parent]);
    assert.equal(result.rows[0].role, "EXECUTIVE");
  });
});
test("direct client CLICK and PURCHASE fabrication is denied", async () => {
  for (const actor of [null, ids.player, ids.admin]) for (const activity of ["CLICK", "PURCHASE"]) {
    await assert.rejects(asUser(actor, async () => { await db.query("insert into public.ticket_activity(ticket_link_id,activity_type) values ($1,$2)", [linkId, activity]); }), /permission denied|row-level security/i);
  }
});
test("ticket stats and leaderboard do not expose another player's records", async () => {
  await asUser(ids.parent, async () => {
    assert.equal((await db.query("select * from public.ticket_activity")).rows.length, 0);
    assert.equal((await db.query("select * from public.referral_leaderboard")).rows.length, 0);
  });
  await asUser(ids.player, async () => {
    assert.equal((await db.query("select * from public.ticket_activity")).rows.length, 1);
    assert.equal((await db.query("select * from public.referral_leaderboard")).rows.length, 1);
  });
  await assert.rejects(asUser(null, async () => { await db.query("select * from public.ticket_links"); }), /permission denied/i);
});
test("event RPC requires staff and saves group audience atomically", async () => {
  const sql = "select public.save_event(null,'New event',null,'MEETING',null,'2026-09-23T22:00Z',null,'GROUPS',array[$1::uuid]) as id";
  await assert.rejects(asUser(ids.player, async () => { await db.query(sql, [playerGroup]); }), /staff access/i);
  await asUser(ids.executive, async () => {
    const event = await db.query<{ id: string }>(sql, [playerGroup]);
    assert.equal((await db.query("select * from public.event_groups where event_id=$1", [event.rows[0].id])).rows.length, 1);
    await db.query("select public.save_event($1,'Updated',null,'MEETING',null,'2026-09-23T22:00Z',null,'PUBLIC','{}')", [event.rows[0].id]);
    assert.equal((await db.query("select * from public.event_groups where event_id=$1", [event.rows[0].id])).rows.length, 0);
  });
});
test("event RPC rejects empty groups, invalid targets and reversed times", async () => {
  for (const statement of [
    "select public.save_event(null,'Bad',null,'MEETING',null,'2026-09-23T22:00Z',null,'GROUPS','{}')",
    "select public.save_event(null,'Bad',null,'MEETING',null,'2026-09-23T22:00Z',null,'GROUPS',array['99999999-9999-4999-8999-999999999999'::uuid])",
    "select public.save_event(null,'Bad',null,'MEETING',null,'2026-09-23T22:00Z','2026-09-23T21:00Z','PUBLIC','{}')",
  ]) await assert.rejects(asUser(ids.executive, async () => { await db.query(statement); }), /group|times/i);
});
