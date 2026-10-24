import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  AlertCircle,
  X,
} from 'lucide-react';
import { dbService } from '../../services/db.ts';
import { Task, Project, UserProfile, TimelineTask } from '../../types/database.ts';

interface CalendarTimelineViewProps {
  tasks: Task[];
  projects: Project[];
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({ tasks, projects }) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [members, setMembers] = useState<UserProfile[]>(() => dbService.getTeamMembers());
  const [timelineTasks, setTimelineTasks] = useState<TimelineTask[]>(() => dbService.getTimelineTasks());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Modals state
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('کارشناس توسعه');

  const [showAddTimelineModal, setShowAddTimelineModal] = useState(false);
  const [newTlTitle, setNewTlTitle] = useState('');
  const [newTlStartDay, setNewTlStartDay] = useState(2);
  const [newTlSpan, setNewTlSpan] = useState(4);
  const [newTlColor, setNewTlColor] = useState('#8183fe');

  const daysLabels = [
    'شنبه',
    'یک‌شنبه',
    'دوشنبه',
    'سه‌شنبه',
    'چهارشنبه',
    'پنج‌شنبه',
    'جمعه',
    'شنبه',
    'یک‌شنبه',
    'دوشنبه',
    'سه‌شنبه',
  ];

  const upcomingCount = projects.filter((p) => p.status === 'upcoming').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const totalCount = projects.length;

  // Member handlers
  const handleDeleteMember = (memberId: string) => {
    if (members.length <= 1) {
      setActionNotice('حداقل یک عضو (مدیر ارشد) باید در سامانه باقی بماند.');
      setTimeout(() => setActionNotice(null), 4000);
      return;
    }
    const updated = dbService.deleteMember(memberId);
    setMembers(updated);
    setActionNotice('عضو با موفقیت از تیم حذف شد.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const added = dbService.addMember({
      full_name: newMemberName.trim(),
      job_title: newMemberRole.trim(),
      role: 'Member',
    });
    setMembers([...members, added]);
    setNewMemberName('');
    setShowAddMemberModal(false);
    setActionNotice(`عضو جدید (${added.full_name}) افزوده شد.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  // Timeline task handlers
  const handleAddTimelineTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTlTitle.trim()) return;
    const added = dbService.addTimelineTask({
      title: newTlTitle.trim(),
      start_day: Number(newTlStartDay),
      span_days: Number(newTlSpan),
      color: newTlColor,
      project_name: projects[0]?.name || 'پروژه مدار',
    });
    setTimelineTasks([added, ...timelineTasks]);
    setNewTlTitle('');
    setShowAddTimelineModal(false);
    setActionNotice('تسک جدید به نوار زمان‌بندی اضافه شد.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleDeleteTimelineTask = (id: string) => {
    const updated = dbService.deleteTimelineTask(id);
    setTimelineTasks(updated);
    setActionNotice('تسک از نوار زمان‌بندی حذف گردید.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-right">
      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="bg-[#24283b] border border-[#8083ff]/40 text-slate-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs animate-in fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8083ff]" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 3-Card Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Project Status Summary */}
        <article className="lg:col-span-4 bg-[#15171e] rounded-3xl p-6 border border-[#20232e] shadow-xl flex flex-col justify-between">
          <h2 className="text-xl font-bold tracking-tight text-white mb-5 font-headline">وضعیت پروژه‌ها</h2>
          <div className="grid grid-cols-2 gap-3.5 flex-1">
            <div className="bg-[#4a8df8] rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white shadow-lg">
              <span className="material-symbols-outlined text-white text-xl mb-1">campaign</span>
              <span className="text-[11px] font-medium text-blue-100 font-mono">در انتظار</span>
              <span className="text-lg font-bold font-headline">{upcomingCount} پروژه</span>
            </div>
            <div className="bg-[#ff4f8e] rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white shadow-lg">
              <span className="material-symbols-outlined text-white text-xl mb-1">check</span>
              <span className="text-[11px] font-medium text-pink-100 font-mono">تکمیل شده</span>
              <span className="text-lg font-bold font-headline">{completedCount} پروژه</span>
            </div>
            <div className="bg-[#8088ff] rounded-2xl p-4 flex flex-col items-center justify-center text-center text-white shadow-lg">
              <span className="material-symbols-outlined text-white text-xl mb-1">settings</span>
              <span className="text-[11px] font-medium text-indigo-100 font-mono">در جریان</span>
              <span className="text-lg font-bold font-headline">{inProgressCount} پروژه</span>
            </div>
            <div className="bg-[#fcd36a] rounded-2xl p-4 flex flex-col items-center justify-center text-center text-[#232014] shadow-lg">
              <span className="material-symbols-outlined text-gray-800 text-xl mb-1">inventory_2</span>
              <span className="text-[11px] font-semibold text-gray-700 font-mono">مجموع</span>
              <span className="text-lg font-extrabold text-gray-900 font-headline">{totalCount} پروژه</span>
            </div>
          </div>
        </article>

        {/* Today's Active Tasks Card */}
        <article className="lg:col-span-4 bg-[#15171e] rounded-3xl p-6 border border-[#20232e] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-white font-headline">تسک‌های فعال</h2>
            <span className="text-xs text-[#8c94a8] font-mono">اسپرینت تیمی</span>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-around">
            {tasks.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">تسکی ثبت نشده است.</p>
            ) : (
              tasks.slice(0, 3).map((task) => (
                <div
                  key={task.id}
                  className="bg-[#1b1e27] hover:bg-[#202430] border border-[#262b3a] rounded-2xl p-3.5 flex items-center justify-between transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-wide">{task.title}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <img
                        alt=""
                        className="w-5 h-5 rounded-full object-cover border border-gray-600 bg-[#252838]"
                        src={task.assignees[0]?.avatar_url || members[0]?.avatar_url}
                      />
                      <div className="flex items-baseline gap-1 text-[11px]">
                        <span className="text-[#6d7588]">مسئول:</span>
                        <span className="text-[#b9c0d4] font-medium">
                          {task.assignees[0]?.full_name || 'مدیر ارشد'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded font-mono">
                    {task.status === 'completed' ? 'تکمیل' : 'جاری'}
                  </span>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Team Members Card: Sole Admin default + illustrated avatar + Delete button + Add Member button */}
        <article className="lg:col-span-4 bg-[#15171e] rounded-3xl p-6 border border-[#20232e] shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white font-headline">اعضای تیم</h2>
              <span className="text-xs font-mono text-[#8c94a8]">({members.length} عضو)</span>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="text-xs text-[#8083ff] hover:underline flex items-center gap-1 font-mono"
            >
              <UserPlus className="w-3.5 h-3.5" /> افزودن عضو
            </button>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[220px] pl-1">
            {members.map((m) => {
              const isAdmin = m.role === 'Admin' || m.id === 'user-admin';
              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between py-1.5 border-b border-[#20232e]/60 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      alt={m.full_name}
                      className="w-9 h-9 rounded-full object-cover ring-1 ring-[#282a30] bg-[#232738]"
                      src={m.avatar_url}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-semibold text-white leading-tight">{m.full_name}</h4>
                        {isAdmin && (
                          <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded">
                            مدیر
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#71788a] font-mono">{m.job_title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Delete member button */}
                    <button
                      onClick={() => handleDeleteMember(m.id)}
                      title="حذف عضو از تیم"
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </div>

      {/* Bottom Timeline Section (Gantt Schedule / Time Rail) with Add Task & Delete Task buttons */}
      <section className="bg-[#15171e] rounded-3xl p-6 sm:p-7 border border-[#20232e] shadow-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white font-headline">
              تایم‌لاین اسپرینت (Time Rail)
            </h2>
            {/* Button to make tasks in time rail */}
            <button
              onClick={() => setShowAddTimelineModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold shadow-glow-purple hover:brightness-110 flex items-center gap-1.5 font-mono cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افزودن تسک به نوار زمان</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-white font-headline">
              {currentDate.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long' })}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
                className="p-1.5 rounded-lg bg-[#20232e] text-slate-400 hover:text-white"
                title="ماه قبل"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
                className="p-1.5 rounded-lg bg-[#20232e] text-slate-400 hover:text-white"
                title="ماه بعد"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Gantt columns & Time Rail items */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[850px]">
            <div className="grid grid-cols-11 border-b border-[#252a38] pb-4 mb-4 text-center font-mono">
              {daysLabels.map((day, idx) => (
                <span key={idx} className="text-xs font-semibold text-[#6e7587]">
                  {day} {idx + 1}
                </span>
              ))}
            </div>

            <div className="relative flex flex-col gap-3 py-2 min-h-[140px]">
              {timelineTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-[#282a30] rounded-2xl">
                  تسکی در تایم‌لاین تعریف نشده است. با دکمه «افزودن تسک به نوار زمان» بالا تسک جدید اضافه کنید.
                </div>
              ) : (
                timelineTasks.map((item) => {
                  const safeStart = Math.max(1, Math.min(10, item.start_day));
                  const safeSpan = Math.max(1, Math.min(11 - safeStart, item.span_days));
                  return (
                    <div key={item.id} className="grid grid-cols-11 items-center h-14">
                      <div
                        className="rounded-2xl px-4 py-2.5 shadow-md flex items-center justify-between text-white transition-transform hover:scale-[1.01] group"
                        style={{
                          backgroundColor: item.color,
                          gridColumn: `${safeStart} / span ${safeSpan}`,
                        }}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold leading-tight block truncate font-headline">
                            {item.title}
                          </span>
                          <span className="text-[10px] font-mono opacity-90 block">
                            بازه زمانی: {safeSpan} روز • {item.project_name}
                          </span>
                        </div>

                        {/* Delete button on the time rail task */}
                        <button
                          onClick={() => handleDeleteTimelineTask(item.id)}
                          title="حذف تسک از نوار زمان"
                          className="p-1.5 rounded-lg bg-black/25 hover:bg-black/50 text-white/90 hover:text-white transition-colors shrink-0 mr-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modal: Add Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-1 font-headline">افزودن عضو جدید به تیم</h3>
            <p className="text-xs text-slate-400 mb-5">نام و سمت همکار جدید را وارد نمایید</p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">نام و نام خانوادگی</label>
                <input
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="مثال: سارا محمدی"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">سمت شغلی</label>
                <input
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="مثال: طراح رابط کاربری"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple"
                >
                  افزودن عضو
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Task in Time Rail */}
      {showAddTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-1 font-headline">افزودن تسک به نوار زمان (Time Rail)</h3>
            <p className="text-xs text-slate-400 mb-5">تسک را در ریل زمان‌بندی گانت جانمایی فرمایید</p>

            <form onSubmit={handleAddTimelineTask} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">عنوان تسک</label>
                <input
                  required
                  value={newTlTitle}
                  onChange={(e) => setNewTlTitle(e.target.value)}
                  placeholder="مثال: پیاده‌سازی تست‌های امنیتی و بار"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    ستون شروع (روز ۱ تا ۱۰)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newTlStartDay}
                    onChange={(e) => setNewTlStartDay(Number(e.target.value))}
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    طول بازه (تعداد روز)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newTlSpan}
                    onChange={(e) => setNewTlSpan(Number(e.target.value))}
                    className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">رنگ نوار زمان‌بندی</label>
                <div className="flex items-center gap-3">
                  {['#8183fe', '#5094ff', '#ff4f8e', '#f9cf62', '#00c389'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewTlColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        newTlColor === c ? 'scale-125 ring-2 ring-white' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddTimelineModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple"
                >
                  ثبت در تایم‌لاین
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
