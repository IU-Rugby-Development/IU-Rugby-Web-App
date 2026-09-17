# Database setup and verification

The live database identity and migration state were not verifiable during this pass because the configured Preview received no usable Supabase values. No live SQL, seed, role promotion, or member-data mutation was performed.

## Inspect before applying migrations

An authorized owner should first identify the Supabase project from its project settings and confirm that Vercel's URL and keys belong to that same project. In the Supabase SQL Editor, inspect metadata rather than member data:

```sql
select name, to_regclass('public.' || name) as object
from unnest(array[
  'profiles', 'groups', 'group_memberships', 'events',
  'event_groups', 'ticket_links', 'ticket_activity', 'referral_leaderboard'
]) as name;

select relname, relrowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
and relname in ('profiles','groups','group_memberships','events',
                'event_groups','ticket_links','ticket_activity');

select tablename, policyname, cmd, roles
from pg_policies where schemaname = 'public'
order by tablename, policyname;
```

Check any existing migration ledger and compare the functions, constraints and policies with the files. Do not replay already-applied baseline SQL: these migrations intentionally are not all idempotent.

Apply only missing migrations in order through the SQL Editor or an already-established, correctly linked migration pipeline:

1. 0001_profiles.sql
2. 0002_groups.sql
3. 0003_events.sql
4. 0004_tickets.sql
5. 0005_leaderboard_view.sql
6. 0006_ticket_activity_security.sql
7. 0007_atomic_event_groups.sql

For an existing database with 0001–0005 applied, review and apply 0006 and 0007. The previous client INSERT policy on ticket_activity accepts PURCHASE as well as CLICK and must not remain enabled for this rollout. The app's event save action now requires the save_event RPC in 0007.

The new event end-time constraint is NOT VALID for historical rows so the migration does not fail on old invalid data. New writes are checked. Review historical rows before validating the constraint; do not silently delete or rewrite existing events.

## Initial administrator

1. A designated human registers and confirms their email.
2. A database administrator verifies that person's identity and copies the exact auth.users UUID from the Supabase dashboard.
3. In the trusted SQL Editor, replace the placeholder below with that verified UUID:

```sql
update public.profiles
set role = 'ADMIN'
where id = '<verified-auth-user-uuid>'::uuid
returning id, role;
```

Verify exactly one intended profile changed. Do not hardcode emails/passwords or promote a public signup based on client metadata. Use the app's Admin → Users page for subsequent role/group management.

## Validation and limits

The automated database tests create an isolated PostgreSQL engine, emulate the Supabase auth.uid interface and API roles, apply all seven migrations, and assert RLS decisions. They do not establish that live Supabase has the same schema, grants, hooks, or auth configuration. Run the live backend diagnostic and an authorized account matrix after applying migrations.

supabase/seed.sql is explicitly synthetic local development content. Do not run it against shared systems or represent it as a confirmed rugby fixture. No Supabase CLI project link, database password, or SQL-admin token was available in this workspace.
