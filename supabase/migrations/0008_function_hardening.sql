-- Verified against the live function signatures and policies on 2026-09-17.
-- All policies calling these helpers are TO authenticated. The anonymous
-- public-event policy does not call them. Keep authenticated RLS access.
alter function public.set_updated_at() set search_path = pg_catalog, public;
alter function public.handle_new_user() set search_path = pg_catalog, public;
alter function public.is_admin(uuid) set search_path = pg_catalog, public;
alter function public.is_executive_or_admin(uuid) set search_path = pg_catalog, public;
alter function public.is_in_group(uuid, text) set search_path = pg_catalog, public;

-- Trigger execution does not require direct client EXECUTE permission.
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;
revoke all on function public.is_executive_or_admin(uuid) from public, anon;
grant execute on function public.is_executive_or_admin(uuid) to authenticated;
revoke all on function public.is_in_group(uuid, text) from public, anon;
grant execute on function public.is_in_group(uuid, text) to authenticated;
