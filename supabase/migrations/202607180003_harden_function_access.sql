-- Keep internal RLS and trigger helpers outside Supabase's public RPC schema.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

alter function public.is_active_beta_user(uuid) set schema private;
alter function public.is_active_circle_member(uuid, uuid) set schema private;
alter function public.is_circle_owner(uuid, uuid) set schema private;
alter function public.add_circle_owner_membership() set schema private;
alter function public.assert_revision_reference_ownership() set schema private;
alter function public.assert_progress_topic_in_version() set schema private;
alter function public.enforce_beta_pdf_quota() set schema private;

create or replace function private.is_active_circle_member(candidate_circle_id uuid, candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = private, public
as $$
  select private.is_active_beta_user(candidate_user_id)
    and exists (
      select 1
      from public.circle_memberships
      where circle_id = candidate_circle_id
        and user_id = candidate_user_id
        and status = 'active'
    );
$$;

create or replace function private.is_circle_owner(candidate_circle_id uuid, candidate_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = private, public
as $$
  select private.is_active_beta_user(candidate_user_id)
    and exists (
      select 1
      from public.circles
      where id = candidate_circle_id
        and owner_id = candidate_user_id
    );
$$;

create or replace function public.consume_beta_invite(p_invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = private, public
as $$
declare
  current_user_id uuid := auth.uid();
  eligible_invite public.invite_codes%rowtype;
begin
  if current_user_id is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.invite_redemptions where user_id = current_user_id) then
    return private.is_active_beta_user(current_user_id);
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
set search_path = private, public
as $$
  select private.is_active_beta_user(auth.uid());
$$;

create or replace function public.accept_circle_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = private, public
as $$
declare
  current_user_id uuid := auth.uid();
  current_email citext;
  invitation public.circle_invitations%rowtype;
begin
  if not private.is_active_beta_user(current_user_id) then
    raise exception 'Active beta access required';
  end if;

  select email into current_email from auth.users where id = current_user_id;
  select * into invitation
  from public.circle_invitations
  where token_hash = encode(extensions.digest(convert_to(p_token, 'UTF8'), 'sha256'), 'hex')
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

grant usage on schema private to authenticated;
grant execute on function private.is_active_beta_user(uuid) to authenticated;
grant execute on function private.is_active_circle_member(uuid, uuid) to authenticated;
grant execute on function private.is_circle_owner(uuid, uuid) to authenticated;

revoke all on function private.add_circle_owner_membership() from public, anon, authenticated;
revoke all on function private.assert_revision_reference_ownership() from public, anon, authenticated;
revoke all on function private.assert_progress_topic_in_version() from public, anon, authenticated;
revoke all on function private.enforce_beta_pdf_quota() from public, anon, authenticated;

revoke all on function public.validate_beta_invite(text) from public, anon, authenticated;
revoke all on function public.consume_beta_invite(uuid) from public, anon, authenticated;
revoke all on function public.has_active_beta_access() from public, anon, authenticated;
revoke all on function public.accept_circle_invite(text) from public, anon, authenticated;

grant execute on function public.validate_beta_invite(text) to anon, authenticated;
grant execute on function public.consume_beta_invite(uuid) to authenticated;
grant execute on function public.has_active_beta_access() to authenticated;
grant execute on function public.accept_circle_invite(text) to authenticated;
