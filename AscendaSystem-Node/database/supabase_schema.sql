-- Ascenda Supabase schema
-- Run this file in Supabase SQL Editor after creating the project.

create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_role as enum ('admin', 'mentor', 'intern');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.intern_level as enum ('Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.intern_status as enum ('active', 'paused', 'completed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.wellbeing_status as enum ('Excellent', 'Good', 'Fair', 'Neutral', 'Stressed', 'Poor', 'Overwhelmed');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.course_category as enum ('Technical', 'Leadership', 'Communication', 'Design', 'Business', 'AI Generated');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.course_difficulty as enum ('Beginner', 'Intermediate', 'Advanced');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.assignment_status as enum ('assigned', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.task_status as enum ('pending', 'in_progress', 'in_review', 'completed', 'overdue', 'paused');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.priority_level as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.vacation_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.activity_status as enum ('draft', 'open', 'in_progress', 'completed', 'archived');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type public.question_type as enum ('open_text', 'multiple_choice', 'checklist', 'reflection');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role public.app_role not null default 'intern',
  avatar_url text,
  locale text not null default 'pt-BR',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intern_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  mentor_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  full_name text not null,
  email text unique,
  avatar_url text,
  points integer not null default 0 check (points >= 0),
  level public.intern_level not null default 'Novice',
  status public.intern_status not null default 'active',
  well_being_status public.wellbeing_status not null default 'Neutral',
  track text,
  cohort text,
  avg_score_pct numeric(5,2) not null default 0 check (avg_score_pct >= 0 and avg_score_pct <= 100),
  start_date date,
  end_date date,
  skills text[] not null default '{}',
  performance_history jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  category public.course_category not null default 'Technical',
  difficulty public.course_difficulty not null default 'Beginner',
  duration_hours numeric(6,2) not null default 0 check (duration_hours >= 0),
  youtube_video_id text,
  youtube_url text,
  file_path text,
  file_url text,
  file_name text,
  file_mime text,
  file_size bigint check (file_size is null or file_size >= 0),
  published boolean not null default true,
  enrolled_count integer not null default 0 check (enrolled_count >= 0),
  completion_rate numeric(5,2) not null default 0 check (completion_rate >= 0 and completion_rate <= 100),
  tags text[] not null default '{}',
  generated_metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  intern_id uuid not null references public.intern_profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id) on delete set null,
  status public.assignment_status not null default 'assigned',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  notes text,
  assigned_date timestamptz not null default now(),
  due_date date,
  started_date timestamptz,
  completed_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, intern_id)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid references public.intern_profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text not null,
  category text not null default 'general',
  status public.activity_status not null default 'draft',
  due_at timestamptz,
  source_kind text check (source_kind in ('topic', 'text', 'document', 'youtube', 'mixed') or source_kind is null),
  source_url text,
  source_file_path text,
  source_excerpt text,
  ai_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.intern_profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  source_activity_id uuid references public.activities(id) on delete set null,
  title text not null,
  description text,
  status public.task_status not null default 'pending',
  priority public.priority_level not null default 'medium',
  due_date date,
  points_reward integer not null default 10 check (points_reward >= 0),
  completed_at timestamptz,
  review_notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activity_questions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  prompt text not null,
  type public.question_type not null default 'open_text',
  options jsonb not null default '[]'::jsonb,
  correct_answer text,
  rubric text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_responses (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  intern_id uuid not null references public.intern_profiles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  content text not null,
  links text[] not null default '{}',
  attachments jsonb not null default '[]'::jsonb,
  status text not null default 'submitted',
  score numeric(5,2) check (score is null or (score >= 0 and score <= 100)),
  feedback text,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vacation_requests (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.intern_profiles(id) on delete cascade,
  status public.vacation_status not null default 'pending',
  start_date date not null,
  end_date date not null,
  reason text,
  manager_note text,
  decided_by uuid references public.profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.intern_profiles(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_role public.app_role not null,
  text text not null,
  read_by_recipient boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  target_id uuid,
  target_kind text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.forum_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  topic_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_topics (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.forum_categories(id) on delete set null,
  creator_id uuid references public.profiles(id) on delete set null,
  title text not null,
  content text not null,
  views integer not null default 0,
  reply_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references public.forum_topics(id) on delete cascade,
  creator_id uuid references public.profiles(id) on delete set null,
  content text not null,
  best_answer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.intern_profiles(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  title text not null,
  message text not null,
  sentiment text not null default 'neutral' check (sentiment in ('positive', 'neutral', 'action')),
  status text not null default 'pending' check (status in ('pending', 'acknowledged', 'in_progress', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid not null references public.intern_profiles(id) on delete cascade,
  name text not null,
  description text,
  icon_url text,
  rarity text not null default 'common',
  achieved_at timestamptz not null default now()
);

create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  cost_points integer not null default 0 check (cost_points >= 0),
  item_type text not null default 'cosmetic',
  rarity text not null default 'common',
  stock text not null default 'available',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid references public.intern_profiles(id) on delete cascade,
  created_by uuid references public.profiles(id) on delete set null,
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  event_type text not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_paths (
  id uuid primary key default gen_random_uuid(),
  intern_id uuid references public.intern_profiles(id) on delete cascade,
  name text not null,
  description text,
  progress_percent numeric(5,2) not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  learning_path_id uuid references public.learning_paths(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  title text not null,
  description text,
  content_type text not null default 'link',
  estimated_minutes integer not null default 0 check (estimated_minutes >= 0),
  completion_status text not null default 'pending',
  order_index integer not null default 0,
  access_url text,
  level text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_generation_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references public.profiles(id) on delete set null,
  intern_id uuid references public.intern_profiles(id) on delete set null,
  source_kind text not null,
  source_title text,
  prompt text,
  status text not null default 'completed',
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_intern_profiles_mentor_id on public.intern_profiles(mentor_id);
create index if not exists idx_course_assignments_intern_id on public.course_assignments(intern_id);
create index if not exists idx_tasks_intern_id_status on public.tasks(intern_id, status);
create index if not exists idx_activities_intern_id_status on public.activities(intern_id, status);
create index if not exists idx_activity_responses_activity_id on public.activity_responses(activity_id);
create index if not exists idx_vacation_requests_intern_id on public.vacation_requests(intern_id);
create index if not exists idx_chat_messages_intern_id_created_at on public.chat_messages(intern_id, created_at);
create index if not exists idx_notifications_recipient_id_created_at on public.notifications(recipient_id, created_at desc);
create index if not exists idx_forum_topics_category_id on public.forum_topics(category_id);
create index if not exists idx_forum_replies_topic_id on public.forum_replies(topic_id);
create unique index if not exists idx_forum_categories_name on public.forum_categories(name);
create unique index if not exists idx_shop_items_name on public.shop_items(name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  raw_role text;
  selected_role public.app_role;
begin
  raw_role := new.raw_user_meta_data ->> 'role';
  selected_role := case
    when raw_role in ('admin', 'mentor', 'intern') then raw_role::public.app_role
    else 'intern'::public.app_role
  end;

  insert into public.profiles (id, email, full_name, role, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    selected_role,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        role = excluded.role,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_auth_user();

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.profiles where id = auth.uid()),
    'intern'::public.app_role
  );
$$;

create or replace function public.is_mentor_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_profile_role() in ('admin'::public.app_role, 'mentor'::public.app_role);
$$;

create or replace function public.can_access_intern(target_intern_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_mentor_or_admin()
    or exists (
      select 1
      from public.intern_profiles i
      where i.id = target_intern_id
        and i.user_id = auth.uid()
    )
    or exists (
      select 1
      from public.intern_profiles i
      where i.id = target_intern_id
        and i.mentor_id = auth.uid()
    );
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'profiles',
    'intern_profiles',
    'courses',
    'course_assignments',
    'tasks',
    'activities',
    'activity_responses',
    'vacation_requests',
    'forum_categories',
    'forum_topics',
    'forum_replies',
    'feedback_entries',
    'shop_items',
    'calendar_events',
    'learning_paths',
    'contents'
  ]
  loop
    execute format('drop trigger if exists set_%I_updated_at on public.%I', table_name, table_name);
    execute format('create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()', table_name, table_name);
  end loop;
end $$;

alter table public.profiles enable row level security;
alter table public.intern_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_assignments enable row level security;
alter table public.tasks enable row level security;
alter table public.activities enable row level security;
alter table public.activity_questions enable row level security;
alter table public.activity_responses enable row level security;
alter table public.vacation_requests enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;
alter table public.forum_categories enable row level security;
alter table public.forum_topics enable row level security;
alter table public.forum_replies enable row level security;
alter table public.feedback_entries enable row level security;
alter table public.badges enable row level security;
alter table public.shop_items enable row level security;
alter table public.calendar_events enable row level security;
alter table public.learning_paths enable row level security;
alter table public.contents enable row level security;
alter table public.ai_generation_jobs enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_mentor_or_admin());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and role = public.current_profile_role());

drop policy if exists intern_profiles_select on public.intern_profiles;
create policy intern_profiles_select on public.intern_profiles
  for select to authenticated
  using (public.can_access_intern(id));

drop policy if exists intern_profiles_write_mentor on public.intern_profiles;
create policy intern_profiles_write_mentor on public.intern_profiles
  for all to authenticated
  using (public.is_mentor_or_admin())
  with check (public.is_mentor_or_admin());

drop policy if exists courses_select on public.courses;
create policy courses_select on public.courses
  for select to authenticated
  using (published = true or public.is_mentor_or_admin());

drop policy if exists courses_write_mentor on public.courses;
create policy courses_write_mentor on public.courses
  for all to authenticated
  using (public.is_mentor_or_admin())
  with check (public.is_mentor_or_admin());

drop policy if exists course_assignments_access on public.course_assignments;
create policy course_assignments_access on public.course_assignments
  for all to authenticated
  using (public.can_access_intern(intern_id))
  with check (public.can_access_intern(intern_id));

drop policy if exists tasks_access on public.tasks;
create policy tasks_access on public.tasks
  for all to authenticated
  using (public.can_access_intern(intern_id))
  with check (public.can_access_intern(intern_id));

drop policy if exists activities_access on public.activities;
create policy activities_access on public.activities
  for all to authenticated
  using (intern_id is null or public.can_access_intern(intern_id))
  with check (intern_id is null or public.can_access_intern(intern_id));

drop policy if exists activity_questions_select on public.activity_questions;
create policy activity_questions_select on public.activity_questions
  for select to authenticated
  using (
    exists (
      select 1 from public.activities a
      where a.id = activity_id
        and (a.intern_id is null or public.can_access_intern(a.intern_id))
    )
  );

drop policy if exists activity_questions_write_mentor on public.activity_questions;
create policy activity_questions_write_mentor on public.activity_questions
  for all to authenticated
  using (public.is_mentor_or_admin())
  with check (public.is_mentor_or_admin());

drop policy if exists activity_responses_access on public.activity_responses;
create policy activity_responses_access on public.activity_responses
  for all to authenticated
  using (public.can_access_intern(intern_id))
  with check (public.can_access_intern(intern_id));

drop policy if exists vacation_requests_access on public.vacation_requests;
create policy vacation_requests_access on public.vacation_requests
  for all to authenticated
  using (public.can_access_intern(intern_id))
  with check (public.can_access_intern(intern_id));

drop policy if exists chat_messages_access on public.chat_messages;
create policy chat_messages_access on public.chat_messages
  for all to authenticated
  using (public.can_access_intern(intern_id))
  with check (public.can_access_intern(intern_id));

drop policy if exists notifications_access on public.notifications;
create policy notifications_access on public.notifications
  for all to authenticated
  using (recipient_id = auth.uid() or public.is_mentor_or_admin())
  with check (recipient_id = auth.uid() or public.is_mentor_or_admin());

drop policy if exists forum_categories_access on public.forum_categories;
drop policy if exists forum_categories_select on public.forum_categories;
drop policy if exists forum_categories_write_mentor on public.forum_categories;
create policy forum_categories_select on public.forum_categories
  for select to authenticated
  using (true);

create policy forum_categories_write_mentor on public.forum_categories
  for all to authenticated
  using (public.is_mentor_or_admin())
  with check (public.is_mentor_or_admin());

drop policy if exists forum_topics_access on public.forum_topics;
drop policy if exists forum_topics_select on public.forum_topics;
drop policy if exists forum_topics_insert on public.forum_topics;
drop policy if exists forum_topics_update on public.forum_topics;
drop policy if exists forum_topics_delete on public.forum_topics;
create policy forum_topics_select on public.forum_topics
  for select to authenticated
  using (true);

create policy forum_topics_insert on public.forum_topics
  for insert to authenticated
  with check (creator_id = auth.uid() or public.is_mentor_or_admin());

create policy forum_topics_update on public.forum_topics
  for update to authenticated
  using (creator_id = auth.uid() or public.is_mentor_or_admin())
  with check (creator_id = auth.uid() or public.is_mentor_or_admin());

create policy forum_topics_delete on public.forum_topics
  for delete to authenticated
  using (creator_id = auth.uid() or public.is_mentor_or_admin());

drop policy if exists forum_replies_access on public.forum_replies;
drop policy if exists forum_replies_select on public.forum_replies;
drop policy if exists forum_replies_insert on public.forum_replies;
drop policy if exists forum_replies_update on public.forum_replies;
drop policy if exists forum_replies_delete on public.forum_replies;
create policy forum_replies_select on public.forum_replies
  for select to authenticated
  using (true);

create policy forum_replies_insert on public.forum_replies
  for insert to authenticated
  with check (creator_id = auth.uid() or public.is_mentor_or_admin());

create policy forum_replies_update on public.forum_replies
  for update to authenticated
  using (creator_id = auth.uid() or public.is_mentor_or_admin())
  with check (creator_id = auth.uid() or public.is_mentor_or_admin());

create policy forum_replies_delete on public.forum_replies
  for delete to authenticated
  using (creator_id = auth.uid() or public.is_mentor_or_admin());

drop policy if exists feedback_entries_access on public.feedback_entries;
create policy feedback_entries_access on public.feedback_entries
  for all to authenticated
  using (public.can_access_intern(intern_id))
  with check (public.can_access_intern(intern_id));

drop policy if exists badges_access on public.badges;
drop policy if exists badges_select on public.badges;
drop policy if exists badges_write_mentor on public.badges;
create policy badges_select on public.badges
  for select to authenticated
  using (public.can_access_intern(intern_id));

create policy badges_write_mentor on public.badges
  for all to authenticated
  using (public.is_mentor_or_admin())
  with check (public.is_mentor_or_admin());

drop policy if exists shop_items_access on public.shop_items;
drop policy if exists shop_items_select on public.shop_items;
drop policy if exists shop_items_write_mentor on public.shop_items;
create policy shop_items_select on public.shop_items
  for select to authenticated
  using (active = true or public.is_mentor_or_admin());

create policy shop_items_write_mentor on public.shop_items
  for all to authenticated
  using (public.is_mentor_or_admin())
  with check (public.is_mentor_or_admin());

drop policy if exists calendar_events_access on public.calendar_events;
create policy calendar_events_access on public.calendar_events
  for all to authenticated
  using (intern_id is null or public.can_access_intern(intern_id))
  with check (intern_id is null or public.can_access_intern(intern_id));

drop policy if exists learning_paths_access on public.learning_paths;
create policy learning_paths_access on public.learning_paths
  for all to authenticated
  using (intern_id is null or public.can_access_intern(intern_id))
  with check (intern_id is null or public.can_access_intern(intern_id));

drop policy if exists contents_access on public.contents;
create policy contents_access on public.contents
  for all to authenticated
  using (
    learning_path_id is null
    or exists (
      select 1 from public.learning_paths lp
      where lp.id = learning_path_id
        and (lp.intern_id is null or public.can_access_intern(lp.intern_id))
    )
  )
  with check (
    learning_path_id is null
    or exists (
      select 1 from public.learning_paths lp
      where lp.id = learning_path_id
        and (lp.intern_id is null or public.can_access_intern(lp.intern_id))
    )
  );

drop policy if exists ai_generation_jobs_access on public.ai_generation_jobs;
create policy ai_generation_jobs_access on public.ai_generation_jobs
  for all to authenticated
  using (requested_by = auth.uid() or public.is_mentor_or_admin())
  with check (public.is_mentor_or_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'course-files',
  'course-files',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/webp',
    'video/mp4'
  ]
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists course_files_read on storage.objects;
create policy course_files_read on storage.objects
  for select to authenticated
  using (bucket_id = 'course-files');

drop policy if exists course_files_insert_mentor on storage.objects;
create policy course_files_insert_mentor on storage.objects
  for insert to authenticated
  with check (bucket_id = 'course-files' and public.is_mentor_or_admin());

drop policy if exists course_files_update_mentor on storage.objects;
create policy course_files_update_mentor on storage.objects
  for update to authenticated
  using (bucket_id = 'course-files' and public.is_mentor_or_admin())
  with check (bucket_id = 'course-files' and public.is_mentor_or_admin());

drop policy if exists course_files_delete_mentor on storage.objects;
create policy course_files_delete_mentor on storage.objects
  for delete to authenticated
  using (bucket_id = 'course-files' and public.is_mentor_or_admin());

insert into public.forum_categories (name, description)
values
  ('Technical Questions', 'Code, tooling, deployment and troubleshooting.'),
  ('Career Development', 'Mentoring, feedback and growth conversations.'),
  ('Project Showcase', 'Demos, prototypes and project highlights.'),
  ('General Discussion', 'Community topics and general support.')
on conflict (name) do update
  set description = excluded.description,
      updated_at = now();

insert into public.shop_items (name, description, image_url, cost_points, item_type, rarity, stock)
values
  ('Galactic Explorer Tag', 'Profile tag for active learners.', 'rocket', 180, 'tag', 'rare', 'available'),
  ('Nebula Stickers Pack', 'Digital reward for the intern profile.', 'sparkles', 90, 'cosmetic', 'common', 'available')
on conflict (name) do update
  set description = excluded.description,
      image_url = excluded.image_url,
      cost_points = excluded.cost_points,
      item_type = excluded.item_type,
      rarity = excluded.rarity,
      stock = excluded.stock,
      updated_at = now();

-- After creating your first account in Supabase Auth, promote it to mentor:
-- update public.profiles set role = 'mentor' where email = 'seu-email@exemplo.com';
