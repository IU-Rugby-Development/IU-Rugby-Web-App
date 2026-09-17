# Phase 1 engineering report

Verification date: September 17, 2026.

The repository is buildable and the public shell/ticket path are reviewable in Vercel Preview. Authentication, live calendar data and live referral storage remain blocked by unavailable runtime configuration. READY means the deployment built, not that these backend features passed.

## 1. Git

- Starting main: fb1b268967d78faa2d017a3e17a5ac1159693186.
- Feature branch: phase1/mvp-hardening.
- Main was not modified directly, force-pushed or merged.
- Changes are submitted as an unmerged review PR. The PR's final validation record provides the exact final SHA, immutable Preview URL, deployment ID and CI results; this report is itself included in that branch.
- No production deployment, domain attachment, DNS change, OptimX account change or Kuntz configuration change was performed.

## 2. Build

| Command | Result |
| --- | --- |
| npm ci | PASS; reproducible lockfile, 0 reported vulnerabilities |
| npm run lint | PASS |
| npx tsc --noEmit | PASS |
| npm test | PASS; 22 tests |
| npm run build | PASS; Next.js 16.3.5 on Node 24 |

Fixed malformed calendar anchors, incorrect event-card imports, missing dashboard route wrappers, generated LayoutProps dependence before type generation, and invalid nested link/button markup. No framework migration, broad dependency upgrade or error suppression was used.

The tests include isolated PostgreSQL/PGlite policy execution, actual referral-route execution with mocked HTTP, safe auth redirects and trusted callback origins, calendar dates/DST, audience validation, and ICS escaping/folding. They do not substitute for live Supabase verification.

## 3. Vercel

- Team: lreddells-projects.
- Project: iu-rugby-web-app (prj_E2fb1P3TTvEHIMo1ENG7OY8Ypt1e).
- [Stable branch Preview](https://iu-rugby-web-app-git-phase1-mvp-hardening-lreddells-projects.vercel.app).
- Normal Git integration builds the feature branch; no separate deployment pipeline was introduced.
- Preview protection remains enabled. Checks used the authorized Vercel CLI and authenticated browser.
- The first buildable Preview returned runtime 500 because the Supabase client had no usable URL/key. A fresh Preview redeployment reproduced it.
- The four configured variable names and Preview/Production scopes exist in Vercel metadata. Deployment metadata includes their names, but build diagnostics report all four unavailable. Their stored values were not printed or overwritten.
- Outage handling now preserves public pages and ticket access, rejects account actions, redirects protected routes and returns an honest calendar 503.
- The inspected hardened deployment reported no error/fatal runtime log entries after smoke checks. The final PR record identifies the exact final deployment and repeated verification.

## 4. Route checks

| Route | Result | Observed behavior |
| --- | --- | --- |
| / | PASS | 200; homepage renders |
| /login | BLOCKED | 200; labeled form and unavailable-service message; submission disabled |
| /signup | BLOCKED | 200; form renders; backend signup unavailable |
| /calendar | BLOCKED | 200; unavailable message instead of a false empty schedule |
| /tickets | PASS | 200; real external Indiana Rugby ticket CTA |
| /dashboard | REDIRECTS AS EXPECTED | 307 to sign-in; authenticated rendering unverified |
| /dashboard/calendar | REDIRECTS AS EXPECTED | 307 to sign-in; authenticated data unverified |
| /dashboard/profile | REDIRECTS AS EXPECTED | 307 to sign-in; live profile update unverified |
| /dashboard/tickets | REDIRECTS AS EXPECTED | 307 to sign-in; live data unverified |
| /admin | REDIRECTS AS EXPECTED | 307 to sign-in; live admin account unavailable |
| /calendar/feed.ics | BLOCKED | 503; no fabricated empty feed |

Additional checks: invalid referral syntax redirects 302 to the direct ticket fallback; callback without a code redirects 307 with a safe sign-in message; invalid individual-event UUID returns 404. Live valid individual-event exports, calendar mutations, successful sign-in/logout and role/group account checks remain unverified.

## 5. Supabase and authentication

Live connectivity and the identity of the connected Supabase project could not be established. No remote tables/views were falsely declared present. The expected objects are profiles, groups, group_memberships, events, event_groups, ticket_links, ticket_activity and referral_leaderboard.

The local Preview environment pull returns sensitive placeholders. The user chose Preview verification with this local-access limitation documented. Subsequent Preview builds also lacked usable values; possession of the variable names alone does not supply credentials.

- 0001–0005: baseline files reviewed and tested; remote applied/missing state unknown.
- 0006_ticket_activity_security.sql: new; not applied remotely during this task.
- 0007_atomic_event_groups.sql: new; not applied remotely during this task.
- All seven migrations executed successfully in isolated test PostgreSQL.
- No remote migration, seed, real member edit, role promotion or test-account signup was performed.
- Public signup still creates MEMBER. Member-only events plus authenticated profile/group directories may be visible to anyone who signs up; live content sensitivity remains unknown.
- PKCE callback URLs preserve a trusted branch/deployment origin. Hostile paths/origins cannot become redirect destinations. Sessions are checked in proxy, server pages and actions.

See [database setup](database.md), [authentication](authentication.md), and [permissions](permissions.md) for exact inspection SQL, migration order, initial ADMIN bootstrap and access rules.

## 6. Ticketing

- Destination: [Indiana Rugby collection at Kuntz](https://tickets.kuntzstadium.com/section/rugby-luu0), verified through the public storefront navigation.
- Embed status: **not recommended**. A followed HEAD request returned 200 without observed X-Frame-Options or frame-ancestors restrictions, but that does not establish explicit provider support or a reliable embedded checkout. Ordinary external navigation is used.
- The ticket CTA was followed in the browser to the provider. No payment, checkout or provider-account change was attempted.
- Referral handling remains implemented and covered by five route tests: active, invalid/inactive, unsafe destination, insertion failure, and HEAD/missing-config behavior.
- Click tracking is available when valid backend configuration and migrations exist; it is not currently verified live. A logging failure does not block a safe ticket handoff.
- Only exact HTTPS tickets.kuntzstadium.com destinations are accepted. HEAD produces no click; repeated GETs/bots can still inflate traffic.
- No purchase events, confirmed-sales claims, webhooks, revenue figures or payment system were fabricated. Confirmed sales and promo usage remain external.

## 7. Security

- Service-role code is server-only. The referral handler is the sole application importer of the admin client; no browser bundle contained the service-role variable name/admin-client symbol in the checked build.
- A heuristic scan of 152 historical blobs and 125 tracked working files found no actual credentials. This is an evidence-based scan, not a guarantee about all possible secret formats.
- .env.local, .vercel and verification artifacts are ignored; .env.example contains placeholders only.
- Admin mutations recheck ADMIN and validate IDs/roles/groups. Staff event mutations recheck EXECUTIVE/ADMIN. Policies deny member role elevation and self-assigned stakeholder groups in isolated tests.
- Concrete RLS defect fixed in migration 0006: direct public/client activity inserts could fabricate CLICK/PURCHASE. The migration removes that policy and revokes writes. It also removes anonymous referral-link enumeration.
- The referral view remains security_invoker. Tests cover own-player stats isolation.
- Atomic save_event runs as SECURITY INVOKER with caller RLS and saves group targeting in the same transaction.
- Public calendar pages and feeds explicitly select PUBLIC events even for signed-in staff, preventing session-dependent private feed content.
- Safe callback paths and ticket-host validation close open-redirect paths. Response logging avoids secrets/member rows.
- Live RLS remains a deployment prerequisite: committed SQL has no effect on the hosted database until applied there.

## 8. UI

Original cream/crimson typography and shape-based presentation, clear Schedule/Tickets/account navigation, visible mobile controls, accessible focus/skip-link behavior, usable error states and direct ticket handoff.

Desktop and 390×844 browser checks found no horizontal overflow or nested link/button controls on the checked public/auth pages. No application console/hydration errors were observed in the checked pages. A browser-extension warning unrelated to the application was excluded.

Donate, Watch and Sponsors remain as future placeholder routes, removed from primary/dashboard navigation. No roster, scores, sponsor logos, team photos, or match schedule content was invented. No OptimX code/templates/assets were copied. Authenticated layouts still require live user verification.

## 9. Documentation and maintenance

- README.md: scope, setup, variables, validation, Preview and honest backend status.
- AGENTS.md: concise maintenance/security/scope rules.
- docs/database.md: metadata inspection, exact migration order, initial administrator, local-only seed.
- docs/authentication.md: PKCE, trusted origins, redirect configuration and test limitations.
- docs/permissions.md: role/group matrix and public-signup exposure.
- docs/ticketing.md: provider, embed evidence, collection URL, click/reporting limits.
- docs/optimx-migration-notes.md: future contract/content/export review and separate cutover.
- supabase/migrations/README.md: migration application guidance.
- .github/workflows/ci.yml: npm ci, lint, typecheck, tests and build; no production secrets.
- scripts/smoke.mjs: safe HTTP checks, with a failing status for blocked routes.
- scripts/verify-backend.mjs: read-only Preview diagnostics without values or member data.

## 10. Phase 1 status

| Area | Status |
| --- | --- |
| Authentication | BLOCKED |
| User roles/groups | PARTIAL |
| Calendar | BLOCKED |
| Dashboard | PARTIAL |
| Ticket access | COMPLETE |
| Referral click tracking | PARTIAL |
| Confirmed purchase tracking | NOT REQUIRED |
| Deployment | COMPLETE |
| Documentation | COMPLETE |
| Presentation readiness | PARTIAL |

Deployment COMPLETE describes a built, reachable Preview. Presentation remains PARTIAL until core backend flows can be demonstrated with approved accounts and real authorized content.

## 11. External/manual follow-ups

### Required before stakeholder demo

1. An authorized owner must inspect the existing Vercel Preview variable entries and supply usable values from the intended Supabase project. Confirm URL/keys match that project; keep the service-role value server-only. Do not paste secrets into chat or the PR. Rebuild Preview and require the backend diagnostic to pass.
2. Use legitimate Supabase SQL/admin access to inspect existing schema and migration history. Apply only missing baseline migrations, then reviewed 0006 and 0007. Their paths and SQL inspection steps are in database.md. Never blindly replay the baseline or run the sample seed on a shared system.
3. Verify email confirmation and exact branch/deployment /auth/callback allowlist entries. Keep confirmation enabled and use the same browser for signup and callback.
4. Establish one verified initial ADMIN through the documented SQL-admin process if none exists. With approved test accounts, complete signup → confirmation → login → dashboard → profile → logout and MEMBER/EXECUTIVE/ADMIN + group checks.
5. Verify live public/member/group calendars, event create/edit/delete, public/individual ICS and one authorized test referral click. Do not create PURCHASE events or alter real stakeholders for testing.
6. Enter stakeholder-approved schedule content and confirm demo viewers have Vercel Preview access. Record the tested Preview origin; deployment protection can also prevent third-party calendar clients from subscribing during review.

### Required before production launch

1. Resolve the public-signup/MEMBER content-access decision before publishing private team information; implement approval/invitation only after the product rule is agreed.
2. Complete live RLS/security and authenticated browser validation, review the PR/migrations, and approve launch separately.
3. Confirm production Supabase/project origins and email settings, operational ownership and backups. A passing Preview does not validate Production.
4. Approve original/team-owned content and prepare a separate migration/rollback/domain plan. Confirm OptimX licensing, content/image ownership, export and contract terms before moving existing site content.

### Future/optional

Authorized photography/branding, broader content/CMS features, supported Kuntz reporting access if justified, fuller OptimX migration, and a native mobile experience. None is a reason to build custom ticket payments or delay the safe Phase 1 code review.
