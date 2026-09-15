-- Profiles: one application profile per auth.users row.
-- Role lives here (WHAT a user can do). Groups live in a separate
-- many-to-many table (WHO a user is) — see 0002_groups.sql.

create type public.app_role as enum ('MEMBER', 'EXECUTIVE', 'ADMIN');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  role public.app_role not null default 'MEMBER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- keep updated_at current on every update
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- Automatically create a profile row whenever a new auth user signs up.
-- Runs as the function owner (postgres), so it can insert despite RLS.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Role-check helpers used across every table's RLS policies.
-- security definer + fixed search_path so they can read profiles
-- regardless of the caller's own RLS visibility, and so callers can't
-- shadow "public" to hijack the function body.
create function public.is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role = 'ADMIN'
  );
$$;

create function public.is_executive_or_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = uid and role in ('EXECUTIVE', 'ADMIN')
  );
$$;

-- RLS policies -----------------------------------------------------------

-- Everyone who is signed in can read every profile. The app needs this for
-- rosters, the leaderboard (player names), and admin screens — profiles
-- contain no sensitive data beyond name/role. Tighten this later if the
-- team adds sensitive fields (phone, address, etc.) to this table.
create policy "profiles_select_authenticated"
on public.profiles for select
to authenticated
using (true);

-- Users may update their own name, but never their own role.
-- (Column-level enforcement happens in the "profiles_role_immutable_for_self"
-- policy below by re-checking role against the existing row.)
create policy "profiles_update_own_non_role_fields"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select role from public.profiles where id = auth.uid())
);

-- Admins may update anyone's profile, including role.
create policy "profiles_update_admin"
on public.profiles for update
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));
