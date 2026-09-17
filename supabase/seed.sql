-- Optional seed data for local development only.
-- Apply manually only to an isolated local database after migrations.
-- No Supabase CLI project configuration is included. Never add real member data.
-- Groups are already seeded by 0002_groups.sql; this just adds sample
-- public content so the homepage/calendar aren't empty locally.

insert into public.events (title, description, event_type, location, starts_at, ends_at, visibility, created_by)
select
  'Local example event (not a real fixture)',
  'Synthetic local development content. Do not publish.',
  'GAME',
  'Example location',
  now() + interval '14 days',
  now() + interval '14 days 2 hours',
  'PUBLIC',
  p.id
from public.profiles p
where p.role = 'ADMIN'
limit 1;
