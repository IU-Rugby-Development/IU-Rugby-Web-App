import assert from "node:assert/strict";
import { test } from "node:test";
import { verifyBackend } from "../scripts/verify-backend.mjs";

const env = { NODE_ENV: "test" as const, NEXT_PUBLIC_SUPABASE_URL: "https://fixture.supabase.co", NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon", SUPABASE_SERVICE_ROLE_KEY: "service", NEXT_PUBLIC_SITE_URL: "https://club.example" };
function responses(missing?: string) {
  return (async (input: string | URL | Request, init?: RequestInit) => {
    assert.equal(init?.method, undefined, "verification must use read-only GET requests");
    const url = new URL(String(input));
    if (url.pathname.endsWith("/")) return Response.json({ paths: missing === "save_event" ? {} : { "/rpc/save_event": { post: {} } } });
    if (url.pathname.endsWith("settings")) return Response.json({ mailer_autoconfirm: false, external: { email: true } });
    assert.equal(url.searchParams.get("limit"), "0", "no member records are requested");
    if (url.pathname.endsWith(missing ?? "NEVER")) return new Response(null, { status: 404 });
    return Response.json([]);
  }) as typeof fetch;
}
test("backend verifier accepts recognized empty objects, not merely absent data", async () => {
  assert.equal(await verifyBackend(env, responses(), () => {}), true);
});
test("missing PostgREST table, view or RPC is a hard failure, even with no error body", async () => {
  for (const object of ["profiles", "referral_leaderboard", "save_event"]) assert.equal(await verifyBackend(env, responses(object), () => {}), false);
});
test("backend verifier rejects configuration placeholders and connection failures", async () => {
  assert.equal(await verifyBackend({ ...env, SUPABASE_SERVICE_ROLE_KEY: "[SENSITIVE]" }, responses(), () => {}), false);
  assert.equal(await verifyBackend(env, async () => { throw new Error("offline"); }, () => {}), false);
});
