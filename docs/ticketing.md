# Ticketing

## Current provider

The [Kuntz Stadium ticket storefront](https://tickets.kuntzstadium.com/) is powered by vivenu. Phase 1 sends visitors to its [Indiana Rugby collection](https://tickets.kuntzstadium.com/section/rugby-luu0), verified through the storefront navigation on September 17, 2026. This is a collection of IU Rugby events, not a temporary game checkout or session URL. Ticket selection, payment, promo-code usage and confirmed sales reporting remain Kuntz-managed.

## Embed decision: not recommended

A HEAD request with redirects followed on September 17, 2026 returned HTTP 200. The observed response did not include X-Frame-Options or a Content-Security-Policy frame-ancestors directive. Their absence does **not** explicitly authorize or guarantee a supported embedded checkout. No provider permission or successful embedded payment/auth flow was established, so Phase 1 uses ordinary external navigation. No framing protection was bypassed and no checkout transaction was attempted.

## Referral tracking

/tickets/{code} validates the code, uses a server-only service-role client to find an active link, checks its URL, attempts to insert one CLICK, and redirects with a non-cacheable 302. Invalid/inactive/unsafe codes go to the ticket page. Missing backend configuration goes to the direct-ticket fallback. Logging failure does not block the ticket handoff.

Only HTTPS URLs whose parsed hostname is exactly tickets.kuntzstadium.com are accepted. Userinfo and nondefault ports are rejected. Validation runs on creation, reactivation and immediately before redirect. Administrators can create links only for current PLAYER-group members.

HEAD requests do not create clicks. GET requests can still include bots, previews, refreshes and repeat visits; counts are traffic, not unique users, purchases, tickets sold, or revenue. No fingerprinting or personal request metadata is stored.

The personal tool displays the newest active link, or the newest inactive link if none is active. Staff can see the referral traffic overview; ordinary members do not see a misleading cross-player ranking.

The actual route is covered by offline HTTP-mock tests for active, invalid/inactive, unsafe, insertion-failure, HEAD and missing-configuration cases. Live clicks remain unverified until credentials and migrations are available. No purchase events were fabricated. PURCHASE remains in the historical schema solely as a deferred capability; client writes are revoked by migration 0006.

## Future options

Only if stakeholder value justifies it, request an official reporting export, API, supported referral metadata, or webhook from Kuntz/vivenu. No custom payment system is planned for Phase 1 and API access is not an MVP requirement.
