-- The referral route uses the service role after validating the active code.
-- Direct client inserts otherwise allow fabricated CLICK and PURCHASE activity.
drop policy if exists "ticket_activity_insert_public" on public.ticket_activity;
revoke insert, update, delete on public.ticket_activity from anon, authenticated;

-- Public visitors do not need a roster of referral codes/player UUIDs.
drop policy if exists "ticket_links_select_public_active" on public.ticket_links;
revoke select on public.ticket_links from anon;
