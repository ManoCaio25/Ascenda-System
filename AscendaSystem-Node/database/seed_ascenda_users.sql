-- Ascenda initial users seed
-- Run this after supabase_schema.sql in the Supabase SQL Editor.
--
-- Development note:
-- These are initial credentials for setup. Ask users to change passwords after first access.

begin;

create extension if not exists "pgcrypto";

create temporary table ascenda_seed_users (
  desired_id uuid primary key,
  resolved_id uuid,
  email text not null unique,
  password text not null,
  full_name text not null,
  app_role public.app_role not null,
  area_track text not null
) on commit drop;

insert into ascenda_seed_users (
  desired_id,
  email,
  password,
  full_name,
  app_role,
  area_track
)
values
  (
    '10000000-0000-4000-8000-000000000001'::uuid,
    'paulo.viera@ascenda.com',
    '123@Mudar.,',
    'Paulo Henrique Viera',
    'mentor',
    'Mentor principal'
  ),
  (
    '10000000-0000-4000-8000-000000000002'::uuid,
    'iasmim@ascenda.com',
    '123@Mudar.,',
    'Iasmim',
    'intern',
    'SAP HR'
  ),
  (
    '10000000-0000-4000-8000-000000000003'::uuid,
    'caio.alvarenga@ascenda.com',
    '123@Mudar.,',
    'Caio Alvarenga',
    'intern',
    'DEV WEB'
  );

update ascenda_seed_users seed
set resolved_id = coalesce(
  (
    select users.id
    from auth.users users
    where lower(users.email) = seed.email
    limit 1
  ),
  seed.desired_id
);

do $$
begin
  if exists (
    select 1
    from ascenda_seed_users seed
    join auth.users users on users.id = seed.resolved_id
    where lower(users.email) <> seed.email
  ) then
    raise exception 'Seed user id conflict. A desired seed UUID is already used by another auth.users email.';
  end if;
end $$;

update auth.users users
set
  encrypted_password = crypt(seed.password, gen_salt('bf')),
  email_confirmed_at = coalesce(users.email_confirmed_at, now()),
  raw_app_meta_data = jsonb_build_object('provider', 'email', 'providers', array['email']),
  raw_user_meta_data = jsonb_build_object(
    'full_name', seed.full_name,
    'role', seed.app_role::text,
    'area_track', seed.area_track
  ),
  updated_at = now()
from ascenda_seed_users seed
where lower(users.email) = seed.email;

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  seed.resolved_id,
  'authenticated',
  'authenticated',
  seed.email,
  crypt(seed.password, gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  jsonb_build_object(
    'full_name', seed.full_name,
    'role', seed.app_role::text,
    'area_track', seed.area_track
  ),
  now(),
  now(),
  '',
  '',
  '',
  ''
from ascenda_seed_users seed
where not exists (
  select 1
  from auth.users users
  where lower(users.email) = seed.email
);

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  seed.resolved_id,
  seed.resolved_id::text,
  jsonb_build_object(
    'sub', seed.resolved_id::text,
    'email', seed.email,
    'email_verified', true,
    'phone_verified', false
  ),
  'email',
  now(),
  now(),
  now()
from ascenda_seed_users seed
on conflict (provider_id, provider) do update
  set
    identity_data = excluded.identity_data,
    updated_at = now();

insert into public.profiles (
  id,
  email,
  full_name,
  role,
  metadata
)
select
  seed.resolved_id,
  seed.email,
  seed.full_name,
  seed.app_role,
  jsonb_build_object('area_track', seed.area_track)
from ascenda_seed_users seed
on conflict (id) do update
  set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    metadata = public.profiles.metadata || excluded.metadata,
    updated_at = now();

insert into public.intern_profiles (
  user_id,
  mentor_id,
  substitute_mentor_id,
  created_by,
  full_name,
  email,
  track,
  cohort,
  start_date,
  status,
  level,
  well_being_status
)
select
  intern.resolved_id,
  mentor.resolved_id,
  null,
  mentor.resolved_id,
  intern.full_name,
  intern.email,
  intern.area_track,
  'Ascenda 2026.1',
  current_date,
  'active',
  'Novice',
  'Neutral'
from ascenda_seed_users intern
cross join ascenda_seed_users mentor
where intern.app_role = 'intern'
  and mentor.email = 'paulo.viera@ascenda.com'
on conflict (user_id) do update
  set
    mentor_id = excluded.mentor_id,
    substitute_mentor_id = excluded.substitute_mentor_id,
    created_by = excluded.created_by,
    full_name = excluded.full_name,
    email = excluded.email,
    track = excluded.track,
    cohort = excluded.cohort,
    start_date = excluded.start_date,
    status = excluded.status,
    level = excluded.level,
    well_being_status = excluded.well_being_status,
    updated_at = now();

commit;

-- Validation queries:
--
-- select email, full_name, role, metadata
-- from public.profiles
-- where email in ('paulo.viera@ascenda.com', 'iasmim@ascenda.com', 'caio.alvarenga@ascenda.com')
-- order by role desc, email;
--
-- select
--   intern.full_name as intern_name,
--   intern.email as intern_email,
--   intern.track,
--   mentor.full_name as mentor_name,
--   mentor.email as mentor_email
-- from public.intern_profiles intern
-- join public.profiles mentor on mentor.id = intern.mentor_id
-- where intern.email in ('iasmim@ascenda.com', 'caio.alvarenga@ascenda.com')
-- order by intern.track, intern.full_name;
