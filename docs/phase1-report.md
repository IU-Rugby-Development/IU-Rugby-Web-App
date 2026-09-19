# Phase 1 engineering report

Verification date: September 17, 2026. Branch: `phase1/mvp-hardening`. PR #1 remains draft and unmerged. Main, DNS, OptimX and production deployment are unchanged.

## Verified backend state

Supabase project `pkbdrvovnnlrircmtaym` is live. Its migration ledger confirms 0001–0007; 0008 was committed as `3cc8975` and then applied unchanged as `20260917202213_function_hardening`. Auth, custom Resend SMTP, calendar and referral infrastructure are configured. The earlier report describing absent configuration/unapplied migrations is superseded.

The function audit found the expected signatures and no trigger/upsert that resets an existing ADMIN role. The immediate-save admin selector was a concrete accidental-change risk. Role changes now require Save, reject stale writes, and prevent self-demotion; profile writes remain name-only. Admin user cards show email/name/current role and explicit group controls.

## Implemented confirmation fix

Signup and resend now link to an app confirmation landing route using TokenHash. GET/HEAD never verify it; a temporary HTTP-only cookie and clean review URL precede explicit same-origin POST verification. Supabase SSR session cookies are written on success. Expired links get app UI with sign-in, home and resend choices. The professional template is versioned at `supabase/templates/confirm-signup.html`; hosted application and final Preview checks are being recorded below when completed.

The Auth allowlist now supports the exact branch/canonical app origins plus localhost. The previous team-wide Vercel wildcard was removed. Auth Site URL remains the branch during Phase 1 because that is the deployed demo origin; canonical production-style app configuration remains available for a separately authorized release.

## Local verification

`npm ci`, lint, TypeScript, 34 tests and `npm run build` passed. No runtime dependency was added. Tests cover confirmation GET/POST/cookies/errors, validation/redirects, PostgreSQL RLS and trigger grants, role preservation, groups, calendar atomicity/CRUD/visibility, ICS/DST and referral safeguards. Preview backend checks now hard-fail on missing tables/views/functions instead of treating absent/error responses as success.

The local environment still contains Vercel sensitive placeholders. Local live Auth tests are unavailable; management access and hosted Preview checks are independent. No credentials or member data are printed in diagnostics.

## Security Advisor after 0008

Mutable search_path and anonymous SECURITY DEFINER exposure are resolved. Three authenticated helper warnings remain intentionally because RLS needs these read-only boolean helpers. Leaked-password protection remains disabled pending inspection of hosted availability. See [database details](database.md) and [advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).

## Deployment and live evidence

The final branch SHA, deployment ID/URL, route matrix, browser checks and remaining manual account steps will be added after this branch rebuilds. Do not interpret offline tests as live signup/email verification.
