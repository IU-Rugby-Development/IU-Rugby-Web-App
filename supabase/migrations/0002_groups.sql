-- Groups describe WHO a person is (PLAYER, PARENT, ALUMNI, SUPPORTER,
-- SPONSOR). A user can belong to any number of groups. This is
-- intentionally separate from profiles.role, which controls WHAT a
-- user may do.

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (
    name in ('PLAYER', 'PARENT', 'ALUMNI', 'SUPPORTER', 'SPONSOR')
  ),
  description text
);

insert into public.groups (name, description) values
  ('PLAYER', 'Current roster player'),
  ('PARENT', 'Parent of a current or former player'),
  ('ALUMNI', 'Former player or team member'),
  ('SUPPORTER', 'General supporter of the program'),
  ('SPONSOR', 'Financial or in-kind sponsor');

create table public.group_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  group_id uuid not null references public.groups (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, group_id)
);

create index group_memberships_user_id_idx on public.group_memberships (user_id);
create index group_memberships_group_id_idx on public.group_memberships (group_id);

alter table public.groups enable row level security;
alter table public.group_memberships enable row level security;

-- Helper: is a given user in a given group (by name)?
create function public.is_in_group(uid uuid, group_name text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.group_memberships gm
    join public.groups g on g.id = gm.group_id
    where gm.user_id = uid and g.name = group_name
  );
$$;

-- RLS: groups (reference table) ------------------------------------------

create policy "groups_select_authenticated"
on public.groups for select
to authenticated
using (true);

create policy "groups_write_admin"
on public.groups for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- RLS: group_memberships --------------------------------------------------

-- Everyone can see membership rows (needed for rosters, "who's a PLAYER"
-- checks in the UI, etc.) — membership in a public-facing group is not
-- sensitive information for this application.
create policy "group_memberships_select_authenticated"
on public.group_memberships for select
to authenticated
using (true);

-- Only admins can assign/remove group membership. Users may never grant
-- themselves group membership (e.g. self-assigning PLAYER to unlock a
-- referral link).
create policy "group_memberships_write_admin"
on public.group_memberships for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
