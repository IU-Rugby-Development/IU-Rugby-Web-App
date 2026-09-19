# Database state and migrations

Live project: `supabase-fuchsia-ball` / `pkbdrvovnnlrircmtaym`, verified through the Supabase management connection on September 17, 2026. The public schema, Auth and calendar backend are live. Do not replay migrations 0001–0007 or apply the local sample seed to this shared database.

| Repo migration | Live ledger version | Name |
| --- | --- | --- |
| 0001 | 20260917055020 | profiles |
| 0002 | 20260917055031 | groups |
| 0003 | 20260917055048 | events |
| 0004 | 20260917055110 | tickets |
| 0005 | 20260917055125 | leaderboard_view |
| 0006 | 20260917055142 | ticket_activity_security |
| 0007 | 20260917055159 | atomic_event_groups |
| 0008 | 20260917202213 | function_hardening |

0008 was committed as `3cc8975` before applying that exact committed SQL through legitimate Supabase migration access. The timestamp ledger name maps to the numbered repo file; it is not a second migration to replay. Function bodies, signatures, grants, trigger definitions and dependent policies were inspected before applying it.

## Function hardening

- set_updated_at, handle_new_user and the three authorization helpers now have explicit `pg_catalog, public` search paths. Referenced application tables were already schema-qualified.
- Both trigger functions deny direct PUBLIC/anon/authenticated EXECUTE; trigger invocation still works.
- is_admin(uuid), is_executive_or_admin(uuid), and is_in_group(uuid,text) deny PUBLIC/anon EXECUTE but retain authenticated execution for RLS.
- All helper-dependent policies are scoped to authenticated. The anonymous PUBLIC-event policy does not invoke a revoked helper.
- save_event remains SECURITY INVOKER with an empty search_path and atomic event/group writes.

After migration, Security Advisor no longer reports a mutable search path or anonymous SECURITY DEFINER exposure. Its three authenticated SECURITY DEFINER warnings remain intentionally: these read-only helpers are required by RLS and return only boolean authorization/group answers. Do not revoke their authenticated grants without redesigning and testing the dependent policies. See [the advisor explanation](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

Leaked-password protection is an Auth setting, not a SQL fix. See the engineering report for the current hosted limitation and [Supabase guidance](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Role investigation

The live handle_new_user trigger runs only AFTER INSERT on auth.users. It inserts names and relies on the MEMBER default for new profiles; it does not upsert or reset existing roles. The profile action only updates names. Group actions write group_memberships only. The only application role writer is the ADMIN-authorized action. No automatic ADMIN-to-MEMBER reset path was found, so the earlier observation's cause remains unproven. The immediate-save role selector could cause accidental changes; the UI now requires Save and the action guards self-demotion and stale edits.

## Safe validation

`npm test` applies all eight migrations in isolated PGlite/PostgreSQL and tests signup-trigger defaults, name edits preserving roles, grants, role/group authorization, calendar audiences, atomic saves, deletion, and activity-write restrictions. It creates no live auth users or member records.

`npm run verify:backend` checks `.env.local`; Preview builds run the same read-only verifier. It checks HTTP status and JSON errors/results for every table/view, inspects the OpenAPI schema for save_event without invoking it, checks public calendar reads, and verifies Auth email confirmation is enabled. Missing configuration, schema, RPCs or connection failures now fail the command/build. Empty result data alone is not considered proof of availability.

The existing primary administrator is already established. Do not run bootstrap promotions or change real stakeholder roles for testing. Use normal authorized app sessions. The local Vercel export still contains sensitive placeholders; live management/Preview access is available independently.
