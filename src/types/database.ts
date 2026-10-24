export type UserRole = 'Admin' | 'Product Lead' | 'Design Lead' | 'Engineer' | 'Member';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: UserRole;
  job_title: string;
  bio?: string;
  hardware_session_active?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  profile?: UserProfile;
}

export type ProjectStatus = 'upcoming' | 'in_progress' | 'completed';
export type PriorityLevel = 'low' | 'normal' | 'medium' | 'high';

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  client_name: string;
  description: string;
  status: ProjectStatus;
  priority: PriorityLevel;
  progress_percentage: number;
  tasks_done: number;
  tasks_total: number;
  start_date: string;
  due_date: string;
  tags: string[];
  is_starred: boolean;
  member_avatars?: string[];
  members?: UserProfile[];
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'completed';

export interface Task {
  id: string;
  workspace_id: string;
  project_id?: string;
  project_name?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  due_date: string;
  tags: string[];
  assignees: UserProfile[];
  completed_at?: string;
  created_by?: string;
  comments_count?: number;
  subtasks_count?: number;
  subtasks_completed?: number;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  user: UserProfile;
  content: string;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  workspace_id: string;
  project_id?: string;
  project_name?: string;
  task_id?: string;
  title: string;
  duration_seconds: number;
  is_running: boolean;
  started_at?: string;
}

export interface PersonalNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  color: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  is_direct: boolean;
  partner?: UserProfile;
  unread_count?: number;
  last_message?: string;
  last_time?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  user: UserProfile;
  content: string;
  created_at: string;
  attachments?: { name: string; url: string; size?: string }[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task' | 'mention' | 'project' | 'system';
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface TimelineItem {
  id: string;
  project_id?: string;
  title: string;
  date_range: string;
  start_col: number;
  span_cols: number;
  row: number;
  color_bg: string;
  color_text: string;
  color_subtext: string;
}

export interface TimelineTask {
  id: string;
  title: string;
  start_day: number;
  span_days: number;
  color: string;
  project_name: string;
  created_at?: string;
}

