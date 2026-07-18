-- GATE OS public beta: schema only. Catalog records live in the next migration.
-- This migration is intentionally free of project URLs, keys, user defaults, and user data.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.beta_access_status as enum ('invited', 'active', 'suspended');
create type public.goal_period as enum ('daily', 'weekly');
create type public.study_session_status as enum ('active', 'paused', 'completed', 'cancelled');
create type public.circle_member_role as enum ('owner', 'member');
create type public.circle_membership_status as enum ('active', 'left', 'removed');
create type public.circle_session_status as enum ('scheduled', 'active', 'completed', 'cancelled');
create type public.revision_status as enum ('queued', 'completed', 'snoozed', 'archived');
create type public.note_kind as enum ('daily', 'topic', 'freeform');

create table public.exams (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_-]+$'),
  name text not null,
  organizer text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.branches (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9_-]+$'),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (exam_id, code)
);

create table public.exam_versions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  label text not null,
  year smallint not null check (year between 2000 and 2100),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source_url text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, year),
  unique (id, branch_id)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references public.branches(id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9_-]+$'),
  name text not null,
  short_name text,
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, code),
  unique (branch_id, position)
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9_-]+$'),
  name text not null,
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, code),
  unique (subject_id, position)
);

create table public.topics (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections(id) on delete cascade,
  code text not null check (code ~ '^[A-Z0-9_-]+$'),
  name text not null,
  position smallint not null check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section_id, code),
  unique (section_id, position)
);

create table public.exam_version_topics (
  exam_version_id uuid not null references public.exam_versions(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  is_required boolean not null default true,
  position smallint,
  created_at timestamptz not null default now(),
  primary key (exam_version_id, topic_id)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) between 1 and 80),
  timezone text not null default 'Asia/Kolkata',
  target_exam_version_id uuid references public.exam_versions(id) on delete set null,
  preferred_study_window jsonb not null default '{}'::jsonb check (jsonb_typeof(preferred_study_window) = 'object'),
  beta_access_status public.beta_access_status not null default 'invited',
  beta_approved_at timestamptz,
  onboarding_completed_at timestamptz,
  welcome_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((beta_access_status = 'active') = (beta_approved_at is not null))
);

create table public.workspace_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  theme_id text not null default 'editorial-calm' check (theme_id in ('editorial-calm', 'focus-tech', 'soft-personal', 'midnight-paper')),
  font_pair_id text not null default 'editorial' check (char_length(font_pair_id) <= 64),
  accent_id text not null default 'ink' check (char_length(accent_id) <= 64),
  density text not null default 'comfortable' check (density in ('comfortable', 'compact')),
  motion_level text not null default 'full' check (motion_level in ('full', 'subtle', 'reduced')),
  home_layout_preset text not null default 'balanced' check (home_layout_preset in ('focus', 'balanced', 'revision')),
  module_order jsonb not null default '[]'::jsonb check (jsonb_typeof(module_order) = 'array'),
  hidden_modules jsonb not null default '[]'::jsonb check (jsonb_typeof(hidden_modules) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  intention text check (char_length(intention) <= 500),
  reflection text check (char_length(reflection) <= 4000),
  status public.study_session_status not null default 'active',
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  ended_at timestamptz,
  elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status in ('completed', 'cancelled')) = (ended_at is not null))
);

create table public.syllabus_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exam_version_id uuid not null references public.exam_versions(id) on delete cascade,
  topic_id uuid not null references public.topics(id) on delete cascade,
  completed_at timestamptz,
  pyq_ready_at timestamptz,
  confidence smallint check (confidence between 1 and 5),
  note text check (char_length(note) <= 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exam_version_id, topic_id)
);

create table public.pdfs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  title text not null check (char_length(title) between 1 and 240),
  storage_path text not null unique check (storage_path like (user_id::text || '/%')),
  original_filename text not null check (char_length(original_filename) between 1 and 500),
  content_type text not null default 'application/pdf' check (content_type = 'application/pdf'),
  byte_size bigint not null check (byte_size > 0 and byte_size <= 52428800),
  tags text[] not null default '{}'::text[],
  is_pinned boolean not null default false,
  last_read_page integer check (last_read_page > 0),
  cached_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  kind public.note_kind not null default 'freeform',
  title text not null check (char_length(title) between 1 and 240),
  content jsonb not null default '{"type":"doc","content":[]}'::jsonb check (jsonb_typeof(content) = 'object'),
  note_date date,
  is_pinned boolean not null default false,
  archived_at timestamptz,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((kind <> 'daily') or note_date is not null)
);

create unique index notes_one_daily_note_per_user_date
  on public.notes (user_id, note_date)
  where kind = 'daily' and archived_at is null;

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  period public.goal_period not null,
  target_date date not null,
  title text not null check (char_length(title) between 1 and 300),
  completed_at timestamptz,
  sort_order smallint not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  granularity text not null check (granularity in ('hourly', 'daily')),
  subject_id uuid references public.subjects(id) on delete set null,
  content text not null check (char_length(content) between 1 and 8000),
  mood smallint check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.revision_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  note_id uuid references public.notes(id) on delete set null,
  mistake_id uuid,
  source_type text not null check (source_type in ('topic', 'note', 'reflection', 'mistake', 'manual')),
  title text not null check (char_length(title) between 1 and 300),
  due_on date not null,
  completed_at timestamptz,
  status public.revision_status not null default 'queued',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  topic_id uuid references public.topics(id) on delete set null,
  source text check (char_length(source) <= 300),
  concept text not null check (char_length(concept) between 1 and 300),
  mistake_reason text not null check (char_length(mistake_reason) between 1 and 8000),
  corrected_reasoning text not null check (char_length(corrected_reasoning) between 1 and 8000),
  next_review_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.revision_items
  add constraint revision_items_mistake_id_fkey
  foreign key (mistake_id) references public.mistakes(id) on delete set null;

create table public.notification_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  in_app_enabled boolean not null default true,
  browser_enabled boolean not null default false,
  email_summary_enabled boolean not null default false,
  focus_nudges_enabled boolean not null default false,
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text not null default 'Asia/Kolkata',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh_key text not null,
  auth_key text not null,
  expiration_time bigint,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('weekly-summary', 'daily-summary', 'focus-nudge')),
  period_key text not null check (char_length(period_key) between 1 and 40),
  provider_id text,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, kind, period_key)
);

create table public.offline_mutation_acks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_mutation_id uuid not null,
  entity_type text not null check (char_length(entity_type) between 1 and 100),
  entity_id uuid,
  applied_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, client_mutation_id)
);

create table public.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text,
  max_uses integer not null default 1 check (max_uses > 0),
  use_count integer not null default 0 check (use_count >= 0 and use_count <= max_uses),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invite_redemptions (
  invite_id uuid not null references public.invite_codes(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete cascade,
  redeemed_at timestamptz not null default now(),
  primary key (invite_id, user_id),
  unique (user_id)
);

create table public.circles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text check (char_length(description) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.circle_memberships (
  circle_id uuid not null references public.circles(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.circle_member_role not null default 'member',
  status public.circle_membership_status not null default 'active',
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (circle_id, user_id),
  check ((status = 'active') = (left_at is null))
);

create table public.circle_invitations (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  email citext not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > created_at)
);

create table public.circle_sessions (
  id uuid primary key default gen_random_uuid(),
  circle_id uuid not null references public.circles(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  goal text not null check (char_length(goal) between 1 and 500),
  status public.circle_session_status not null default 'scheduled',
  scheduled_for timestamptz,
  started_at timestamptz,
  ends_at timestamptz,
  duration_seconds integer not null check (duration_seconds between 60 and 28800),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'active') = (started_at is not null)),
  check (ends_at is null or started_at is not null)
);

create table public.circle_check_ins (
  id uuid primary key default gen_random_uuid(),
  circle_session_id uuid not null references public.circle_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  completed boolean not null default false,
  note text check (char_length(note) <= 1000),
  reaction text check (reaction in ('focus', 'done', 'break', 'cheer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (circle_session_id, user_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_active_beta_user(candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = candidate_user_id
      and beta_access_status = 'active'
  );
$$;

create or replace function public.is_active_circle_member(candidate_circle_id uuid, candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_active_beta_user(candidate_user_id)
    and exists (
      select 1
      from public.circle_memberships
      where circle_id = candidate_circle_id
        and user_id = candidate_user_id
        and status = 'active'
    );
$$;

create or replace function public.is_circle_owner(candidate_circle_id uuid, candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_active_beta_user(candidate_user_id)
    and exists (
      select 1
      from public.circles
      where id = candidate_circle_id
        and owner_id = candidate_user_id
    );
$$;

create or replace function public.add_circle_owner_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.circle_memberships (circle_id, user_id, role)
  values (new.id, new.owner_id, 'owner')
  on conflict (circle_id, user_id) do update
    set role = 'owner',
        status = 'active',
        left_at = null;
  return new;
end;
$$;

create or replace function public.assert_revision_reference_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.note_id is not null and not exists (
    select 1 from public.notes where id = new.note_id and user_id = new.user_id
  ) then
    raise exception 'Revision notes must belong to the same user';
  end if;

  if new.mistake_id is not null and not exists (
    select 1 from public.mistakes where id = new.mistake_id and user_id = new.user_id
  ) then
    raise exception 'Revision mistakes must belong to the same user';
  end if;

  return new;
end;
$$;

create or replace function public.assert_progress_topic_in_version()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.exam_version_topics
    where exam_version_id = new.exam_version_id
      and topic_id = new.topic_id
  ) then
    raise exception 'Topic is not part of the selected exam version';
  end if;

  return new;
end;
$$;

revoke all on function public.is_active_beta_user(uuid) from public;
revoke all on function public.is_active_circle_member(uuid, uuid) from public;
revoke all on function public.is_circle_owner(uuid, uuid) from public;
grant execute on function public.is_active_beta_user(uuid) to authenticated;
grant execute on function public.is_active_circle_member(uuid, uuid) to authenticated;
grant execute on function public.is_circle_owner(uuid, uuid) to authenticated;

alter table public.invite_redemptions enable row level security;
alter table public.notification_deliveries enable row level security;

create or replace function public.validate_beta_invite(p_code text)
returns table (invite_id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.invite_codes
  where code_hash = encode(digest(lower(trim(p_code)), 'sha256'), 'hex')
    and revoked_at is null
    and (expires_at is null or expires_at > now())
    and use_count < max_uses
  limit 1;
$$;

create or replace function public.consume_beta_invite(p_invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  eligible_invite public.invite_codes%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.invite_redemptions where user_id = current_user_id) then
    return public.is_active_beta_user(current_user_id);
  end if;

  select * into eligible_invite
  from public.invite_codes
  where id = p_invite_id
    and revoked_at is null
    and (expires_at is null or expires_at > now())
    and use_count < max_uses
  for update;

  if eligible_invite.id is null then
    raise exception 'Invitation is no longer active';
  end if;

  insert into public.profiles (id, beta_access_status, beta_approved_at)
  values (current_user_id, 'active', now())
  on conflict (id) do update
    set beta_access_status = 'active',
        beta_approved_at = coalesce(public.profiles.beta_approved_at, now());

  insert into public.workspace_preferences (user_id)
  values (current_user_id)
  on conflict (user_id) do nothing;

  insert into public.invite_redemptions (invite_id, user_id)
  values (eligible_invite.id, current_user_id);

  update public.invite_codes
  set use_count = use_count + 1,
      updated_at = now()
  where id = eligible_invite.id;

  return true;
end;
$$;

create or replace function public.has_active_beta_access()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_active_beta_user(auth.uid());
$$;

revoke all on function public.validate_beta_invite(text) from public;
revoke all on function public.consume_beta_invite(uuid) from public;
revoke all on function public.has_active_beta_access() from public;
grant execute on function public.validate_beta_invite(text) to anon, authenticated;
grant execute on function public.consume_beta_invite(uuid) to authenticated;
grant execute on function public.has_active_beta_access() to authenticated;

create or replace function public.accept_circle_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email citext;
  invitation public.circle_invitations%rowtype;
begin
  if not public.is_active_beta_user(current_user_id) then
    raise exception 'Active beta access required';
  end if;

  select email into current_email from auth.users where id = current_user_id;
  select * into invitation
  from public.circle_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and accepted_at is null
    and revoked_at is null
    and expires_at > now()
  for update;

  if invitation.id is null or invitation.email <> current_email then
    raise exception 'Invitation is invalid for this account';
  end if;

  insert into public.circle_memberships (circle_id, user_id, role, status)
  values (invitation.circle_id, current_user_id, 'member', 'active')
  on conflict (circle_id, user_id) do update set status = 'active', left_at = null;

  update public.circle_invitations set accepted_at = now(), updated_at = now() where id = invitation.id;
  return invitation.circle_id;
end;
$$;

revoke all on function public.accept_circle_invite(text) from public;
grant execute on function public.accept_circle_invite(text) to authenticated;

create or replace function public.enforce_beta_pdf_quota()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_usage bigint;
begin
  select coalesce(sum(byte_size), 0) into current_usage
  from public.pdfs
  where user_id = new.user_id
    and (tg_op = 'INSERT' or id <> new.id);

  if current_usage + new.byte_size > 524288000 then
    raise exception 'The 500 MB beta PDF quota has been reached';
  end if;
  return new;
end;
$$;

create trigger pdfs_enforce_beta_quota
before insert or update of byte_size on public.pdfs
for each row execute function public.enforce_beta_pdf_quota();

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'exams', 'branches', 'exam_versions', 'subjects', 'sections', 'topics',
    'profiles', 'workspace_preferences', 'study_sessions', 'syllabus_progress', 'pdfs',
    'notes', 'goals', 'reflections', 'revision_items', 'mistakes',
    'notification_preferences', 'push_subscriptions', 'offline_mutation_acks',
    'invite_codes', 'circles', 'circle_memberships', 'circle_invitations',
    'circle_sessions', 'circle_check_ins'
  ] loop
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end;
$$;

create trigger add_circle_owner_membership_after_insert
  after insert on public.circles
  for each row execute function public.add_circle_owner_membership();

create trigger assert_revision_reference_ownership_before_write
  before insert or update on public.revision_items
  for each row execute function public.assert_revision_reference_ownership();

create trigger assert_progress_topic_in_version_before_write
  before insert or update on public.syllabus_progress
  for each row execute function public.assert_progress_topic_in_version();

create index branches_exam_id_idx on public.branches (exam_id);
create index exam_versions_branch_status_idx on public.exam_versions (branch_id, status, year desc);
create index subjects_branch_position_idx on public.subjects (branch_id, position);
create index sections_subject_position_idx on public.sections (subject_id, position);
create index topics_section_position_idx on public.topics (section_id, position);
create index exam_version_topics_version_position_idx on public.exam_version_topics (exam_version_id, position);
create index profiles_beta_access_status_idx on public.profiles (beta_access_status) where beta_access_status <> 'active';
create index study_sessions_user_started_idx on public.study_sessions (user_id, started_at desc);
create index syllabus_progress_user_version_idx on public.syllabus_progress (user_id, exam_version_id);
create index pdfs_user_created_idx on public.pdfs (user_id, created_at desc);
create index pdfs_user_subject_idx on public.pdfs (user_id, subject_id) where subject_id is not null;
create index notes_user_updated_idx on public.notes (user_id, updated_at desc) where archived_at is null;
create index goals_user_target_idx on public.goals (user_id, target_date, sort_order);
create index reflections_user_occurred_idx on public.reflections (user_id, occurred_at desc);
create index revision_items_user_due_idx on public.revision_items (user_id, due_on) where status in ('queued', 'snoozed');
create index mistakes_user_next_review_idx on public.mistakes (user_id, next_review_on) where next_review_on is not null;
create index push_subscriptions_user_idx on public.push_subscriptions (user_id);
create index offline_mutation_acks_user_applied_idx on public.offline_mutation_acks (user_id, applied_at desc);
create index invite_codes_active_idx on public.invite_codes (expires_at) where revoked_at is null and use_count < max_uses;
create index circles_owner_idx on public.circles (owner_id, created_at desc);
create index circle_memberships_user_status_idx on public.circle_memberships (user_id, status);
create index circle_invitations_circle_active_idx on public.circle_invitations (circle_id, expires_at) where accepted_at is null and revoked_at is null;
create index circle_sessions_circle_status_idx on public.circle_sessions (circle_id, status, scheduled_for desc);
create index circle_check_ins_session_idx on public.circle_check_ins (circle_session_id, created_at);

alter table public.exams enable row level security;
alter table public.branches enable row level security;
alter table public.exam_versions enable row level security;
alter table public.subjects enable row level security;
alter table public.sections enable row level security;
alter table public.topics enable row level security;
alter table public.exam_version_topics enable row level security;
alter table public.profiles enable row level security;
alter table public.workspace_preferences enable row level security;
alter table public.study_sessions enable row level security;
alter table public.syllabus_progress enable row level security;
alter table public.pdfs enable row level security;
alter table public.notes enable row level security;
alter table public.goals enable row level security;
alter table public.reflections enable row level security;
alter table public.revision_items enable row level security;
alter table public.mistakes enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.offline_mutation_acks enable row level security;
alter table public.invite_codes enable row level security;
alter table public.circles enable row level security;
alter table public.circle_memberships enable row level security;
alter table public.circle_invitations enable row level security;
alter table public.circle_sessions enable row level security;
alter table public.circle_check_ins enable row level security;

create policy "catalog read for active beta users" on public.exams for select to authenticated using (public.is_active_beta_user());
create policy "catalog read for active beta users" on public.branches for select to authenticated using (public.is_active_beta_user());
create policy "catalog read for active beta users" on public.exam_versions for select to authenticated using (public.is_active_beta_user());
create policy "catalog read for active beta users" on public.subjects for select to authenticated using (public.is_active_beta_user());
create policy "catalog read for active beta users" on public.sections for select to authenticated using (public.is_active_beta_user());
create policy "catalog read for active beta users" on public.topics for select to authenticated using (public.is_active_beta_user());
create policy "catalog read for active beta users" on public.exam_version_topics for select to authenticated using (public.is_active_beta_user());

create policy "profiles read own" on public.profiles for select to authenticated using (id = auth.uid());
create policy "profiles update active own" on public.profiles for update to authenticated using (id = auth.uid() and public.is_active_beta_user()) with check (id = auth.uid() and beta_access_status = 'active');

create policy "preferences own active beta" on public.workspace_preferences for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "study sessions own active beta" on public.study_sessions for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "syllabus progress own active beta" on public.syllabus_progress for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "pdfs own active beta" on public.pdfs for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "notes own active beta" on public.notes for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "goals own active beta" on public.goals for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "reflections own active beta" on public.reflections for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "revisions own active beta" on public.revision_items for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "mistakes own active beta" on public.mistakes for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "notification preferences own active beta" on public.notification_preferences for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "push subscriptions own active beta" on public.push_subscriptions for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());
create policy "mutation acknowledgements own active beta" on public.offline_mutation_acks for all to authenticated using (user_id = auth.uid() and public.is_active_beta_user()) with check (user_id = auth.uid() and public.is_active_beta_user());

create policy "circles visible to owners or active members" on public.circles for select to authenticated using (public.is_circle_owner(id) or public.is_active_circle_member(id));
create policy "active beta users create circles" on public.circles for insert to authenticated with check (owner_id = auth.uid() and public.is_active_beta_user());
create policy "circle owners update circles" on public.circles for update to authenticated using (public.is_circle_owner(id)) with check (owner_id = auth.uid() and public.is_circle_owner(id));
create policy "circle owners delete circles" on public.circles for delete to authenticated using (public.is_circle_owner(id));

create policy "memberships visible to circle members" on public.circle_memberships for select to authenticated using (public.is_active_circle_member(circle_id));
create policy "owners manage memberships" on public.circle_memberships for all to authenticated using (public.is_circle_owner(circle_id)) with check (public.is_circle_owner(circle_id));

create policy "owners manage circle invitations" on public.circle_invitations for all to authenticated using (public.is_circle_owner(circle_id)) with check (public.is_circle_owner(circle_id));
create policy "circle sessions visible to active members" on public.circle_sessions for select to authenticated using (public.is_active_circle_member(circle_id));
create policy "circle members create sessions" on public.circle_sessions for insert to authenticated with check (created_by = auth.uid() and public.is_active_circle_member(circle_id));
create policy "session creators or owners update sessions" on public.circle_sessions for update to authenticated using (created_by = auth.uid() or public.is_circle_owner(circle_id)) with check (public.is_active_circle_member(circle_id));
create policy "session creators or owners delete sessions" on public.circle_sessions for delete to authenticated using (created_by = auth.uid() or public.is_circle_owner(circle_id));
create policy "check ins visible to session members" on public.circle_check_ins for select to authenticated using (exists (select 1 from public.circle_sessions session where session.id = circle_session_id and public.is_active_circle_member(session.circle_id)));
create policy "members write own check ins" on public.circle_check_ins for insert to authenticated with check (user_id = auth.uid() and exists (select 1 from public.circle_sessions session where session.id = circle_session_id and public.is_active_circle_member(session.circle_id)));
create policy "members update own check ins" on public.circle_check_ins for update to authenticated using (user_id = auth.uid() and exists (select 1 from public.circle_sessions session where session.id = circle_session_id and public.is_active_circle_member(session.circle_id))) with check (user_id = auth.uid() and exists (select 1 from public.circle_sessions session where session.id = circle_session_id and public.is_active_circle_member(session.circle_id)));
create policy "members delete own check ins" on public.circle_check_ins for delete to authenticated using (user_id = auth.uid() and exists (select 1 from public.circle_sessions session where session.id = circle_session_id and public.is_active_circle_member(session.circle_id)));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('private-notes', 'private-notes', false, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "active beta users read own private files" on storage.objects for select to authenticated using (
  bucket_id = 'private-notes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_beta_user()
);
create policy "active beta users upload own private files" on storage.objects for insert to authenticated with check (
  bucket_id = 'private-notes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_beta_user()
);
create policy "active beta users update own private files" on storage.objects for update to authenticated using (
  bucket_id = 'private-notes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_beta_user()
) with check (
  bucket_id = 'private-notes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_beta_user()
);
create policy "active beta users delete own private files" on storage.objects for delete to authenticated using (
  bucket_id = 'private-notes'
  and (storage.foldername(name))[1] = auth.uid()::text
  and public.is_active_beta_user()
);
