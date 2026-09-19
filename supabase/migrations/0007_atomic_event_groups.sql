-- Save event details and their audience in one transaction under the caller's RLS.
-- No service-role privilege is used by this function.
alter table public.events add constraint events_end_after_start
  check (ends_at is null or ends_at > starts_at) not valid;

create function public.save_event(
  p_event_id uuid,
  p_title text,
  p_description text,
  p_event_type text,
  p_location text,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_visibility text,
  p_group_ids uuid[]
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if not public.is_executive_or_admin(auth.uid()) then
    raise exception 'Event management requires staff access' using errcode = '42501';
  end if;
  if p_title is null or length(btrim(p_title)) < 1 or length(p_title) > 200 then
    raise exception 'Invalid event title' using errcode = '22023';
  end if;
  if p_starts_at is null or (p_ends_at is not null and p_ends_at <= p_starts_at) then
    raise exception 'Invalid event times' using errcode = '22023';
  end if;
  if p_visibility = 'GROUPS' and coalesce(cardinality(p_group_ids), 0) = 0 then
    raise exception 'Choose at least one group' using errcode = '22023';
  end if;
  if p_visibility = 'GROUPS' and exists (
    select 1 from unnest(p_group_ids) as chosen(id)
    where not exists (select 1 from public.groups g where g.id = chosen.id)
  ) then
    raise exception 'Invalid target group' using errcode = '22023';
  end if;

  if p_event_id is null then
    insert into public.events (title, description, event_type, location, starts_at, ends_at, visibility, created_by)
    values (btrim(p_title), p_description, p_event_type, p_location, p_starts_at, p_ends_at, p_visibility, auth.uid())
    returning id into saved_id;
  else
    update public.events set title = btrim(p_title), description = p_description,
      event_type = p_event_type, location = p_location, starts_at = p_starts_at,
      ends_at = p_ends_at, visibility = p_visibility
    where id = p_event_id returning id into saved_id;
    if saved_id is null then
      raise exception 'Event not found' using errcode = 'P0002';
    end if;
  end if;

  delete from public.event_groups where event_id = saved_id;
  if p_visibility = 'GROUPS' then
    insert into public.event_groups (event_id, group_id)
      select saved_id, id from (select distinct unnest(p_group_ids) as id) chosen;
  end if;
  return saved_id;
end;
$$;

revoke all on function public.save_event(uuid, text, text, text, text, timestamptz, timestamptz, text, uuid[]) from public, anon;
grant execute on function public.save_event(uuid, text, text, text, text, timestamptz, timestamptz, text, uuid[]) to authenticated;
