-- CRUX: the room (live chat + who's here) and live usage numbers.
--
-- Run once against the project: paste into the Supabase SQL editor, or link
-- the project with the Supabase CLI and run `supabase db push`.
--
-- The app only ever uses the public (anon) key, so every permission it has is
-- spelled out here as a row-level-security policy. Nothing identifies a person:
-- visitor_id is a random id made in the browser, name is "tired koala".

create extension if not exists pgcrypto;

-- ── Tables ───────────────────────────────────────────────────────────────────

-- One row per app open. Insert only; never updated or read directly.
create table if not exists public.visits (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  uuid not null,
  name        text not null check (char_length(name) between 3 and 40),
  started_at  timestamptz not null default now()
);
create index if not exists visits_started_at_idx on public.visits (started_at);
create index if not exists visits_visitor_idx    on public.visits (visitor_id, started_at);

-- One row per finished tool run (a track, a noise, a breathing session).
create table if not exists public.plays (
  id          uuid primary key default gen_random_uuid(),
  visitor_id  uuid not null,
  tool        text not null check (char_length(tool) between 1 and 40),
  item        text not null check (char_length(item) between 1 and 80),
  seconds     integer not null check (seconds between 0 and 86400),
  created_at  timestamptz not null default now()
);
create index if not exists plays_created_at_idx on public.plays (created_at);

-- The room. Rows older than 24 hours are invisible to the app (see the select
-- policy); delete them with the optional cron job at the bottom.
create table if not exists public.messages (
  id          bigint generated always as identity primary key,
  visitor_id  uuid not null,
  name        text not null check (char_length(name) between 3 and 40),
  body        text not null check (char_length(body) between 1 and 280),
  created_at  timestamptz not null default now()
);
create index if not exists messages_created_at_idx on public.messages (created_at desc);

-- "Report" button. One report per person per message.
create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  message_id  bigint not null references public.messages (id) on delete cascade,
  reporter_id uuid not null,
  created_at  timestamptz not null default now(),
  unique (message_id, reporter_id)
);

-- ── Row-level security ───────────────────────────────────────────────────────

alter table public.visits   enable row level security;
alter table public.plays    enable row level security;
alter table public.messages enable row level security;
alter table public.reports  enable row level security;

drop policy if exists "anyone can log a visit"  on public.visits;
drop policy if exists "anyone can log a play"   on public.plays;
drop policy if exists "anyone can post"         on public.messages;
drop policy if exists "read the last 24 hours"  on public.messages;
drop policy if exists "anyone can report"       on public.reports;

create policy "anyone can log a visit" on public.visits
  for insert to anon with check (true);

create policy "anyone can log a play" on public.plays
  for insert to anon with check (true);

create policy "anyone can post" on public.messages
  for insert to anon with check (true);

create policy "read the last 24 hours" on public.messages
  for select to anon using (created_at > now() - interval '24 hours');

create policy "anyone can report" on public.reports
  for insert to anon with check (true);

-- No select policy on visits, plays or reports: the app only sees aggregates,
-- through live_stats() below.

-- ── Guard rails on messages ──────────────────────────────────────────────────
-- Rate limit, strip links / emails / phone numbers, mask the worst words.
-- Keep the word list identical to src/lib/roomRules.ts.

create or replace function public.guard_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recent  integer;
  blocked text[] := array[
    'fuck', 'fucking', 'fucked', 'fucker', 'motherfucker', 'cunt', 'cunts',
    'faggot', 'fag', 'nigger', 'nigga', 'retard', 'retarded', 'whore', 'slut',
    'kike', 'chink', 'spic', 'tranny', 'twat'
  ];
  w text;
begin
  select count(*) into recent
    from public.messages
   where visitor_id = new.visitor_id
     and created_at > now() - interval '10 seconds';
  if recent >= 2 then
    raise exception 'slow down' using errcode = 'P0001';
  end if;

  new.body := regexp_replace(new.body, '(https?://|www\.)\S+', '[link removed]', 'gi');
  new.body := regexp_replace(new.body, '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}', '[email removed]', 'g');
  new.body := regexp_replace(new.body, '\+?\d[\d\s().-]{7,}\d', '[number removed]', 'g');

  foreach w in array blocked loop
    new.body := regexp_replace(new.body, '\m' || w || '\M', repeat('*', char_length(w)), 'gi');
  end loop;

  new.body := btrim(regexp_replace(new.body, '\s+', ' ', 'g'));
  if new.body = '' then
    raise exception 'empty message' using errcode = 'P0001';
  end if;

  new.name := lower(btrim(new.name));
  if new.name !~ '^[a-z][a-z -]{2,39}$' then
    raise exception 'bad name' using errcode = 'P0001';
  end if;

  return new;
end
$$;

drop trigger if exists messages_guard on public.messages;
create trigger messages_guard
  before insert on public.messages
  for each row execute function public.guard_message();

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- New messages reach every open room instantly. Presence ("who's here") needs
-- no table; it runs over the same realtime channel.

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end
$$;

-- ── Live numbers for the About page ──────────────────────────────────────────
-- Everything the page shows comes from this one call. Days are Sydney time.

create or replace function public.live_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  with days as (
    select generate_series(
      (now() at time zone 'Australia/Sydney')::date - 89,
      (now() at time zone 'Australia/Sydney')::date,
      interval '1 day'
    )::date as day
  ),
  per_day as (
    select (started_at at time zone 'Australia/Sydney')::date as day,
           count(distinct visitor_id) as visitors
      from public.visits
     where started_at > now() - interval '91 days'
     group by 1
  )
  select json_build_object(
    'daily', (
      select json_agg(json_build_object('day', d.day, 'visitors', coalesce(p.visitors, 0)) order by d.day)
        from days d
        left join per_day p on p.day = d.day
    ),
    'visitors_7d',  (select count(distinct visitor_id) from public.visits where started_at > now() - interval '7 days'),
    'visitors_30d', (select count(distinct visitor_id) from public.visits where started_at > now() - interval '30 days'),
    'visitors_90d', (select count(distinct visitor_id) from public.visits where started_at > now() - interval '90 days'),
    'total_visits', (select count(*) from public.visits),
    'total_play_hours', (select coalesce(round(sum(seconds) / 3600.0, 1), 0) from public.plays),
    'top_played', (
      select coalesce(json_agg(t), '[]'::json)
        from (
          select tool, item, sum(seconds)::integer as seconds, count(*)::integer as plays
            from public.plays
           where created_at > now() - interval '30 days'
           group by tool, item
           order by sum(seconds) desc
           limit 3
        ) t
    )
  )
$$;

revoke all on function public.live_stats() from public;
grant execute on function public.live_stats() to anon, authenticated;

-- ── Optional housekeeping ────────────────────────────────────────────────────
-- Messages are hidden after 24 hours by the select policy. To actually delete
-- them, enable the pg_cron extension (Database → Extensions) and run:
--
--   select cron.schedule(
--     'crux-room-cleanup', '17 * * * *',
--     $$ delete from public.messages where created_at < now() - interval '24 hours' $$
--   );
