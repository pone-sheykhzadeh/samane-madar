import { supabase, isSupabaseConfigured } from '../lib/supabase.ts';
import {
  UserProfile,
  Project,
  Task,
  TaskStatus,
  TimeEntry,
  PersonalNote,
  Channel,
  Message,
  NotificationItem,
  TimelineTask,
} from '../types/database.ts';

// Illustrated Admin avatar URL (High-definition vector illustration of a person)
export const ILLUSTRATED_ADMIN_AVATAR =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=AliMadarAdmin&backgroundColor=b6e3f4';

// Pre-seeded team profiles: Only the Admin remains!
export const SEED_PROFILES: UserProfile[] = [
  {
    id: 'user-admin',
    email: 'admin@madar.app',
    full_name: 'علی رضایی (مدیر ارشد)',
    avatar_url: ILLUSTRATED_ADMIN_AVATAR,
    role: 'Admin',
    job_title: 'مدیر ارشد و معمار محصول',
    bio: 'مدیریت و نظارت بر توسعه سیستم‌ها و پروژه‌های پلتفرم ابری مدار.',
    hardware_session_active: true,
  },
];

// Exactly 1 clean example project
const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-example-1',
    workspace_id: 'ws-01',
    name: 'توسعه پلتفرم وب مدار',
    client_name: 'پروژه داخلی تیم',
    description: 'طراحی و پیاده‌سازی زیرساخت ماژولار ابری، سیستم تسک‌ها و چت ریل‌تایم.',
    status: 'in_progress',
    priority: 'high',
    progress_percentage: 40,
    tasks_done: 2,
    tasks_total: 5,
    start_date: '۱۴۰۳/۰۷/۰۱',
    due_date: '۳۰ آبان',
    tags: ['فرانت‌اند', 'پایگاه داده'],
    is_starred: true,
    member_avatars: [ILLUSTRATED_ADMIN_AVATAR],
  },
];

// Exactly 1 clean example task
const SEED_TASKS: Task[] = [
  {
    id: 'task-example-1',
    workspace_id: 'ws-01',
    project_id: 'proj-example-1',
    project_name: 'توسعه پلتفرم وب مدار',
    title: 'طراحی ساختار احراز هویت و پایگاه داده',
    description: 'ایجاد اسکیما و جداول کاربران، سطوح دسترسی RLS و اتصال توکن امنیتی.',
    status: 'in_progress',
    priority: 'high',
    due_date: 'موعد: ۲۵ آبان',
    tags: ['بک‌اند', 'امنیت'],
    assignees: [SEED_PROFILES[0]],
    comments_count: 0,
    subtasks_count: 3,
    subtasks_completed: 1,
  },
];

const SEED_TIME_ENTRIES: TimeEntry[] = [
  {
    id: 'time-1',
    workspace_id: 'ws-01',
    project_id: 'proj-example-1',
    project_name: 'توسعه پلتفرم وب مدار',
    title: 'طراحی معماری سیستم',
    duration_seconds: 0,
    is_running: false,
  },
];

// Default clean channels with 1 example thread
const SEED_CHANNELS: Channel[] = [
  {
    id: 'chan-general',
    workspace_id: 'ws-01',
    name: 'گفتگوی عمومی تیم',
    is_direct: false,
    partner: SEED_PROFILES[0],
    unread_count: 0,
    last_message: 'به فضای کاری مدار خوش آمدید!',
    last_time: 'هم‌اکنون',
  },
];

const SEED_MESSAGES: Record<string, Message[]> = {
  'chan-general': [
    {
      id: 'msg-welcome-1',
      channel_id: 'chan-general',
      user_id: 'user-admin',
      user: SEED_PROFILES[0],
      content: 'سلام! به سامانه مدیریت پروژه «مدار» خوش آمدید. می‌توانید تسک‌ها و پروژه‌های جدید خود را تعریف کنید.',
      created_at: new Date().toISOString(),
    },
  ],
};

const SEED_NOTES: PersonalNote[] = [
  {
    id: 'note-example-1',
    user_id: 'user-admin',
    title: 'یادداشت اولیه و اهداف اسپرینت',
    content: '۱. تعریف پروژه‌های جاری تیم\n۲. تخصیص تسک‌ها به اعضا\n۳. تنظیم بازه زمانی و سررسیدها',
    is_pinned: true,
    color: '#6859f5',
    updated_at: new Date().toISOString(),
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-welcome',
    user_id: 'user-admin',
    title: 'خوش آمدید',
    message: 'فضای کاری «مدار» آماده استفاده است. می‌توانید اولین تسک خود را اضافه کنید.',
    type: 'system',
    is_read: true,
    created_at: 'هم‌اکنون',
  },
];

// Default 1 clean example task in the time rail
const SEED_TIMELINE_TASKS: TimelineTask[] = [
  {
    id: 'tl-task-1',
    title: 'توسعه پلتفرم وب مدار - فاز طراحی و پیاده‌سازی',
    start_day: 2,
    span_days: 5,
    color: '#8183fe',
    project_name: 'توسعه پلتفرم وب مدار',
    created_at: new Date().toISOString(),
  },
];

// Local Storage Keys
const STORAGE_KEYS = {
  CURRENT_USER: 'madar_app_user',
  TEAM_MEMBERS: 'madar_app_team_members',
  PROJECTS: 'madar_app_projects',
  TASKS: 'madar_app_tasks',
  TIME_ENTRIES: 'madar_app_time',
  CHANNELS: 'madar_app_channels',
  MESSAGES: 'madar_app_messages',
  NOTES: 'madar_app_notes',
  NOTIFICATIONS: 'madar_app_notifications',
  TIMELINE_TASKS: 'madar_app_timeline_tasks',
};

function getStored<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write failed', err);
  }
}

// --------------------------------------------------------------------
// Database Service Interface
// --------------------------------------------------------------------
export const dbService = {
  // Profiles & Auth
  getCurrentUser(): UserProfile {
    const stored = getStored<UserProfile>(STORAGE_KEYS.CURRENT_USER, SEED_PROFILES[0]);
    // If the stored user has an old unsplash avatar or old data, update to illustrated avatar
    if (!stored || !stored.avatar_url || stored.avatar_url.includes('unsplash.com')) {
      const updated = {
        ...SEED_PROFILES[0],
        ...(stored || {}),
        avatar_url: ILLUSTRATED_ADMIN_AVATAR,
      };
      this.setCurrentUser(updated);
      return updated;
    }
    return stored;
  },

  setCurrentUser(user: UserProfile) {
    // Ensure avatar is illustrated if previously unsplash
    if (user.avatar_url && user.avatar_url.includes('unsplash.com')) {
      user.avatar_url = ILLUSTRATED_ADMIN_AVATAR;
    }
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  },

  // Team Members (Only Admin by default + add/delete support)
  getTeamMembers(): UserProfile[] {
    const members = getStored<UserProfile[]>(STORAGE_KEYS.TEAM_MEMBERS, SEED_PROFILES);
    // Ensure admin is illustrated and check if legacy members need migration
    const sanitized = members.map((m) => {
      if (m.id === 'user-admin' || m.role === 'Admin' || m.avatar_url?.includes('unsplash.com')) {
        return {
          ...m,
          avatar_url: m.role === 'Admin' ? ILLUSTRATED_ADMIN_AVATAR : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(m.full_name)}&backgroundColor=c0aede`,
        };
      }
      return m;
    });
    return sanitized.length > 0 ? sanitized : SEED_PROFILES;
  },

  addMember(memberData: Partial<UserProfile>): UserProfile {
    const current = this.getTeamMembers();
    const newMember: UserProfile = {
      id: `member-${Date.now()}`,
      email: memberData.email || `user.${Date.now()}@madar.app`,
      full_name: memberData.full_name || 'همکار جدید',
      avatar_url:
        memberData.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
          memberData.full_name || 'NewMember'
        )}&backgroundColor=d1d4f9`,
      role: memberData.role || 'Member',
      job_title: memberData.job_title || 'کارشناس پروژه',
      bio: memberData.bio || 'عضو تیم سامانه مدار',
      hardware_session_active: true,
    };
    const updated = [...current, newMember];
    setStored(STORAGE_KEYS.TEAM_MEMBERS, updated);
    return newMember;
  },

  deleteMember(memberId: string): UserProfile[] {
    const current = this.getTeamMembers();
    const updated = current.filter((m) => m.id !== memberId);
    // Ensure at least 1 member (admin) exists
    const finalMembers = updated.length > 0 ? updated : SEED_PROFILES;
    setStored(STORAGE_KEYS.TEAM_MEMBERS, finalMembers);
    return finalMembers;
  },

  // Timeline / Time Rail Tasks
  getTimelineTasks(): TimelineTask[] {
    return getStored<TimelineTask[]>(STORAGE_KEYS.TIMELINE_TASKS, SEED_TIMELINE_TASKS);
  },

  addTimelineTask(taskData: Partial<TimelineTask>): TimelineTask {
    const current = this.getTimelineTasks();
    const newTask: TimelineTask = {
      id: `tl-task-${Date.now()}`,
      title: taskData.title || 'تسک جدید در تایم‌لاین',
      start_day: taskData.start_day ?? 2,
      span_days: taskData.span_days ?? 4,
      color: taskData.color || '#8183fe',
      project_name: taskData.project_name || 'توسعه پلتفرم وب مدار',
      created_at: new Date().toISOString(),
    };
    const updated = [newTask, ...current];
    setStored(STORAGE_KEYS.TIMELINE_TASKS, updated);
    return newTask;
  },

  deleteTimelineTask(id: string): TimelineTask[] {
    const current = this.getTimelineTasks();
    const updated = current.filter((t) => t.id !== id);
    setStored(STORAGE_KEYS.TIMELINE_TASKS, updated);
    return updated;
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as Project[];
        }
      } catch (err) {
        console.warn('Falling back to local projects', err);
      }
    }
    return getStored<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
  },

  async addProject(project: Partial<Project>): Promise<Project> {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      workspace_id: 'ws-01',
      name: project.name || 'پروژه جدید',
      client_name: project.client_name || 'کارفرما',
      description: project.description || '',
      status: project.status || 'in_progress',
      priority: project.priority || 'medium',
      progress_percentage: project.progress_percentage || 0,
      tasks_done: 0,
      tasks_total: project.tasks_total || 0,
      start_date: project.start_date || 'امروز',
      due_date: project.due_date || 'تعیین نشده',
      tags: project.tags && project.tags.length ? project.tags : ['عمومی'],
      is_starred: false,
      member_avatars: [this.getCurrentUser().avatar_url],
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('projects').insert([newProj]).select().single();
        if (data) return data as Project;
      } catch (e) {
        console.warn('Supabase insert failed, caching locally', e);
      }
    }

    const current = getStored<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    const updated = [newProj, ...current];
    setStored(STORAGE_KEYS.PROJECTS, updated);
    return newProj;
  },

  async deleteProject(projectId: string): Promise<Project[]> {
    const current = getStored<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    const updated = current.filter((p) => p.id !== projectId);
    setStored(STORAGE_KEYS.PROJECTS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('projects').delete().eq('id', projectId);
      } catch (e) {
        console.warn('Supabase project delete error', e);
      }
    }

    return updated;
  },

  async toggleStarProject(projectId: string): Promise<boolean> {
    const current = getStored<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    let starred = false;
    const updated = current.map((p) => {
      if (p.id === projectId) {
        starred = !p.is_starred;
        return { ...p, is_starred: starred };
      }
      return p;
    });
    setStored(STORAGE_KEYS.PROJECTS, updated);
    return starred;
  },

  // Tasks
  async getTasks(): Promise<Task[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          return data as Task[];
        }
      } catch (err) {
        console.warn('Falling back to local tasks', err);
      }
    }
    return getStored<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
  },

  async addTask(taskData: Partial<Task>): Promise<Task> {
    const currentUser = this.getCurrentUser();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      workspace_id: 'ws-01',
      project_id: taskData.project_id || 'proj-example-1',
      project_name: taskData.project_name || 'توسعه پلتفرم وب مدار',
      title: taskData.title || 'تسک جدید',
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      due_date: taskData.due_date || 'موعد: ۳۰ آبان',
      tags: taskData.tags && taskData.tags.length ? taskData.tags : ['اصلی'],
      assignees: taskData.assignees && taskData.assignees.length ? taskData.assignees : [currentUser],
      comments_count: 0,
      subtasks_count: 0,
      subtasks_completed: 0,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase.from('tasks').insert([newTask]).select().single();
        if (data) return data as Task;
      } catch (err) {
        console.warn('Supabase task insert failed, saving locally', err);
      }
    }

    const current = getStored<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const updated = [newTask, ...current];
    setStored(STORAGE_KEYS.TASKS, updated);
    return newTask;
  },

  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<Task[]> {
    const current = getStored<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const updated = current.map((t) => {
      if (t.id === taskId) {
        const isDone = newStatus === 'completed';
        return {
          ...t,
          status: newStatus,
          completed_at: isDone ? new Date().toISOString() : undefined,
          due_date: isDone ? 'انجام شده' : t.due_date,
        };
      }
      return t;
    });
    setStored(STORAGE_KEYS.TASKS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
      } catch (e) {
        console.warn('Supabase status update error', e);
      }
    }

    return updated;
  },

  async deleteTask(taskId: string): Promise<Task[]> {
    const current = getStored<Task[]>(STORAGE_KEYS.TASKS, SEED_TASKS);
    const updated = current.filter((t) => t.id !== taskId);
    setStored(STORAGE_KEYS.TASKS, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('tasks').delete().eq('id', taskId);
      } catch (e) {
        console.warn('Supabase task delete error', e);
      }
    }

    return updated;
  },

  // Time Tracking
  getTimeEntries(): TimeEntry[] {
    return getStored<TimeEntry[]>(STORAGE_KEYS.TIME_ENTRIES, SEED_TIME_ENTRIES);
  },

  saveTimeEntries(entries: TimeEntry[]): void {
    setStored(STORAGE_KEYS.TIME_ENTRIES, entries);
  },

  // Channels & Messages
  getChannels(): Channel[] {
    return getStored<Channel[]>(STORAGE_KEYS.CHANNELS, SEED_CHANNELS);
  },

  getMessages(channelId: string): Message[] {
    const allMessages = getStored<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    return allMessages[channelId] || [];
  },

  sendMessage(channelId: string, content: string): Message {
    const currentUser = this.getCurrentUser();
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      channel_id: channelId,
      user_id: currentUser.id,
      user: currentUser,
      content,
      created_at: new Date().toISOString(),
    };

    const allMessages = getStored<Record<string, Message[]>>(STORAGE_KEYS.MESSAGES, SEED_MESSAGES);
    const channelMsgs = allMessages[channelId] || [];
    allMessages[channelId] = [...channelMsgs, newMsg];
    setStored(STORAGE_KEYS.MESSAGES, allMessages);

    // Update channel last message
    const channels = this.getChannels();
    const updatedChannels = channels.map((c) => {
      if (c.id === channelId) {
        return {
          ...c,
          last_message: content,
          last_time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        };
      }
      return c;
    });
    setStored(STORAGE_KEYS.CHANNELS, updatedChannels);

    return newMsg;
  },

  // Personal Notes
  getNotes(): PersonalNote[] {
    const currentUser = this.getCurrentUser();
    const allNotes = getStored<PersonalNote[]>(STORAGE_KEYS.NOTES, SEED_NOTES);
    return allNotes.filter((n) => n.user_id === currentUser.id);
  },

  saveNote(noteData: Partial<PersonalNote>): PersonalNote {
    const currentUser = this.getCurrentUser();
    const allNotes = getStored<PersonalNote[]>(STORAGE_KEYS.NOTES, SEED_NOTES);

    if (noteData.id) {
      const updated = allNotes.map((n) =>
        n.id === noteData.id
          ? {
              ...n,
              title: noteData.title ?? n.title,
              content: noteData.content ?? n.content,
              is_pinned: noteData.is_pinned ?? n.is_pinned,
              color: noteData.color ?? n.color,
              updated_at: new Date().toISOString(),
            }
          : n
      );
      setStored(STORAGE_KEYS.NOTES, updated);
      return updated.find((n) => n.id === noteData.id)!;
    } else {
      const newNote: PersonalNote = {
        id: `note-${Date.now()}`,
        user_id: currentUser.id,
        title: noteData.title || 'یادداشت جدید',
        content: noteData.content || '',
        is_pinned: noteData.is_pinned ?? false,
        color: noteData.color || '#6859f5',
        updated_at: new Date().toISOString(),
      };
      setStored(STORAGE_KEYS.NOTES, [newNote, ...allNotes]);
      return newNote;
    }
  },

  deleteNote(noteId: string): void {
    const allNotes = getStored<PersonalNote[]>(STORAGE_KEYS.NOTES, SEED_NOTES);
    setStored(
      STORAGE_KEYS.NOTES,
      allNotes.filter((n) => n.id !== noteId)
    );
  },

  // Notifications
  getNotifications(): NotificationItem[] {
    return getStored<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  },

  markNotificationRead(id: string): void {
    const current = this.getNotifications();
    const updated = current.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  markAllNotificationsRead(): void {
    const current = this.getNotifications();
    const updated = current.map((n) => ({ ...n, is_read: true }));
    setStored(STORAGE_KEYS.NOTIFICATIONS, updated);
  },
};
