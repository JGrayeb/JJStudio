-- PRIVATE administrative class rights; no customer policies, no billing writes,
-- no automatic attendance sync, and no changes to existing tables or functions.
-- Applied explicitly to the JJStudio hosted database on 2026-11-05 UTC.
begin;

create table public.jj_private_class_packages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 3 and 80 and name = btrim(name) and name !~ '[[:cntrl:]]'),
  kind text not null check (kind in ('finite', 'unlimited')),
  remaining_classes integer,
  starts_at timestamptz not null,
  expires_at timestamptz not null,
  version integer not null default 1 check (version >= 1),
  source text not null default 'manual_admin' check (source = 'manual_admin'),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jj_private_class_package_count check ((kind = 'finite' and remaining_classes is not null and remaining_classes between 0 and 10000) or (kind = 'unlimited' and remaining_classes is null)),
  constraint jj_private_class_package_dates check (starts_at >= '2020-01-01T00:00:00Z' and expires_at < '2101-01-01T00:00:00Z' and expires_at > starts_at)
);
create index jj_private_class_packages_user_expiry on public.jj_private_class_packages(user_id, expires_at desc);

create table public.jj_private_class_adjustments (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null,
  user_id uuid not null,
  actor_user_id uuid not null,
  actor_email text not null check (actor_email in ('administracion@jjstudio.mx', 'jucagrape@gmail.com')),
  request_id uuid not null unique,
  action text not null check (action in ('create', 'adjust')),
  reason text not null check (char_length(reason) between 5 and 500 and reason = btrim(reason) and reason !~ '[[:cntrl:]]'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  before_value jsonb,
  after_value jsonb not null,
  created_at timestamptz not null default now()
);
create index jj_private_class_adjustments_user_time on public.jj_private_class_adjustments(user_id, created_at desc);
create index jj_private_class_adjustments_package_time on public.jj_private_class_adjustments(package_id, created_at desc);
create index jj_private_class_packages_created_by on public.jj_private_class_packages(created_by);
create index jj_private_class_packages_updated_by on public.jj_private_class_packages(updated_by);

alter table public.jj_private_class_packages enable row level security;
alter table public.jj_private_class_adjustments enable row level security;
revoke all on public.jj_private_class_packages from public, anon, authenticated, service_role;
revoke all on public.jj_private_class_adjustments from public, anon, authenticated, service_role;
grant select, insert, update on public.jj_private_class_packages to service_role;
grant select, insert on public.jj_private_class_adjustments to service_role;

-- Audit is append-only even when a privileged caller makes a programming error.
create function public.jj_private_class_audit_immutable()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  raise exception 'class_audit_immutable' using errcode = '55000';
end;
$$;
revoke all on function public.jj_private_class_audit_immutable() from public, anon, authenticated;
grant execute on function public.jj_private_class_audit_immutable() to service_role;
create trigger jj_private_class_audit_immutable before update or delete on public.jj_private_class_adjustments for each row execute function public.jj_private_class_audit_immutable();

create function public.jj_adjust_private_class_package(p_actor_user_id uuid, p_actor_email text, p_payload jsonb)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_action text;
  v_user_id uuid;
  v_request_id uuid;
  v_package_id uuid;
  v_name text;
  v_kind text;
  v_remaining integer;
  v_starts timestamptz;
  v_expires timestamptz;
  v_reason text;
  v_expected integer;
  v_before jsonb;
  v_existing public.jj_private_class_adjustments%rowtype;
  v_package public.jj_private_class_packages%rowtype;
begin
  if p_actor_user_id is null or p_actor_email not in ('administracion@jjstudio.mx', 'jucagrape@gmail.com') or not exists (select 1 from public.site_admins a where a.email = p_actor_email) then
    raise exception 'admin_forbidden' using errcode = '42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' or (p_payload - array['action','accountId','packageId','expectedVersion','requestId','name','kind','remainingClasses','startsAt','expiresAt','reason']::text[]) <> '{}'::jsonb then
    raise exception 'invalid_class_adjustment' using errcode = '22023';
  end if;
  v_action := p_payload->>'action';
  v_name := p_payload->>'name';
  v_kind := p_payload->>'kind';
  v_reason := p_payload->>'reason';
  if v_action is null or v_action not in ('create','adjust') or v_kind is null or v_kind not in ('finite','unlimited')
    or v_name is null or char_length(v_name) not between 3 and 80 or v_name <> btrim(v_name) or v_name ~ '[[:cntrl:]]'
    or v_reason is null or char_length(v_reason) not between 5 and 500 or v_reason <> btrim(v_reason) or v_reason ~ '[[:cntrl:]]'
    or coalesce(p_payload->>'accountId', '') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or coalesce(p_payload->>'requestId', '') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    or coalesce(p_payload->>'startsAt', '') !~ '^(20[0-9]{2}|2100)-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$'
    or coalesce(p_payload->>'expiresAt', '') !~ '^(20[0-9]{2}|2100)-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z$' then
    raise exception 'invalid_class_adjustment' using errcode = '22023';
  end if;
  v_user_id := (p_payload->>'accountId')::uuid;
  v_request_id := (p_payload->>'requestId')::uuid;
  v_starts := (p_payload->>'startsAt')::timestamptz;
  v_expires := (p_payload->>'expiresAt')::timestamptz;
  if v_starts < '2020-01-01T00:00:00Z'::timestamptz or v_expires >= '2101-01-01T00:00:00Z'::timestamptz or v_expires <= v_starts then
    raise exception 'invalid_class_adjustment' using errcode = '22023';
  end if;
  if v_kind = 'finite' then
    if jsonb_typeof(p_payload->'remainingClasses') <> 'number' or coalesce(p_payload->>'remainingClasses','') !~ '^[0-9]{1,5}$' then
      raise exception 'invalid_class_adjustment' using errcode = '22023';
    end if;
    v_remaining := (p_payload->>'remainingClasses')::integer;
    if v_remaining > 10000 then raise exception 'invalid_class_adjustment' using errcode = '22023'; end if;
  elsif not (p_payload ? 'remainingClasses') or p_payload->'remainingClasses' <> 'null'::jsonb then
    raise exception 'invalid_class_adjustment' using errcode = '22023';
  end if;
  if v_action = 'adjust' then
    if coalesce(p_payload->>'packageId','') !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      or jsonb_typeof(p_payload->'expectedVersion') <> 'number' or coalesce(p_payload->>'expectedVersion','') !~ '^[1-9][0-9]{0,9}$' then
      raise exception 'invalid_class_adjustment' using errcode = '22023';
    end if;
    v_package_id := (p_payload->>'packageId')::uuid;
    v_expected := (p_payload->>'expectedVersion')::integer;
    if v_expected >= 2147483647 then raise exception 'invalid_class_adjustment' using errcode = '22023'; end if;
  elsif p_payload ? 'packageId' or p_payload ? 'expectedVersion' then
    raise exception 'invalid_class_adjustment' using errcode = '22023';
  end if;

  -- Serialize the same request even if it targets two different packages.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_request_id::text, 0));
  select * into v_existing from public.jj_private_class_adjustments where request_id = v_request_id;
  if found then
    if v_existing.actor_user_id <> p_actor_user_id or v_existing.actor_email <> p_actor_email or v_existing.user_id <> v_user_id or v_existing.payload <> p_payload then
      raise exception 'request_conflict' using errcode = 'P0001';
    end if;
    return jsonb_build_object('package', v_existing.after_value, 'replayed', true);
  end if;
  if v_action = 'create' then
    insert into public.jj_private_class_packages(user_id, name, kind, remaining_classes, starts_at, expires_at, created_by, updated_by)
      values (v_user_id, v_name, v_kind, v_remaining, v_starts, v_expires, p_actor_user_id, p_actor_user_id) returning * into v_package;
  else
    select * into v_package from public.jj_private_class_packages where id = v_package_id and user_id = v_user_id for update;
    if not found then raise exception 'package_not_found' using errcode = 'P0001'; end if;
    if v_package.version <> v_expected then raise exception 'version_conflict' using errcode = 'P0001'; end if;
    v_before := to_jsonb(v_package);
    update public.jj_private_class_packages set name = v_name, kind = v_kind, remaining_classes = v_remaining, starts_at = v_starts, expires_at = v_expires, version = version + 1, updated_by = p_actor_user_id, updated_at = now()
      where id = v_package_id and user_id = v_user_id returning * into v_package;
  end if;
  insert into public.jj_private_class_adjustments(package_id,user_id,actor_user_id,actor_email,request_id,action,reason,payload,before_value,after_value)
    values (v_package.id,v_user_id,p_actor_user_id,p_actor_email,v_request_id,v_action,v_reason,p_payload,v_before,to_jsonb(v_package));
  return jsonb_build_object('package', to_jsonb(v_package), 'replayed', false);
end;
$$;
revoke all on function public.jj_adjust_private_class_package(uuid,text,jsonb) from public, anon, authenticated;
grant execute on function public.jj_adjust_private_class_package(uuid,text,jsonb) to service_role;

comment on table public.jj_private_class_packages is 'Private administrative rights only. No customer access or automatic attendance sync. Never used to change Stripe or Nessty.';
comment on table public.jj_private_class_adjustments is 'Append-only administrative change log with before/after snapshots and idempotent request reference.';
commit;
