-- security_invoker means this view runs with the *querying user's*
-- permissions, not the view owner's — so the underlying RLS policies on
-- ticket_activity/ticket_links still apply. A plain MEMBER querying this
-- view only ever gets rows for their own referral link (from
-- ticket_activity_select_own); staff get everyone (ticket_activity_select_staff).
create view public.referral_leaderboard
with (security_invoker = true) as
select
  tl.id as ticket_link_id,
  tl.player_id,
  p.first_name,
  p.last_name,
  tl.code,
  count(ta.id) filter (where ta.activity_type = 'CLICK') as referral_clicks
from public.ticket_links tl
join public.profiles p on p.id = tl.player_id
left join public.ticket_activity ta on ta.ticket_link_id = tl.id
where tl.active = true
group by tl.id, tl.player_id, p.first_name, p.last_name, tl.code;
