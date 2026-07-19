-- Open signup + private per-user realtime sync.
-- Keeps the existing beta_access_status column for backwards compatibility,
-- but every authenticated user is provisioned as active automatically.

create or replace function private.provision_active_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  insert into public.profiles (
    id,
    display_name,
    beta_access_status,
    beta_approved_at
  )
  values (
    new.id,
    nullif(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'), ''),
    'active',
    now()
  )
  on conflict (id) do update
    set beta_access_status = 'active',
        beta_approved_at = coalesce(public.profiles.beta_approved_at, now());

  insert into public.workspace_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notification_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

revoke all on function private.provision_active_user() from public;

drop trigger if exists provision_active_user_after_signup on auth.users;
create trigger provision_active_user_after_signup
after insert on auth.users
for each row execute function private.provision_active_user();

-- Backfill and activate every account that already exists.
insert into public.profiles (id, display_name, beta_access_status, beta_approved_at)
select
  user_row.id,
  nullif(coalesce(user_row.raw_user_meta_data ->> 'full_name', user_row.raw_user_meta_data ->> 'name'), ''),
  'active',
  now()
from auth.users as user_row
on conflict (id) do update
  set beta_access_status = 'active',
      beta_approved_at = coalesce(public.profiles.beta_approved_at, now());

insert into public.workspace_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.notification_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Daily minutes earned from visible app activity. Completed focus sessions stay
-- in study_sessions and are combined with these rows when rendering totals.
create table if not exists public.daily_activity (
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date not null,
  active_seconds integer not null default 0 check (active_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, activity_date)
);

alter table public.daily_activity enable row level security;

drop policy if exists "daily activity own active user" on public.daily_activity;
create policy "daily activity own active user" on public.daily_activity
for all to authenticated
using (user_id = auth.uid() and private.is_active_beta_user())
with check (user_id = auth.uid() and private.is_active_beta_user());

drop trigger if exists set_daily_activity_updated_at on public.daily_activity;
create trigger set_daily_activity_updated_at
before update on public.daily_activity
for each row execute function public.set_updated_at();

create or replace function public.add_daily_activity_seconds(
  p_activity_date date,
  p_seconds integer,
  p_client_mutation_id uuid
)
returns table (activity_date date, active_seconds integer, updated_at timestamptz)
language plpgsql
security definer
set search_path = private, public
as $$
declare
  current_user_id uuid := auth.uid();
  acknowledgement_count integer;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;
  if not private.is_active_beta_user(current_user_id) then
    raise exception 'Active account required';
  end if;
  if p_activity_date is null or p_seconds is null or p_seconds <= 0 or p_seconds > 600 then
    raise exception 'Activity increment must be between 1 and 600 seconds';
  end if;

  insert into public.offline_mutation_acks (
    user_id,
    client_mutation_id,
    entity_type
  )
  values (
    current_user_id,
    p_client_mutation_id,
    'daily_activity'
  )
  on conflict (user_id, client_mutation_id) do nothing;

  get diagnostics acknowledgement_count = row_count;

  if acknowledgement_count = 1 then
    insert into public.daily_activity (user_id, activity_date, active_seconds)
    values (current_user_id, p_activity_date, p_seconds)
    on conflict (user_id, activity_date) do update
      set active_seconds = public.daily_activity.active_seconds + excluded.active_seconds,
          updated_at = now();
  end if;

  return query
  select row.activity_date, row.active_seconds, row.updated_at
  from public.daily_activity as row
  where row.user_id = current_user_id
    and row.activity_date = p_activity_date;
end;
$$;

revoke all on function public.add_daily_activity_seconds(date, integer, uuid) from public;
grant execute on function public.add_daily_activity_seconds(date, integer, uuid) to authenticated;

-- Realtime still respects RLS. Only an authenticated user's own rows are sent.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'workspace_preferences',
    'study_sessions',
    'daily_activity',
    'syllabus_progress',
    'pdfs',
    'notes',
    'goals',
    'reflections',
    'revision_items',
    'mistakes',
    'notification_preferences',
    'circles',
    'circle_memberships',
    'circle_sessions',
    'circle_check_ins'
  ] loop
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;

alter table public.study_sessions replica identity full;
alter table public.daily_activity replica identity full;
alter table public.syllabus_progress replica identity full;
alter table public.pdfs replica identity full;
alter table public.notes replica identity full;
alter table public.goals replica identity full;
alter table public.reflections replica identity full;
alter table public.revision_items replica identity full;
alter table public.mistakes replica identity full;
