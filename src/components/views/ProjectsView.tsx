import React, { useState } from 'react';
import { Plus, Star, MoreVertical, Trash2, FolderPlus } from 'lucide-react';
import { Project, ProjectStatus, PriorityLevel } from '../../types/database.ts';

interface ProjectsViewProps {
  projects: Project[];
  searchQuery: string;
  onToggleStar: (id: string) => void;
  onAddProject: (project: Partial<Project>) => void;
  onDeleteProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  searchQuery,
  onToggleStar,
  onAddProject,
  onDeleteProject,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [status, setStatus] = useState<ProjectStatus>('in_progress');
  const [dueDate, setDueDate] = useState('۳۰ آبان');
  const [tags, setTags] = useState('وب‌سایت، محصول');

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === 'starred') return p.is_starred;
    if (filterStatus !== 'all') return p.status === filterStatus;
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProject({
      name,
      client_name: clientName || 'داخلی',
      description,
      priority,
      status,
      due_date: dueDate,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      tasks_total: 5,
      tasks_done: status === 'completed' ? 5 : 1,
      progress_percentage: status === 'completed' ? 100 : 20,
    });

    setName('');
    setClientName('');
    setDescription('');
    setShowModal(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-headline">فهرست پروژه‌ها</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            تعریف پروژه‌های کاری، مانیتورینگ پیشرفت و زمان‌بندی تحویل
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#191c28] p-1 rounded-xl flex items-center border border-[#232738] text-xs font-semibold">
            {[
              { id: 'all', label: 'همه' },
              { id: 'in_progress', label: 'در حال انجام' },
              { id: 'upcoming', label: 'در انتظار' },
              { id: 'completed', label: 'تکمیل شده' },
              { id: 'starred', label: 'ستاره‌دار' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterStatus === st.id ? 'bg-[#252a3b] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple hover:brightness-110 transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>پروژه جدید</span>
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="bg-[#1b1e2a] rounded-3xl p-12 border border-[#242838] text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#232738] flex items-center justify-center mx-auto text-[#8083ff]">
            <FolderPlus className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-semibold text-white">پروژه‌ای یافت نشد</h3>
          <p className="text-xs text-slate-400">می‌توانید اولین پروژه واقعی خود را به سادگی تعریف نمایید.</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple"
          >
            + ثبت اولین پروژه
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <section
              key={proj.id}
              className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle relative hover:border-[#2e3349] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-wide font-headline">{proj.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{proj.client_name}</p>
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
                      className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed">{proj.description}</p>

                {/* Status and Priority pills */}
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`text-[10px] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-md ${
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
                      ? 'در انتظار شروع'
                      : 'در حال انجام'}
                  </span>
                  <span className="text-[10px] tracking-wider font-semibold text-slate-400 border border-[#2d3348] px-2.5 py-0.5 rounded-md font-mono">
                    {proj.priority === 'high'
                      ? 'اولویت بالا'
                      : proj.priority === 'medium'
                      ? 'اولویت متوسط'
                      : 'اولویت عادی'}
                  </span>
                </div>

                {/* Progress info */}
                <div className="mt-4">
                  <div className="flex justify-between items-center text-xs font-medium mb-1.5">
                    <span className="text-slate-400">
                      تسک‌ها: <strong className="text-slate-200">{proj.tasks_done}</strong> از {proj.tasks_total}
                    </span>
                    <span className="text-slate-300 font-mono text-[11px]">{proj.progress_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#1c1f28] h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        proj.status === 'completed'
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500'
                          : 'bg-gradient-to-r from-sky-400 to-cyan-400'
                      }`}
                      style={{ width: `${proj.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4">
                  {proj.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#232738] border border-[#2d3348] text-slate-300 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom info */}
              <div className="mt-5 pt-3 border-t border-[#25293a] flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-500/90 tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md font-mono">
                  سررسید: {proj.due_date}
                </span>
                <button
                  onClick={() => onDeleteProject(proj.id)}
                  className="text-[11px] text-red-400/80 hover:text-red-400 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> حذف
                </button>
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1 font-headline">ثبت پروژه جدید</h3>
            <p className="text-xs text-slate-400 mb-5">تعیین مشخصات اولیه و نیازمندی‌های پروژه</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">نام پروژه</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: توسعه سامانه مدیریت منابع"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">کارفرما یا دپارتمان</label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="مثال: دپارتمان فنی"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">توضیحات و دامنه کار</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اهداف اصلی پروژه..."
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">وضعیت</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="in_progress">در حال انجام</option>
                    <option value="upcoming">در انتظار شروع</option>
                    <option value="completed">تکمیل شده</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">اولویت</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="high">بالا</option>
                    <option value="medium">متوسط</option>
                    <option value="low">عادی</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">موعد تحویل</label>
                  <input
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="مثال: ۳۰ آذر"
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">برچسب‌ها</label>
                  <input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="فرانت‌اند، وب"
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
