# Authentication

The server client uses Supabase SSR cookies and the public API key. Proxy refreshes the verified user session; pages and actions perform their own checks. Client-side hiding is not an authorization boundary.

## Flow

Signup validates names/email/password, sends metadata for the profile trigger, and requests email confirmation. The callback exchanges a PKCE code for a session; sign-in redirects to a real dashboard route. Sign-out invalidates the session and refreshes navigation. Both callback next and sign-in redirectTo accept only safe local paths, rejecting protocol-relative, backslash, control-character and encoded variants.

For Preview, email confirmation preserves the browser's Origin only when it exactly matches VERCEL_BRANCH_URL or VERCEL_URL. This keeps the PKCE verifier cookie and callback on the same host whether signup starts on the branch alias or immutable deployment. Other supplied origins cannot become redirect destinations. Referral links default to the stable branch alias when available. Vercel documents these [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables).

Add the exact /auth/callback URLs for the branch alias and tested immutable deployment to Supabase Authentication → URL Configuration before testing; maintain the allowlist as deployments change. Add http://localhost:3000/auth/callback for authorized local development. A team-scoped wildcard is an optional administrative choice; do not broadly allow all vercel.app hosts.

Use the same browser for signup and the email callback because PKCE needs its verifier cookie. Do not disable email confirmation to work around configuration problems. Do not use iurugby.com as this app's origin yet.

## What remains unverified

The live signup → email → callback → dashboard → profile → logout flow, email-confirmation setting, allowed redirects, and existing test accounts remain unverified due to unavailable runtime credentials. No stakeholder credentials were used and no test signup emails were sent.

Missing configuration disables form submission with an accessible unavailable-service message and rejects server actions. Protected routes still redirect to sign-in. This keeps the public information pages available without weakening auth.
