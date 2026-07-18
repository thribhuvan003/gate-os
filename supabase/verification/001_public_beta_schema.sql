-- Run after 202607180001_public_beta_schema.sql and 202607180002_seed_gate_2027_cs_it_catalog.sql.
-- This is read-only verification SQL. It raises an exception when an invariant is missing.

do $$
declare
  required_tables text[] := array[
    'exams', 'branches', 'exam_versions', 'subjects', 'sections', 'topics', 'exam_version_topics',
    'profiles', 'workspace_preferences', 'study_sessions', 'syllabus_progress', 'pdfs', 'notes', 'pyq_attempts',
    'goals', 'reflections', 'revision_items', 'mistakes', 'notification_preferences',
    'push_subscriptions', 'notification_deliveries', 'offline_mutation_acks', 'invite_codes', 'invite_redemptions', 'circles',
    'circle_memberships', 'circle_invitations', 'circle_sessions', 'circle_check_ins'
  ];
  missing_tables text[];
  rls_disabled text[];
begin
  select array_agg(required_table)
  into missing_tables
  from unnest(required_tables) as required_table
  where to_regclass('public.' || required_table) is null;

  if missing_tables is not null then
    raise exception 'Missing required tables: %', missing_tables;
  end if;

  select array_agg(required_table)
  into rls_disabled
  from unnest(required_tables) as required_table
  join pg_class relation on relation.relname = required_table
  join pg_namespace namespace on namespace.oid = relation.relnamespace and namespace.nspname = 'public'
  where not relation.relrowsecurity;

  if rls_disabled is not null then
    raise exception 'RLS is disabled for: %', rls_disabled;
  end if;
end;
$$;

do $$
declare
  required_functions text[] := array[
    'set_updated_at', 'is_active_beta_user', 'is_active_circle_member',
    'is_circle_owner', 'add_circle_owner_membership'
  ];
  missing_functions text[];
begin
  select array_agg(required_function)
  into missing_functions
  from unnest(required_functions) as required_function
  where to_regprocedure('public.' || required_function || '()') is null
    and required_function not in ('is_active_beta_user', 'is_active_circle_member', 'is_circle_owner');

  if missing_functions is not null then
    raise exception 'Missing helper functions: %', missing_functions;
  end if;

  if to_regprocedure('public.is_active_beta_user(uuid)') is null
    or to_regprocedure('public.is_active_circle_member(uuid,uuid)') is null
    or to_regprocedure('public.is_circle_owner(uuid,uuid)') is null then
    raise exception 'Missing parameterized RLS helper function';
  end if;

  if to_regprocedure('public.validate_beta_invite(text)') is null
    or to_regprocedure('public.consume_beta_invite(uuid)') is null
    or to_regprocedure('public.has_active_beta_access()') is null
    or to_regprocedure('public.accept_circle_invite(text)') is null
    or to_regprocedure('public.enforce_beta_pdf_quota()') is null then
    raise exception 'Missing beta access, circle invitation, or PDF quota function';
  end if;
end;
$$;

do $$
declare
  policy_count integer;
  bucket_is_private boolean;
  bucket_size_limit bigint;
  catalog_topics integer;
  catalog_subjects integer;
begin
  select count(*) into policy_count
  from pg_policies
  where schemaname = 'public';

  if policy_count < 30 then
    raise exception 'Expected strict public-table RLS policies; found only %', policy_count;
  end if;

  select not public, file_size_limit
  into bucket_is_private, bucket_size_limit
  from storage.buckets
  where id = 'private-notes';

  if bucket_is_private is distinct from true or bucket_size_limit <> 52428800 then
    raise exception 'private-notes bucket is missing, public, or has an incorrect size limit';
  end if;

  select count(*) into catalog_subjects
  from public.subjects subjects
  join public.branches branches on branches.id = subjects.branch_id
  where branches.code = 'CS-IT';

  select count(*) into catalog_topics
  from public.exam_version_topics mappings
  join public.exam_versions versions on versions.id = mappings.exam_version_id
  join public.branches branches on branches.id = versions.branch_id
  where versions.year = 2027 and branches.code = 'CS-IT';

  if catalog_subjects <> 10 or catalog_topics < 90 then
    raise exception 'GATE CS/IT catalog seed is incomplete: % subjects, % topics', catalog_subjects, catalog_topics;
  end if;
end;
$$;

-- Manual authorization checks for an integration-test fixture:
-- 1. Create two active auth users and corresponding active profiles using service role only.
-- 2. With User A's JWT, insert one note, one PDF record and one storage object under <user-a-id>/.
-- 3. With User B's JWT, verify select/update/delete against User A's private rows and file all return zero rows or RLS errors.
-- 4. Add both users to a circle; verify they can read only circle metadata, sessions and check-ins.
-- 5. Verify neither user can select invite_codes, another profile, or an inactive user's catalog.
