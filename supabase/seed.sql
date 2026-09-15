-- Optional seed data for local development only.
-- Run automatically by `supabase db reset`. Never put real member data here.
-- Groups are already seeded by 0002_groups.sql; this just adds sample
-- public content so the homepage/calendar aren't empty locally.

insert into public.events (title, description, event_type, location, starts_at, ends_at, visibility, created_by)
select
  'Season Opener vs. Purdue',
  'First home match of the season.',
  'GAME',
  'IU Rugby Field',
  now() + interval '14 days',
  now() + interval '14 days 2 hours',
  'PUBLIC',
  p.id
from public.profiles p
where p.role = 'ADMIN'
limit 1;
