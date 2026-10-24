import React, { useState } from 'react';
import { Plus, MoreHorizontal, Check, Trash2, Tag, Calendar, UserPlus } from 'lucide-react';
import { Task, TaskStatus, PriorityLevel, Project } from '../../types/database.ts';
import { SEED_PROFILES } from '../../services/db.ts';

interface MyTasksViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  onAddTask: (task: Partial<Task>) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
}

export const MyTasksView: React.FC<MyTasksViewProps> = ({
  tasks,
  projects,
  searchQuery,
  onAddTask,
  onUpdateStatus,
  onDeleteTask,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newProject, setNewProject] = useState(projects[0]?.name || 'پروژه عمومی');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('high');
  const [newStatus, setNewStatus] = useState<TaskStatus>('in_progress');
  const [newDueDate, setNewDueDate] = useState('۳۰ آبان');
  const [newTags, setNewTags] = useState('اصلی, طراحی');

  // Filter tasks
  const filtered = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterMode === 'in_progress') {
      return t.status === 'in_progress' || t.status === 'todo';
    }
    if (filterMode === 'completed') {
      return t.status === 'completed';
    }
    return true;
  });

  const todoAndInProgress = filtered.filter((t) => t.status === 'todo' || t.status === 'in_progress');
  const inReview = filtered.filter((t) => t.status === 'in_review');
  const completed = filtered.filter((t) => t.status === 'completed');

  const countAll = tasks.length;
  const countInProgress = tasks.filter((t) => t.status === 'in_progress' || t.status === 'todo').length;
  const countCompleted = tasks.filter((t) => t.status === 'completed').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const proj = projects.find((p) => p.name === newProject) || projects[0];
    onAddTask({
      title: newTitle,
      description: newDesc,
      project_id: proj?.id,
      project_name: proj?.name || newProject,
      priority: newPriority,
      status: newStatus,
      due_date: newStatus === 'completed' ? 'انجام شده' : `موعد: ${newDueDate}`,
      tags: newTags.split(',').map((s) => s.trim()).filter(Boolean),
      assignees: [SEED_PROFILES[0]],
    });

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const renderStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'in_progress':
      case 'todo':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            {status === 'todo' ? 'برای انجام' : 'در حال انجام'}
          </span>
        );
      case 'in_review':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-[#00b7ff]/10 text-[#00b7ff] border border-[#00b7ff]/30">
            در انتظار بررسی
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-[#00c389]/10 text-[#00c389] border border-[#00c389]/30">
            تکمیل شده
          </span>
        );
    }
  };

  const renderPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-red-400 bg-red-500/10 border border-red-500/30">
            اولویت بالا
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20">
            اولویت متوسط
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider text-slate-400 bg-[#232738] border border-[#2d3348]">
            عادی
          </span>
        );
    }
  };

  const renderTaskCard = (task: Task) => {
    const isDone = task.status === 'completed';

    return (
      <article
        key={task.id}
        className={`bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle flex flex-col justify-between hover:border-[#2e3349] transition-all group ${
          isDone ? 'opacity-90' : ''
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-4">
            {renderStatusBadge(task.status)}
            <div className="flex items-center gap-2">
              {renderPriorityBadge(task.priority)}
              <button
                onClick={() => onDeleteTask(task.id)}
                title="حذف تسک"
                className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <h3
            onClick={() => setSelectedTask(task)}
            className="text-base font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {task.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {task.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider bg-[#232738] border border-[#2d3348] text-slate-300 font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#25293a] flex items-center justify-between">
          <div className="flex items-center -space-x-2">
            {task.assignees.map((a, i) => (
              <img
                key={i}
                src={a.avatar_url}
                alt={a.full_name}
                title={a.full_name}
                className="w-7 h-7 rounded-full ring-2 ring-[#1b1e2a] object-cover"
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-lg ${
                isDone
                  ? 'text-[#00c389] bg-[#00c389]/10 border border-[#00c389]/30'
                  : 'text-amber-500/90 bg-amber-500/10 border border-amber-500/20'
              }`}
            >
              {task.due_date}
            </span>

            {/* Quick status toggle button */}
            <button
              onClick={() => {
                const nextStatus: TaskStatus =
                  task.status === 'todo'
                    ? 'in_progress'
                    : task.status === 'in_progress'
                    ? 'in_review'
                    : task.status === 'in_review'
                    ? 'completed'
                    : 'in_progress';
                onUpdateStatus(task.id, nextStatus);
              }}
              title="تغییر وضعیت به مرحله بعد"
              className={`p-1.5 rounded-lg border transition-all ${
                isDone
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-[#232738] border-[#2d3348] text-slate-400 hover:text-white'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-6 text-right">
      {/* Subheader / Tabs Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-headline">تسک‌های اسپرینت</h1>
          <p className="text-xs text-slate-400 mt-0.5">مدیریت، پیگیری و تحویل نیازمندی‌های فاز جاری پروژه</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#191c28] p-1 rounded-xl flex items-center border border-[#232738] text-xs font-semibold">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'all' ? 'bg-[#252a3b] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              همه ({countAll})
            </button>
            <button
              onClick={() => setFilterMode('in_progress')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'in_progress' ? 'bg-[#252a3b] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              در حال اقدام ({countInProgress})
            </button>
            <button
              onClick={() => setFilterMode('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterMode === 'completed' ? 'bg-[#252a3b] text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              تکمیل شده ({countCompleted})
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>افزودن تسک</span>
          </button>
        </div>
      </div>

      {/* Main Responsive 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Active Sprint Tasks */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-400">
              برای انجام و در حال اقدام ({todoAndInProgress.length})
            </span>
            <button
              onClick={() => {
                setNewStatus('in_progress');
                setShowAddModal(true);
              }}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {todoAndInProgress.length === 0 ? (
            <div className="p-8 border border-dashed border-[#242838] rounded-3xl text-center text-xs text-slate-500">
              تسکی در این وضعیت وجود ندارد.
            </div>
          ) : (
            todoAndInProgress.map(renderTaskCard)
          )}
        </div>

        {/* Column 2: In Review & QA Tasks */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-400">
              در انتظار بررسی و QA ({inReview.length})
            </span>
            <button
              onClick={() => {
                setNewStatus('in_review');
                setShowAddModal(true);
              }}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {inReview.length === 0 ? (
            <div className="p-8 border border-dashed border-[#242838] rounded-3xl text-center text-xs text-slate-500">
              تسکی در انتظار بررسی وجود ندارد.
            </div>
          ) : (
            inReview.map(renderTaskCard)
          )}
        </div>

        {/* Column 3: Completed Tasks */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-400">
              تکمیل شده و تحویل ({completed.length})
            </span>
            <button
              onClick={() => {
                setNewStatus('completed');
                setShowAddModal(true);
              }}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {completed.length === 0 ? (
            <div className="p-8 border border-dashed border-[#242838] rounded-3xl text-center text-xs text-slate-500">
              هنوز تسک انجام شده‌ای ثبت نشده است.
            </div>
          ) : (
            completed.map(renderTaskCard)
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-right">
            <h3 className="text-lg font-bold text-white mb-1 font-headline">ثبت تسک جدید</h3>
            <p className="text-xs text-slate-400 mb-5">عنوان، شرح و اولویت نیازمندی را تعیین فرمایید</p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  عنوان تسک
                </label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: بازبینی نهایی رابط کاربری"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6859f5]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  توضیحات و مشخصات فنی
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="جزئیات و چک‌لیست تحویل تسک..."
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#6859f5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    پروژه مرتبط
                  </label>
                  <select
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6859f5]"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    سطح اولویت
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6859f5]"
                  >
                    <option value="high">بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="normal">عادی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    وضعیت اولیه
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6859f5]"
                  >
                    <option value="todo">برای انجام</option>
                    <option value="in_progress">در حال انجام</option>
                    <option value="in_review">در انتظار بررسی</option>
                    <option value="completed">تکمیل شده</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    سررسید یا موعد
                  </label>
                  <input
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    placeholder="مثال: ۲۸ آبان"
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6859f5]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  برچسب‌ها (با ویرگول جدا کنید)
                </label>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="فرانت‌اند، طراحی"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6859f5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-[#232738]"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple hover:brightness-110"
                >
                  ذخیره تسک
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative text-right">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {renderStatusBadge(selectedTask.status)}
                {renderPriorityBadge(selectedTask.priority)}
              </div>
              <button
                onClick={() => {
                  onDeleteTask(selectedTask.id);
                  setSelectedTask(null);
                }}
                className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10 flex items-center gap-1 text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" /> حذف تسک
              </button>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 font-headline">{selectedTask.title}</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">{selectedTask.description}</p>

            <div className="bg-[#0c0e13] p-4 rounded-2xl border border-[#282a30] space-y-3 mb-5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">پروژه:</span>
                <span className="text-white font-medium">{selectedTask.project_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">سررسید:</span>
                <span className="text-amber-400 font-mono text-[11px]">{selectedTask.due_date}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                تغییر مرحله اسپرینت
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(['todo', 'in_progress', 'in_review', 'completed'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      onUpdateStatus(selectedTask.id, st);
                      setSelectedTask({ ...selectedTask, status: st });
                    }}
                    className={`py-2 px-1 text-[10px] font-bold rounded-xl border transition-all text-center ${
                      selectedTask.status === st
                        ? 'bg-[#6859f5] border-[#6859f5] text-white shadow-sm'
                        : 'bg-[#232738] border-[#2d3348] text-slate-400 hover:text-white'
                    }`}
                  >
                    {st === 'todo'
                      ? 'برای انجام'
                      : st === 'in_progress'
                      ? 'در حال اقدام'
                      : st === 'in_review'
                      ? 'بررسی'
                      : 'انجام شد'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2 bg-[#232738] text-white text-xs font-semibold rounded-xl hover:bg-[#2e3349]"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
