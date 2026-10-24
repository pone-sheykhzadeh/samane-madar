-- ====================================================================
-- Obsidian Orbit - Project Management SaaS
-- Supabase PostgreSQL Database Schema & Row Level Security (RLS)
-- ====================================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------------------
-- 1. Profiles Table (extends Supabase auth.users)
-- --------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  role text default 'Member', -- 'Admin', 'Product Lead', 'Design Lead', 'Engineer', 'Member'
  job_title text,
  bio text,
  hardware_session_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to create profile upon new auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role, job_title)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
    coalesce(new.raw_user_meta_data->>'role', 'Member'),
    coalesce(new.raw_user_meta_data->>'job_title', 'Software Engineer')
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --------------------------------------------------------------------
-- 2. Workspaces & Membership
-- --------------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.workspace_members (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('owner', 'admin', 'member', 'viewer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(workspace_id, user_id)
);

-- Helper function: is current user member of workspace
create or replace function public.is_workspace_member(ws_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = ws_id and user_id = auth.uid()
  );
$$ language sql security definer;

-- --------------------------------------------------------------------
-- 3. Projects
-- --------------------------------------------------------------------
create table if not exists public.projects (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  client_name text default 'Internal',
  description text,
  status text not null check (status in ('upcoming', 'in_progress', 'completed')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  progress_percentage integer default 0 check (progress_percentage >= 0 and progress_percentage <= 100),
  tasks_done integer default 0,
  tasks_total integer default 0,
  start_date date,
  due_date date,
  tags text[] default '{}',
  is_starred boolean default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.project_members (
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (project_id, user_id)
);

-- --------------------------------------------------------------------
-- 4. Tasks & Comments
-- --------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null check (status in ('todo', 'in_progress', 'in_review', 'completed')),
  priority text not null check (priority in ('normal', 'medium', 'high')),
  due_date date,
  tags text[] default '{}',
  created_by uuid references public.profiles(id) on delete set null,
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.task_assignees (
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (task_id, user_id)
);

create table if not exists public.task_comments (
  id uuid default gen_random_uuid() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 5. Time Tracking
-- --------------------------------------------------------------------
create table if not exists public.time_entries (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  duration_seconds integer default 0 not null,
  is_running boolean default false,
  started_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 6. Personal Notes (strictly user-owned)
-- --------------------------------------------------------------------
create table if not exists public.personal_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text,
  is_pinned boolean default false,
  color text default '#6859f5',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 7. Team Chat (Channels & Messages)
-- --------------------------------------------------------------------
create table if not exists public.channels (
  id uuid default gen_random_uuid() primary key,
  workspace_id uuid references public.workspaces(id) on delete cascade not null,
  name text not null,
  is_direct boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.channel_members (
  channel_id uuid references public.channels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  primary key (channel_id, user_id)
);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  channel_id uuid references public.channels(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  attachments jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --------------------------------------------------------------------
-- 8. Notifications
-- --------------------------------------------------------------------
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'task', -- 'task', 'mention', 'project', 'system'
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.task_assignees enable row level security;
alter table public.task_comments enable row level security;
alter table public.time_entries enable row level security;
alter table public.personal_notes enable row level security;
alter table public.channels enable row level security;
alter table public.channel_members enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Profiles: Anyone authenticated can read user profiles in their workspace; users update own profile
create policy "Allow authenticated users to read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id);

-- Workspaces: Visible to members
create policy "Workspace visible to members"
  on public.workspaces for select
  to authenticated
  using (
    owner_id = auth.uid() or
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = workspaces.id and workspace_members.user_id = auth.uid()
    )
  );

create policy "Authenticated users can create workspaces"
  on public.workspaces for insert
  to authenticated
  with check (owner_id = auth.uid());

create policy "Workspace owners and admins can update workspaces"
  on public.workspaces for update
  to authenticated
  using (
    owner_id = auth.uid() or
    exists (
      select 1 from public.workspace_members
      where workspace_members.workspace_id = workspaces.id
        and workspace_members.user_id = auth.uid()
        and workspace_members.role in ('owner', 'admin')
    )
  );

-- Workspace Members
create policy "Members visible to workspace participants"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Admins can manage workspace members"
  on public.workspace_members for all
  to authenticated
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = workspace_members.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Projects
create policy "Projects visible to workspace members"
  on public.projects for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can create projects"
  on public.projects for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update projects"
  on public.projects for update
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace admins can delete projects"
  on public.projects for delete
  to authenticated
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = projects.workspace_id
        and wm.user_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );

-- Tasks
create policy "Tasks visible to workspace members"
  on public.tasks for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can insert tasks"
  on public.tasks for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Workspace members can update tasks"
  on public.tasks for update
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can delete tasks"
  on public.tasks for delete
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- Task Comments
create policy "Comments visible to workspace members"
  on public.task_comments for select
  to authenticated
  using (
    exists (
      select 1 from public.tasks t
      where t.id = task_comments.task_id and public.is_workspace_member(t.workspace_id)
    )
  );

create policy "Users can post comments in workspace tasks"
  on public.task_comments for insert
  to authenticated
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.tasks t
      where t.id = task_comments.task_id and public.is_workspace_member(t.workspace_id)
    )
  );

-- Time Entries: Users manage their own time entries within workspace
create policy "Users can view own time entries"
  on public.time_entries for select
  to authenticated
  using (user_id = auth.uid() or public.is_workspace_member(workspace_id));

create policy "Users can manage own time entries"
  on public.time_entries for all
  to authenticated
  using (user_id = auth.uid());

-- Personal Notes: STRICTLY OWNER ONLY
create policy "Personal notes strictly private to owner"
  on public.personal_notes for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Channels & Messages: Only channel participants
create policy "Channels visible to workspace members"
  on public.channels for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "Workspace members can create channels"
  on public.channels for insert
  to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "Messages visible to channel members"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.channels c
      where c.id = messages.channel_id and public.is_workspace_member(c.workspace_id)
    )
  );

create policy "Members can post messages"
  on public.messages for insert
  to authenticated
  with check (
    user_id = auth.uid() and
    exists (
      select 1 from public.channels c
      where c.id = messages.channel_id and public.is_workspace_member(c.workspace_id)
    )
  );

-- Notifications: Strictly recipient
create policy "Notifications private to recipient"
  on public.notifications for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
create index if not exists idx_tasks_workspace_status on public.tasks(workspace_id, status);
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_projects_workspace on public.projects(workspace_id);
create index if not exists idx_messages_channel on public.messages(channel_id, created_at desc);
create index if not exists idx_notifications_user_unread on public.notifications(user_id, is_read);
create index if not exists idx_personal_notes_user on public.personal_notes(user_id, is_pinned desc);
