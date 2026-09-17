# Authentication

Supabase Auth and custom Resend SMTP are live on project `pkbdrvovnnlrircmtaym`. The sender is IU Rugby <accounts@auth.loganreddell.com>. Secrets remain in Vercel and ignored local environment files.

## Scanner-resistant signup confirmation

Email security scanners consumed the old direct Supabase ConfirmationURL before the intended click. Supabase documents this [email-prefetch failure mode](https://supabase.com/docs/guides/auth/auth-email-templates#email-prefetching).

The replacement flow:

1. Signup and resend pass the trusted application `/confirm-signup` URL as `emailRedirectTo`. Preview always chooses the stable branch alias, so a rotating deployment allowlist and PKCE cookie are unnecessary for this flow.
2. The hosted Confirm sign up template uses `TokenHash` and `RedirectTo`, not `ConfirmationURL`. The complete, versioned HTML is [confirm-signup.html](../supabase/templates/confirm-signup.html). Subject: **Confirm your IU Rugby account**.
3. GET `/confirm-signup?token_hash=...&type=email` validates the input format, stores a ten-minute HTTP-only, SameSite=Lax cookie scoped to `/confirm-signup`, and redirects to `/confirm-signup/review`. HTTPS cookies are Secure. GET and HEAD never verify a token.
4. The review screen has a normal HTML POST form. Only explicit submission calls `verifyOtp({ token_hash, type: 'email' })`. POST requires a matching trusted Origin, rejecting cross-site and missing origins.
5. On success the Supabase SSR client writes the authenticated session cookies to the redirect response, clears the temporary token, and opens `/dashboard?confirmed=1`.
6. Used/expired/missing tokens lead to a clean app screen with sign-in, home and resend options. The resend response does not disclose whether an account exists. Provider rate limits are respected.

The review URL and HTML contain no token. Confirmation responses use no-store/no-referrer/noindex controls; the initial email URL still contains a bearer credential and can appear in infrastructure access logs. Do not add query-string logging, analytics, link tracking or third-party content to these pages. This protects against GET prefetching, not a scanner that deliberately submits forms.

The legacy `/auth/callback` remains for PKCE code exchange. Its safe local redirect validation remains in place; failure returns the sign-in page, not provider JSON. Existing emails containing the old direct Supabase URL cannot be rewritten. Confirmed users should sign in; unconfirmed users should request a new email from the app.

## Hosted URL configuration

During Phase 1 the Auth Site URL remains the working branch Preview, so dashboard-generated emails and fallback links stay on the deployed application:

`https://iu-rugby-web-app-git-phase1-mvp-hardening-lreddells-projects.vercel.app`

The allowlist supports:

- `https://iu-rugby-web-app-git-phase1-mvp-hardening-lreddells-projects.vercel.app/**`
- `https://iu-rugby-web-app-lreddells-projects.vercel.app/**`
- `http://localhost:3000/**`

The old exact callback entries may remain as harmless duplicates. The broad team-wide Vercel wildcard is unnecessary. `NEXT_PUBLIC_SITE_URL` is the canonical app origin for non-Preview configuration. Moving the Auth Site URL to the canonical app belongs to the separately approved production release, after that origin serves this code. No iurugby.com/DNS change is part of this work.

## Authorization and validation

Proxy refreshes the session; pages and every mutation verify their own permissions. Roles come from profiles, never client metadata. New signup profiles stay MEMBER with no automatic stakeholder groups. Profile edits only write names. Admin role changes require explicit Save, compare the expected current role, and cannot demote the acting administrator. Groups remain independent from roles. Auth-directory emails are fetched server-side only after verifying ADMIN.

Automated tests exercise actual GET/POST confirmation routes, SSR cookie persistence, expired tokens, malformed inputs, cross-site POST, signup validation and trusted redirects. Database tests apply all migrations and exercise RLS. See [the engineering report](phase1-report.md) for the actual live verification evidence and remaining account-dependent checks; mocked tests are not proof that an email was received and confirmed live.
