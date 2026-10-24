import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  CheckSquare,
  CalendarDays,
  Clock,
  PieChart,
  MessageSquare,
  StickyNote,
  Settings,
  LogOut,
  Orbit,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';

export type NavTab =
  | 'dashboard'
  | 'projects'
  | 'my_task'
  | 'calendar'
  | 'time_manage'
  | 'reports'
  | 'messages'
  | 'notes'
  | 'settings';

interface NavigationSidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadCount?: number;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  currentTab,
  onSelectTab,
  unreadCount = 0,
}) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { id: 'dashboard' as NavTab, label: 'داشبورد', icon: LayoutDashboard },
    { id: 'projects' as NavTab, label: 'پروژه‌ها', icon: FolderGit2 },
    { id: 'my_task' as NavTab, label: 'تسک‌های من', icon: CheckSquare },
    { id: 'calendar' as NavTab, label: 'تقویم و زمان‌بندی', icon: CalendarDays },
    { id: 'time_manage' as NavTab, label: 'مدیریت زمان', icon: Clock },
    { id: 'reports' as NavTab, label: 'گزارش‌ها و بازدهی', icon: PieChart },
    {
      id: 'messages' as NavTab,
      label: 'پیام‌ها و گفتگو',
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { id: 'notes' as NavTab, label: 'یادداشت‌های شخصی', icon: StickyNote },
    { id: 'settings' as NavTab, label: 'تنظیمات سامانه', icon: Settings },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#141620] flex-shrink-0 flex flex-col py-6 px-4 md:px-5 border-l border-[#1e2230] select-none text-right">
      {/* Brand Header with New Logo and Persian Name: مدار */}
      <div className="flex items-center justify-between px-2 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6859f5] via-[#8083ff] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#6859f5]/30">
            <Orbit className="w-6 h-6 text-white stroke-[2.2] animate-spin-slow" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block font-headline">
              سامانه مدار
            </span>
            <span className="text-[10px] font-mono text-[#787e93] block">
              فضای ابری مدیریت پروژه
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 space-y-1.5 text-xs font-semibold tracking-wide">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 text-right ${
                isActive
                  ? 'text-white active-nav-glow font-bold shadow-lg shadow-[#6859f5]/30'
                  : 'text-[#82889e] hover:text-white hover:bg-[#1a1d2b]'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge ? (
                <span className="px-1.5 py-0.5 rounded-full bg-[#8083ff] text-white text-[10px] font-mono font-bold">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* User profile footer */}
      <div className="pt-4 mt-4 border-t border-[#1f2334] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={user?.avatar_url}
            alt={user?.full_name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#292f44]"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{user?.full_name}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">{user?.job_title || user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="خروج از حساب"
          className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-[#1a1d2c] transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Theme Switcher Button */}
      <button
        onClick={toggleTheme}
        className="w-full mt-3 py-2 px-3 rounded-xl border border-[#242838] bg-[#1b1e2a] hover:border-[#6859f5]/50 flex items-center justify-between text-xs transition-colors cursor-pointer"
        title="تغییر تم برنامه (تیره / روشن)"
      >
        <div className="flex items-center gap-2">
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          )}
          <span className="font-mono text-[11px] text-slate-300">
            {isDark ? 'تم روز (حالت روشن)' : 'تم شب (حالت تیره)'}
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/30 text-slate-300 font-semibold">
          {isDark ? 'تیره' : 'روشن'}
        </span>
      </button>

      {/* Bottom version & status */}
      <div className="pt-3 flex items-center justify-between text-xs text-[#6e748b] font-mono">
        <span>نسخه ۲.۴.۰ تیمی</span>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
          <span className="text-[10px] text-emerald-400">متصل</span>
        </div>
      </div>
    </aside>
  );
};
