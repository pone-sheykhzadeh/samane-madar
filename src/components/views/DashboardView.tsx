import React, { useState, useEffect } from 'react';
import {
  Star,
  MoreVertical,
  Check,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
  FolderPlus,
  ArrowUpLeft,
} from 'lucide-react';
import { Project, Task, TimeEntry, TaskStatus } from '../../types/database.ts';

interface DashboardViewProps {
  projects: Project[];
  tasks: Task[];
  timeEntries: TimeEntry[];
  onToggleStar: (id: string) => void;
  onSelectProject: (project: Project) => void;
  onOpenMessages: (partnerName?: string) => void;
  onNavigateToTasks: () => void;
  onAddTask: (task: Partial<Task>) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onAddProject: (project: Partial<Project>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  tasks,
  timeEntries: initialTimeEntries,
  onToggleStar,
  onSelectProject,
  onOpenMessages,
  onNavigateToTasks,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onDeleteProject,
  onAddProject,
}) => {
  // Timer state for live stopwatch
  const [activeTimerSeconds, setActiveTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTimerLabel, setActiveTimerLabel] = useState('شروع جلسه کاری');

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  // Real-Time Calendar State
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Month names in Persian & Solar/Gregorian
  const monthNamesPersian = [
    'ژانویه (دی/بهمن)',
    'فوریه (بهمن/اسفند)',
    'مارس (اسفند/فروردین)',
    'آوریل (فروردین/اردیبهشت)',
    'مه (اردیبهشت/خرداد)',
    'ژوئن (خرداد/تیر)',
    'ژوئیه (تیر/مرداد)',
    'اوت (مرداد/شهریور)',
    'سپتامبر (شهریور/مهر)',
    'اکتبر (مهر/آبان)',
    'نوامبر (آبان/آذر)',
    'دسامبر (آذر/دی)',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();

  // Dynamic project metric calculations from real data
  const upcomingCount = projects.filter((p) => p.status === 'upcoming').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const totalCount = projects.length;

  // New quick task input state
  const [quickTaskTitle, setQuickTaskTitle] = useState('');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');

  const handleQuickAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskTitle.trim()) return;
    onAddTask({
      title: quickTaskTitle.trim(),
      description: 'ثبت شده از داشبورد سریع',
      priority: 'high',
      status: 'in_progress',
      due_date: 'موعد: هفته جاری',
      tags: ['تسک جدید'],
    });
    setQuickTaskTitle('');
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onAddProject({
      name: newProjectName.trim(),
      client_name: newProjectClient.trim() || 'کارفرما',
      description: 'پروژه جدید ایجاد شده توسط کاربر',
      priority: 'high',
      status: 'in_progress',
      tasks_total: 5,
      tasks_done: 0,
      progress_percentage: 0,
      due_date: 'پایان ماه',
      tags: ['پروژه جدید'],
    });
    setNewProjectName('');
    setNewProjectClient('');
    setShowAddProjectModal(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-right">
      {/* Top 4 Project Status Metric Cards - Dynamically calculated from real project state */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Upcomings (Blue) */}
        <div className="bg-[#4a8df8] rounded-3xl p-5 flex flex-col items-center justify-center text-center text-white shadow-lg transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-white text-xl">campaign</span>
          </div>
          <span className="text-xs font-medium text-blue-100 opacity-90 font-mono">در انتظار شروع</span>
          <span className="text-xl font-bold mt-0.5 tracking-tight font-headline">
            {upcomingCount} پروژه
          </span>
        </div>

        {/* Completed (Pink) */}
        <div className="bg-[#ff4f8e] rounded-3xl p-5 flex flex-col items-center justify-center text-center text-white shadow-lg transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-white text-xl">check</span>
          </div>
          <span className="text-xs font-medium text-pink-100 opacity-90 font-mono">انجام شده</span>
          <span className="text-xl font-bold mt-0.5 tracking-tight font-headline">
            {completedCount} پروژه
          </span>
        </div>

        {/* In Progress (Lavender/Purple) */}
        <div className="bg-[#8088ff] rounded-3xl p-5 flex flex-col items-center justify-center text-center text-white shadow-lg transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-white text-xl">settings</span>
          </div>
          <span className="text-xs font-medium text-indigo-100 opacity-90 font-mono">در حال انجام</span>
          <span className="text-xl font-bold mt-0.5 tracking-tight font-headline">
            {inProgressCount} پروژه
          </span>
        </div>

        {/* Total (Yellow) */}
        <div className="bg-[#fcd36a] rounded-3xl p-5 flex flex-col items-center justify-center text-center text-[#232014] shadow-lg transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-gray-800 text-xl">inventory_2</span>
          </div>
          <span className="text-xs font-semibold text-gray-700 opacity-90 font-mono">کل پروژه‌ها</span>
          <span className="text-xl font-extrabold mt-0.5 tracking-tight text-gray-900 font-headline">
            {totalCount} پروژه
          </span>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Column 1: Real User Projects (Google and Slack boxes deleted per user instructions!) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-semibold text-white font-headline">پروژه‌های جاری</h2>
            <button
              onClick={() => setShowAddProjectModal(true)}
              className="text-xs text-[#8083ff] hover:underline flex items-center gap-1 font-mono"
            >
              <Plus className="w-3.5 h-3.5" /> پروژه جدید
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="bg-[#1b1e2a] rounded-3xl p-8 border border-[#242838] text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#232738] flex items-center justify-center mx-auto text-[#8083ff]">
                <FolderPlus className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400">هیچ پروژه‌ای ثبت نشده است. اولین پروژه خود را اضافه کنید.</p>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple"
              >
                + ایجاد پروژه
              </button>
            </div>
          ) : (
            projects.map((proj) => (
              <section
                key={proj.id}
                className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle relative hover:border-[#2e3349] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#11131a] flex items-center justify-center border border-[#262b3c] text-[#8083ff] font-bold text-base font-headline">
                      {proj.name.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white tracking-wide">{proj.name}</h3>
                      <p className="text-xs text-slate-400">{proj.client_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400">
                    <button
                      onClick={() => onToggleStar(proj.id)}
                      className={proj.is_starred ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => onDeleteProject(proj.id)}
                      title="حذف پروژه"
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Priority & Status Tag */}
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-md ${
                      proj.status === 'completed'
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : proj.status === 'upcoming'
                        ? 'text-blue-400 bg-blue-500/10'
                        : 'text-amber-400 bg-amber-500/10'
                    }`}
                  >
                    {proj.status === 'completed'
                      ? 'تکمیل شده'
                      : proj.status === 'upcoming'
                      ? 'در انتظار'
                      : 'در حال پیشرفت'}
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-semibold text-red-400 border border-red-500/30 px-2.5 py-0.5 rounded-md font-mono">
                    {proj.priority === 'high' ? 'اولویت بالا' : 'اولویت عادی'}
                  </span>
                </div>

                {/* Progress Info */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                    <span className="text-slate-400">
                      تسک‌های انجام شده: <strong className="text-slate-200">{proj.tasks_done}</strong> از{' '}
                      {proj.tasks_total}
                    </span>
                    <span className="text-slate-300 font-mono text-[11px]">{proj.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#1c1f28] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-cyan-400 h-full rounded-full transition-all"
                      style={{ width: `${proj.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-4">
                  {proj.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-[#38bdf8]/15 text-[#38bdf8] tracking-wider font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Due Date Bottom Badge */}
                <div className="mt-4 pt-1">
                  <span className="text-[10px] font-bold text-amber-500/90 tracking-widest bg-amber-500/10 px-3 py-1 rounded-md font-mono">
                    موعد تحویل: {proj.due_date}
                  </span>
                </div>
              </section>
            ))
          )}
        </div>

        {/* Column 2: Center (My Tasks & Focus Time Tracker) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* My Tasks List Card - Dynamically loaded from real tasks state */}
          <section className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-white font-headline">تسک‌های من</h2>
                <span className="text-xs font-mono text-slate-400">({tasks.length})</span>
              </div>
              <button
                onClick={onNavigateToTasks}
                className="text-xs text-[#8083ff] hover:underline flex items-center gap-1 font-mono"
              >
                میز کار اسپرینت <ArrowUpLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick add task input */}
            <form onSubmit={handleQuickAddTask} className="mb-4">
              <div className="flex items-center gap-2 bg-[#11131a] rounded-xl px-3 py-1.5 border border-[#282a30]">
                <input
                  value={quickTaskTitle}
                  onChange={(e) => setQuickTaskTitle(e.target.value)}
                  placeholder="افزودن سریع تسک جدید..."
                  className="bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="p-1 rounded-lg bg-[#6859f5] text-white hover:brightness-110"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="space-y-3 text-xs max-h-72 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <p className="text-slate-500 py-4 text-center">هنوز هیچ تسکی ثبت نشده است.</p>
              ) : (
                tasks.map((task, idx) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between group py-1.5 border-b border-[#242838]/60 last:border-0 ${
                        isDone ? 'text-slate-500' : 'text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => onUpdateTaskStatus(task.id, isDone ? 'in_progress' : 'completed')}
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors ${
                            isDone
                              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                              : 'border-slate-600 hover:border-slate-400'
                          }`}
                        >
                          {isDone && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </button>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className={`truncate text-xs ${isDone ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          title="حذف تسک"
                          className="text-slate-600 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Time Tracker Sub-Card */}
          <section className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-white tracking-wide font-headline">تایمر تمرکز کاری</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="w-6 h-6 rounded-full bg-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white"
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
              </button>
            </div>

            <div className="bg-[#2c2625] -mx-6 px-6 py-3 border-r-2 border-amber-500 flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <input
                  value={activeTimerLabel}
                  onChange={(e) => setActiveTimerLabel(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-200 border-0 focus:outline-none w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-500 tracking-wide font-mono">
                  {formatTimer(activeTimerSeconds)}
                </span>
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow"
                >
                  {isTimerRunning ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current ml-0.5" />}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Column 3: Right (REAL-TIME CALENDAR & Messages Panel) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* REAL-TIME Calendar Card */}
          <section className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white tracking-wide font-headline">
                {monthNamesPersian[month]} {year}
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  title="ماه قبل"
                  className="w-6 h-6 rounded-full bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronRight className="w-3 h-3 stroke-[2.5]" />
                </button>
                <button
                  onClick={handleNextMonth}
                  title="ماه بعد"
                  className="w-6 h-6 rounded-full bg-fuchsia-600/80 hover:bg-fuchsia-500 text-white flex items-center justify-center transition-colors"
                >
                  <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Weekday Headers in Persian */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 tracking-wider mb-2 font-mono">
              <span>ش</span>
              <span>ی</span>
              <span>د</span>
              <span>س</span>
              <span>چ</span>
              <span>پ</span>
              <span>ج</span>
            </div>

            {/* Days Grid - Real-time computation */}
            <div className="grid grid-cols-7 text-center text-xs gap-y-2.5 font-medium text-slate-400 font-mono">
              {/* Previous month filler days */}
              {Array.from({ length: (firstDayOfMonth + 1) % 7 }).map((_, i) => (
                <span key={`prev-${i}`} className="text-slate-600 text-[11px]">
                  {daysInPrevMonth - ((firstDayOfMonth + 1) % 7) + 1 + i}
                </span>
              ))}

              {/* Current month real days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isToday = isCurrentMonth && dayNum === todayDate;
                return (
                  <div key={`day-${dayNum}`} className="flex items-center justify-center">
                    {isToday ? (
                      <span className="w-7 h-7 bg-amber-500 text-white font-bold rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                        {String(dayNum).padStart(2, '0')}
                      </span>
                    ) : (
                      <span className="text-slate-300 hover:text-white cursor-pointer">
                        {String(dayNum).padStart(2, '0')}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Messages Panel - Defaults to 0 / Real thread */}
          <section className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white tracking-wide font-headline">پیام‌ها و گفتگو</h2>
              <button
                onClick={() => onOpenMessages()}
                className="text-xs text-[#8083ff] hover:underline font-mono"
              >
                ورود به چت
              </button>
            </div>

            <div
              onClick={() => onOpenMessages('گفتگوی عمومی')}
              className="flex items-center gap-3 cursor-pointer group p-2 rounded-2xl hover:bg-[#202432] transition-colors"
            >
              <div className="relative w-10 h-10 rounded-full bg-[#282a30] flex items-center justify-center font-bold text-sm text-[#7bd0ff]">
                عمومی
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  گفتگوی عمومی تیم
                </h4>
                <p className="text-[11px] text-slate-400 truncate">ارتباطات و اعلان‌های سریع اعضا</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal for adding a new project */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-1 font-headline">ایجاد پروژه جدید</h3>
            <p className="text-xs text-slate-400 mb-5">مشخصات پروژه را برای مدیریت اسپرینت وارد نمایید</p>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">نام پروژه</label>
                <input
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="مثال: بازطراحی پرتال کاربری"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">کارفرما / واحد مربوطه</label>
                <input
                  value={newProjectClient}
                  onChange={(e) => setNewProjectClient(e.target.value)}
                  placeholder="مثال: تیم محصول"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProjectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple"
                >
                  ثبت پروژه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
