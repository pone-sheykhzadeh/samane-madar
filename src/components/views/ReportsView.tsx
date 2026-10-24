import React from 'react';
import { PieChart, TrendingUp, CheckCircle, BarChart3 } from 'lucide-react';
import { Task, Project, UserProfile } from '../../types/database.ts';
import { dbService } from '../../services/db.ts';

interface ReportsViewProps {
  tasks: Task[];
  projects: Project[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ tasks, projects }) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'in_review').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeRate = totalTasks > 0 ? Math.round(((inProgressTasks + inReviewTasks) / totalTasks) * 100) : 0;

  // Workload per member
  const memberWorkload: { member: UserProfile; total: number; done: number; active: number }[] = dbService
    .getTeamMembers()
    .map((member: UserProfile) => {
    const assignedTasks = tasks.filter((t) => t.assignees.some((a) => a.id === member.id || a.email === member.email));
    const memberDone = assignedTasks.filter((t) => t.status === 'completed').length;
    return {
      member,
      total: assignedTasks.length,
      done: memberDone,
      active: assignedTasks.length - memberDone,
    };
  });

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-right">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-headline">آمار و گزارش‌های اسپرینت</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          شاخص‌های کلیدی عملکرد محاسبه شده به صورت خودکار از تسک‌ها و پروژه‌های واقعی
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1b1e2a] p-5 rounded-3xl border border-[#242838] shadow-card-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">تعداد کل تسک‌ها</span>
            <div className="text-2xl font-bold text-white font-headline mt-1">{totalTasks}</div>
            <span className="text-[10px] font-mono text-emerald-400 mt-0.5 block">محاسبه در لحظه</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1b1e2a] p-5 rounded-3xl border border-[#242838] shadow-card-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">نرخ تکمیل تسک‌ها</span>
            <div className="text-2xl font-bold text-[#00c389] font-headline mt-1">{completionRate}%</div>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">{completedTasks} تسک تکمیل شده</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1b1e2a] p-5 rounded-3xl border border-[#242838] shadow-card-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">تسک‌های در حال اجرا</span>
            <div className="text-2xl font-bold text-amber-400 font-headline mt-1">{inProgressTasks + inReviewTasks}</div>
            <span className="text-[10px] font-mono text-amber-500/80 mt-0.5 block">{activeRate}% از کل حجم اسپرینت</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-[#1b1e2a] p-5 rounded-3xl border border-[#242838] shadow-card-subtle flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">تعداد پروژه‌ها</span>
            <div className="text-2xl font-bold text-[#7bd0ff] font-headline mt-1">{projects.length}</div>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5 block">پروژه‌های ثبت شده</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
            <PieChart className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Grid: Task Breakdown & Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Status Distribution */}
        <div className="lg:col-span-5 bg-[#1b1e2a] p-6 rounded-3xl border border-[#242838] shadow-card-subtle">
          <h3 className="text-sm font-semibold text-white mb-4 font-headline">توزیع وضعیت تسک‌ها</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">تکمیل شده</span>
                <span className="font-mono text-emerald-400 font-bold">{completedTasks}</span>
              </div>
              <div className="w-full bg-[#11131a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00c389] h-full rounded-full"
                  style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">در حال انجام</span>
                <span className="font-mono text-amber-400 font-bold">{inProgressTasks}</span>
              </div>
              <div className="w-full bg-[#11131a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${totalTasks > 0 ? (inProgressTasks / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">در انتظار بررسی</span>
                <span className="font-mono text-[#00b7ff] font-bold">{inReviewTasks}</span>
              </div>
              <div className="w-full bg-[#11131a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00b7ff] h-full rounded-full"
                  style={{ width: `${totalTasks > 0 ? (inReviewTasks / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">برای انجام</span>
                <span className="font-mono text-slate-400 font-bold">{todoTasks}</span>
              </div>
              <div className="w-full bg-[#11131a] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-slate-600 h-full rounded-full"
                  style={{ width: `${totalTasks > 0 ? (todoTasks / totalTasks) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Workload */}
        <div className="lg:col-span-7 bg-[#1b1e2a] p-6 rounded-3xl border border-[#242838] shadow-card-subtle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white font-headline">تخصیص تسک‌ها به اعضای تیم</h3>
            <span className="text-xs font-mono text-slate-500">لیست نفرات</span>
          </div>

          <div className="space-y-3.5">
            {memberWorkload.map(({ member, total, done, active }) => (
              <div key={member.id} className="flex items-center justify-between text-xs py-1 border-b border-[#242838] last:border-0">
                <div className="flex items-center gap-3">
                  <img src={member.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-[#282a30]" />
                  <div>
                    <h4 className="font-semibold text-white">{member.full_name}</h4>
                    <p className="text-[10px] text-slate-400 font-mono">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                    {active} جاری
                  </span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {done} انجام شده
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
