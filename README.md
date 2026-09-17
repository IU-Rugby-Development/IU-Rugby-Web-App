# IU Rugby web application

Phase 1 MVP for IU Men's Rugby and Friends of Hoosier Rugby. The existing [iurugby.com](https://www.iurugby.com/) website remains live and unchanged. Development stays on `phase1/mvp-hardening` in draft PR #1; no merge, production deployment or DNS cutover is authorized.

Supabase Auth, Resend SMTP, the calendar schema and referral infrastructure are connected. Migrations 0001–0008 are applied. Signup confirmation now uses an explicit app POST to protect against email-link GET prefetching. See [the engineering report](docs/phase1-report.md) for current deployment evidence and remaining live checks.

## Scope and architecture

Next.js 16.3.5 App Router, React 19.2.8, TypeScript, Tailwind 4, Supabase and Vercel; Node.js 24. No framework rewrite or new runtime dependencies.

- Signup, email confirmation, password sign-in, profile editing and a role-aware dashboard.
- MEMBER / EXECUTIVE / ADMIN permissions, separate from PLAYER / PARENT / ALUMNI / SUPPORTER / SPONSOR stakeholder groups.
- Public/member/group events, staff event management and ICS exports.
- Admin user roles/groups and player referral-link management.
- External [Kuntz ticket access](https://tickets.kuntzstadium.com/section/rugby-luu0) and click-based referral statistics. Clicks are not purchases, sales, unique people or revenue.

Donate, Watch and Sponsors placeholder routes remain outside primary navigation. No invented schedule, roster, sponsor content or copied OptimX assets. Custom payments and purchase attribution are outside Phase 1.

## Local setup

```sh
npm ci
npm run dev
```

Use an ignored `.env.local` with the fields in `.env.example`. Vercel's sensitive-variable export currently produces placeholders; those cannot authenticate locally. The user chose Preview verification instead of supplying local secrets. Do not paste credentials into chat or logs. Set local `NEXT_PUBLIC_SITE_URL=http://localhost:3000` and avoid copying Vercel Preview system variables into a local environment.

| Variable | Purpose |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | Existing project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public API key; RLS governs access |
| SUPABASE_SERVICE_ROLE_KEY | Server-only referral recording and ADMIN-authorized email directory |
| NEXT_PUBLIC_SITE_URL | Approved canonical origin for non-Preview links |

Vercel project `prj_E2fb1P3TTvEHIMo1ENG7OY8Ypt1e`, team `lreddells-projects`. Supabase project `pkbdrvovnnlrircmtaym`. Check the existing `.vercel/project.json` before remote actions. Do not create replacement projects, replay existing migrations, or run the sample seed against shared systems.

## Validation and deployment

```sh
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
```

GitHub Actions runs these checks without production secrets. Tests include isolated PostgreSQL RLS and actual confirmation/referral handlers with mocked HTTP. Vercel Preview additionally runs the read-only backend verifier; unavailable configuration, tables, views, functions or Auth now fail the build. A successful build still requires live HTTP/browser validation.

`npm run verify:backend` uses local environment values when available. `node scripts/smoke.mjs <base-url>` checks safe public/protected GET routes. Protected Preview checks use normal Vercel authorization; never disable deployment protection or print bypass tokens.

[Branch Preview](https://iu-rugby-web-app-git-phase1-mvp-hardening-lreddells-projects.vercel.app) · [Draft PR #1](https://github.com/IU-Rugby-Development/IU-Rugby-Web-App/pull/1)

## Documentation

- [Engineering report and demo checklist](docs/phase1-report.md)
- [Authentication, hosted template and redirect configuration](docs/authentication.md)
- [Database migrations and advisor findings](docs/database.md)
- [Permissions and public signup policy](docs/permissions.md)
- [External ticketing and click semantics](docs/ticketing.md)
- [OptimX migration constraints](docs/optimx-migration-notes.md)

Public signup continues to create MEMBER with no automatic SUPPORTER assignment. MEMBER access is not proof of approved club membership; stakeholder policy must be settled before adding sensitive member-only content.
