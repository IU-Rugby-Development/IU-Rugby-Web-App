create table public.ticket_links (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles (id) on delete cascade,
  code text not null unique,
  destination_url text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint code_format check (code ~ '^[a-z0-9_-]{3,32}$')
);

create index ticket_links_player_id_idx on public.ticket_links (player_id);

-- CLICK is recorded today. PURCHASE is included now so the schema does
-- not need to change if/when the external ticket vendor exposes a
-- webhook or promo-code system for real attribution later.
create table public.ticket_activity (
  id uuid primary key default gen_random_uuid(),
  ticket_link_id uuid not null references public.ticket_links (id) on delete cascade,
  event_id uuid references public.events (id) on delete set null,
  activity_type text not null default 'CLICK' check (
    activity_type in ('CLICK', 'PURCHASE')
  ),
  created_at timestamptz not null default now()
);

create index ticket_activity_ticket_link_id_idx on public.ticket_activity (ticket_link_id);
create index ticket_activity_created_at_idx on public.ticket_activity (created_at);

alter table public.ticket_links enable row level security;
alter table public.ticket_activity enable row level security;

-- RLS: ticket_links ---------------------------------------------------------

-- A link needs to be publicly resolvable (an anonymous visitor hitting
-- /tickets/[code] must be able to look up an *active* code to redirect
-- them). Inactive codes are never exposed to anon.
create policy "ticket_links_select_public_active"
on public.ticket_links for select
to anon, authenticated
using (active = true);

-- Players can see their own link even if deactivated.
create policy "ticket_links_select_own"
on public.ticket_links for select
to authenticated
using (player_id = auth.uid());

-- Staff can see all links.
create policy "ticket_links_select_staff"
on public.ticket_links for select
to authenticated
using (public.is_executive_or_admin(auth.uid()));

-- Only admins create/edit/deactivate ticket links (including reassigning
-- them) — a player must never be able to edit another player's link.
create policy "ticket_links_write_admin"
on public.ticket_links for all
to authenticated
using (public.is_admin(auth.uid()))
with check (public.is_admin(auth.uid()));

-- RLS: ticket_activity --------------------------------------------------------

-- Anyone (including anonymous visitors, via the redirect route using the
-- anon key) can INSERT a click row — that's how referral tracking works.
-- They can only attach it to a link that is actually active.
create policy "ticket_activity_insert_public"
on public.ticket_activity for insert
to anon, authenticated
with check (
  exists (
    select 1 from public.ticket_links tl
    where tl.id = ticket_activity.ticket_link_id and tl.active = true
  )
);

-- Players may read only the activity for their own link(s) — never
-- another player's private analytics.
create policy "ticket_activity_select_own"
on public.ticket_activity for select
to authenticated
using (
  exists (
    select 1 from public.ticket_links tl
    where tl.id = ticket_activity.ticket_link_id
      and tl.player_id = auth.uid()
  )
);

-- Executives/admins may read all activity, for the leaderboard and
-- broader analytics.
create policy "ticket_activity_select_staff"
on public.ticket_activity for select
to authenticated
using (public.is_executive_or_admin(auth.uid()));

-- Nobody updates/deletes activity rows from the client — they're an
-- append-only log. (Admins can still do so via the service-role client
-- if a correction is ever genuinely needed.)
