# IU Rugby web application

A web application for IU Men's Rugby and Friends of Hoosier Rugby. The current [iurugby.com](https://www.iurugby.com/) site remains the live public site. This repository is a separate development effort, with no DNS or production cutover authorized.

## Current status — September 17, 2026

Phase 1 hardening restores buildability, dashboard routes, public navigation, external ticket access, calendar editing, and security boundaries. The feature branch has a Vercel Preview, but backend functionality is **blocked pending usable Supabase configuration and live schema verification**. The four expected variables exist in Vercel metadata; the inspected Preview builds receive no usable values. Sensitive values cannot be exported by the CLI. Do not interpret a READY deployment or a passing offline test as proof that live authentication works.

See [the engineering report](docs/phase1-report.md) for the final deployment, route matrix, and remaining actions.

## Phase 1 scope

- Public homepage, schedule, ticket entry point, sign-in and signup pages.
- Supabase email/password authentication and confirmation callback.
- MEMBER, EXECUTIVE and ADMIN authorization, separate from PLAYER, PARENT, ALUMNI, SUPPORTER and SPONSOR groups.
- Dashboard and profile editing; staff event management with public/member/group audiences.
- Administrator role/group/referral-link management.
- Public calendar subscription and authorized individual event exports.
- External Kuntz/vivenu ticketing and optional referral click counts.

Native apps, custom payments, purchase attribution, donation accounting, full CMS migration, and production launch are outside this phase. Donate, Watch and Sponsors placeholders remain in the repository but are absent from primary and dashboard navigation.

## Stack

Next.js 16.3.5, React 19.2.8, TypeScript, Tailwind CSS 4, Supabase, and Vercel. Node.js 24 matches the Vercel runtime. No framework or database migration was performed.

## Local setup

```sh
git clone https://github.com/IU-Rugby-Development/IU-Rugby-Web-App.git
cd IU-Rugby-Web-App
npm ci
npx vercel@59.20.0 login
npx vercel@59.20.0 link --scope lreddells-projects --project iu-rugby-web-app
npx vercel@59.20.0 env pull .env.local --environment=preview --yes
npm run dev
```

The project is `prj_E2fb1P3TTvEHIMo1ENG7OY8Ypt1e`. Check `.vercel/project.json` before any remote action. Never create a second project accidentally.

The existing Vercel variables are sensitive; pulling them currently writes `[SENSITIVE]` placeholders. An authorized owner must provide usable values locally through an ignored file, or repair the Preview configuration in Vercel. Do not paste secrets into chat, tickets, source, screenshots, or logs. Set the local site URL to `http://localhost:3000` when testing email confirmation locally. Changes to public environment values require a new build.

Without configuration, the public shell and ticket storefront link remain available; account actions fail closed, calendar pages show an unavailable message, and ICS endpoints return 503 rather than a false empty schedule.

## Required environment variables

| Name | Purpose |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Existing Supabase project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public API key; data access remains governed by RLS |
| SUPABASE_SERVICE_ROLE_KEY | Server-only referral lookup/activity insertion; bypasses RLS |
| NEXT_PUBLIC_SITE_URL | Approved application origin for non-Preview links |

Never prefix the service-role key with NEXT_PUBLIC. Preview confirmation preserves the trusted branch/deployment origin so its PKCE cookie remains available; referral links prefer VERCEL_BRANCH_URL. Do not set the application origin to iurugby.com before a separately authorized migration.

## Database and first administrator

Apply the SQL in [supabase/migrations](supabase/migrations) in order using legitimate database-admin access, after inspecting which migrations already exist. There is no linked Supabase CLI configuration in this checkout; `supabase db reset` is not a documented setup command for this repository.

- 0001–0005: profiles, role helpers, stakeholder groups, events, ticket links/activity, referral view.
- 0006: removes direct client activity insertion and anonymous referral enumeration.
- 0007: saves event fields and group audience atomically under RLS.

See [database setup](docs/database.md) for inspection SQL and the initial ADMIN promotion. Never apply the local-only sample seed to a shared Preview or production database. A service-role REST key is not database DDL access.

## Validation

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
npm run start
node scripts/smoke.mjs http://localhost:3000
```

The test suite executes SQL migrations in isolated PGlite/PostgreSQL and tests security, event visibility, local-time conversion, ICS output, and the actual referral route against mocked HTTP responses. These tests do not verify the connected Supabase project.

`npm run verify:backend` performs read-only checks using `.env.local`. Preview builds run the same diagnostic automatically and print object names/status codes only. Diagnostics are deliberately non-blocking so an external backend problem does not prevent review of the public shell; inspect every BLOCKED line before a demo.

The smoke script returns a nonzero exit code for unavailable backend features. It checks safe GET routes only and accepts BASE_URL or a positional URL. For a protected Vercel Preview, use `vercel curl` or an already-authorized browser. Do not disable deployment protection. An existing VERCEL_AUTOMATION_BYPASS_SECRET can be supplied through the environment when using the smoke script; never commit or print it.

## Preview workflow and CI

Use a feature branch and normal Git integration. GitHub Actions runs npm ci, lint, TypeScript, tests, and a build without production credentials. Vercel Preview is the full environment gate, including runtime and browser checks. Push logical commits, verify the exact deployed SHA, open a PR, and leave it unmerged for human review. Never run a production deployment as part of Phase 1 hardening.

## Decisions and handoff

- [Authentication and redirects](docs/authentication.md)
- [Roles, groups, RLS, and public signup exposure](docs/permissions.md)
- [External ticketing and click tracking](docs/ticketing.md)
- [OptimX migration constraints](docs/optimx-migration-notes.md)

Public signup still creates MEMBER profiles. MEMBER currently grants access to member-only events and authenticated name/role/group directories at the database layer; it is not proof of approved club membership. Stakeholders must decide whether approval/invitation is needed before sensitive information is entered. No new role or approval model was silently introduced.
