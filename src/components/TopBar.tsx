import React, { useState } from 'react';
import { Search, Bell, Check, UserCheck, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { dbService } from '../services/db.ts';
import { NotificationItem, UserProfile } from '../types/database.ts';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  notifications: NotificationItem[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenSettings: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  onSearchChange,
  notifications,
  onMarkRead,
  onMarkAllRead,
  onOpenSettings,
}) => {
  const { user, switchUser, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <header className="h-20 px-6 md:px-10 flex items-center justify-between gap-4 border-b border-[#1b1e2a]/50 bg-[#11131a] relative z-20 text-right">
      {/* Search Bar matching design with RTL search icon on right */}
      <div className="relative w-full max-w-xl">
        <span className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500">
          <Search className="w-4 h-4" />
        </span>
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#1b1e2b] text-sm text-slate-200 placeholder-slate-500 rounded-full pr-11 pl-4 py-2.5 border border-[#262b3c] focus:outline-none focus:border-[#6859f5] focus:ring-1 focus:ring-[#6859f5] transition-all shadow-inner"
          placeholder="جستجو در تسک‌ها، پروژه‌ها، یادداشت‌ها یا پیام‌ها..."
          type="text"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 hover:text-white text-xs font-mono"
          >
            پاک کردن
          </button>
        )}
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-3">
        {/* Light Mode / Dark Mode Switch Button */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'فعال‌سازی حالت روشن (Light Mode)' : 'فعال‌سازی حالت تیره (Dark Mode)'}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all duration-200 shadow-sm cursor-pointer ${
            isDark
              ? 'bg-[#1b1e2b] border-[#262b3c] hover:border-[#6859f5]/60 text-slate-300 hover:text-white'
              : 'bg-slate-100 border-slate-300 hover:border-[#6859f5] text-slate-700 hover:text-slate-900 shadow-sm'
          }`}
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow shrink-0" />
              <span className="hidden sm:inline font-medium text-[11px]">حالت روشن</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="hidden sm:inline font-medium text-[11px]">حالت تیره</span>
            </>
          )}
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            aria-label="اعلان‌ها"
            className="relative p-2.5 text-slate-400 hover:text-white rounded-xl hover:bg-[#1a1d2c] transition-colors border border-transparent hover:border-[#262b3c]"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 left-2 w-2 h-2 rounded-full bg-[#6859f5] ring-2 ring-[#11131a]"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-[#191b21] border border-[#282a30] rounded-2xl shadow-2xl overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#282a30]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-wide font-headline">
                    اعلان‌های سیستم
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#8083ff]/20 text-[#c0c1ff] text-[10px] font-mono font-bold">
                      {unreadCount} جدید
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-[11px] text-[#c0c1ff] hover:underline flex items-center gap-1 font-mono"
                  >
                    <Check className="w-3 h-3" /> خواندن همه
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-[#282a30]/50">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">هیچ اعلانی وجود ندارد.</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkRead(n.id)}
                      className={`px-4 py-3 cursor-pointer transition-colors ${
                        !n.is_read ? 'bg-[#20232c]/80 hover:bg-[#20232c]' : 'hover:bg-[#1e1f25]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-200">{n.title}</h4>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">{n.created_at}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Avatar & Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 p-1 rounded-full hover:ring-2 hover:ring-[#6859f5]/50 transition-all"
          >
            <img
              src={user?.avatar_url}
              alt={user?.full_name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#292f44]"
            />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute left-0 mt-3 w-72 bg-[#191b21] border border-[#282a30] rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-150 text-right">
              <div className="flex items-center gap-3 pb-3 border-b border-[#282a30]">
                <img src={user?.avatar_url} alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-[#6859f5]" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{user?.full_name}</h3>
                  <p className="text-[11px] font-mono text-[#908fa0] truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#8083ff]/15 text-[#c0c1ff] border border-[#8083ff]/30">
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Persona switch */}
              <div className="py-2">
                <span className="text-[10px] font-mono text-[#908fa0] uppercase tracking-wider block mb-2">
                  نقش کاربر فعال:
                </span>
                <div className="space-y-1">
                  {dbService.getTeamMembers().map((p: UserProfile) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        switchUser(p);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-right text-xs transition-colors ${
                        user?.id === p.id
                          ? 'bg-[#252a3b] text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-[#1e1f25]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img src={p.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover bg-[#232738]" />
                        <span className="truncate">{p.full_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-slate-500">[{p.role}]</span>
                        {user?.id === p.id && <UserCheck className="w-3.5 h-3.5 text-[#4edea3]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#282a30] flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onOpenSettings();
                  }}
                  className="w-full text-right px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-[#1e1f25] rounded-xl flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#7bd0ff]" />
                  تنظیمات حساب و دسترسی‌ها
                </button>
                <button
                  onClick={logout}
                  className="w-full text-right px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                  خروج از فضای کاری
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
