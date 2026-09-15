create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text not null check (
    event_type in ('GAME', 'PRACTICE', 'EVENT', 'FUNDRAISER', 'MEETING', 'OTHER')
  ),
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  -- PUBLIC: visible to everyone, including signed-out visitors
  -- MEMBERS: visible to any authenticated user
  -- GROUPS: visible only to authenticated users in one of the linked
  --         event_groups (e.g. a PLAYER-only team meeting)
  visibility text not null default 'PUBLIC' check (
    visibility in ('PUBLIC', 'MEMBERS', 'GROUPS')
  ),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_starts_at_idx on public.events (starts_at);
create index events_visibility_idx on public.events (visibility);

create trigger events_set_updated_at
before update on public.events
for each row execute function public.set_updated_at();

create table public.event_groups (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  unique (event_id, group_id)
);

alter table public.events enable row level security;
alter table public.event_groups enable row level security;

-- RLS: events --------------------------------------------------------------

-- Public events are visible to everyone, signed in or not.
create policy "events_select_public"
on public.events for select
to anon, authenticated
using (visibility = 'PUBLIC');

-- Members-only events are visible to any signed-in user.
create policy "events_select_members"
on public.events for select
to authenticated
using (visibility = 'MEMBERS');

-- Group-restricted events are visible only to authenticated users who
-- belong to at least one of the event's linked groups.
create policy "events_select_groups"
on public.events for select
to authenticated
using (
  visibility = 'GROUPS'
  and exists (
    select 1
    from public.event_groups eg
    where eg.event_id = events.id
      and public.is_in_group(
        auth.uid(),
        (select name from public.groups g where g.id = eg.group_id)
      )
  )
);

-- Executives and admins can always see everything (for management screens).
create policy "events_select_staff"
on public.events for select
to authenticated
using (public.is_executive_or_admin(auth.uid()));

-- Only executives/admins may create, edit, or delete events.
create policy "events_write_staff"
on public.events for all
to authenticated
using (public.is_executive_or_admin(auth.uid()))
with check (public.is_executive_or_admin(auth.uid()));

-- RLS: event_groups ----------------------------------------------------------

create policy "event_groups_select_staff_or_targeted"
on public.event_groups for select
to authenticated
using (
  public.is_executive_or_admin(auth.uid())
  or public.is_in_group(
    auth.uid(),
    (select name from public.groups g where g.id = event_groups.group_id)
  )
);

create policy "event_groups_write_staff"
on public.event_groups for all
to authenticated
using (public.is_executive_or_admin(auth.uid()))
with check (public.is_executive_or_admin(auth.uid()));
