import React, { useState } from 'react';
import { Orbit, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { SEED_PROFILES } from '../services/db.ts';

export const LoginScreen: React.FC = () => {
  const { login, signup } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('admin@madar.app');
  const [fullName, setFullName] = useState('علی رضایی (مدیر ارشد)');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [keepActive, setKeepActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg('در حال احراز هویت امن...');

    setTimeout(async () => {
      setStatusMsg('در حال انتقال به پیشخوان کاری...');
      if (isSignUp) {
        await signup(email, fullName, password);
      } else {
        await login(email, password, keepActive);
      }
      setIsSubmitting(false);
    }, 600);
  };

  const handleQuickLogin = async (profileEmail: string) => {
    setEmail(profileEmail);
    setIsSubmitting(true);
    setStatusMsg('در حال احراز هویت امن...');
    setTimeout(async () => {
      await login(profileEmail, 'password123', true);
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#111319] text-[#e2e2e9] font-sans antialiased flex flex-col justify-center items-center relative overflow-hidden px-4 py-8 text-right" dir="rtl">
      {/* Theme toggle switch in Login Screen */}
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={toggleTheme}
          title={isDark ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-700/50 bg-[#191b21]/80 backdrop-blur-md text-slate-300 hover:text-white transition-all shadow-sm cursor-pointer"
        >
          {isDark ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono">حالت روشن</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-mono">حالت تیره</span>
            </>
          )}
        </button>
      </div>

      {/* Ambient Aura */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-gradient-to-b from-[#8083ff]/15 via-[#c0c1ff]/5 to-transparent rounded-full blur-3xl pointer-events-none opacity-60"></div>
      <div className="absolute -bottom-40 right-1/4 w-[520px] h-[360px] bg-gradient-to-t from-[#00a6e0]/10 via-transparent to-transparent rounded-full blur-3xl pointer-events-none opacity-40"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Brand Header with new Logo and Persian Name: مدار */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6859f5] via-[#8083ff] to-[#38bdf8] flex items-center justify-center shadow-lg shadow-[#6859f5]/30">
            <Orbit className="w-7 h-7 text-white stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-headline text-xl font-bold text-white tracking-wide">سامانه مدار</h1>
            <p className="text-[11px] font-mono text-[#908fa0]">پلتفرم ابری مدیریت پروژه و تسک</p>
          </div>
        </div>

        {/* Authentication Card Panel */}
        <div className="w-full bg-[#191b21]/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#282a30] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#c0c1ff]/30 to-transparent"></div>

          {/* SSO Identity Providers */}
          <div className="flex flex-col gap-2.5 mb-5">
            <button
              onClick={() => handleQuickLogin('admin@madar.app')}
              type="button"
              className="w-full h-11 px-4 rounded-xl bg-[#1e1f25] hover:bg-[#282a30] text-[#e2e2e9] text-xs font-medium flex items-center justify-between transition-all duration-200 group border border-[#282a30]/60"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
                </svg>
                <span className="font-medium text-white">ورود سریع مدیر با گوگل</span>
              </div>
              <span className="font-mono text-[10px] text-[#908fa0]">ADMIN</span>
            </button>

            <button
              onClick={() => handleQuickLogin('admin@madar.app')}
              type="button"
              className="w-full h-11 px-4 rounded-xl bg-[#1e1f25] hover:bg-[#282a30] text-[#e2e2e9] text-xs font-medium flex items-center justify-between transition-all duration-200 group border border-[#282a30]/60"
            >
              <div className="flex items-center gap-3">
                <svg className="w-4 h-4 fill-white flex-shrink-0" viewBox="0 0 24 24">
                  <path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path>
                </svg>
                <span className="font-medium text-white">ورود سریع مدیر با گیت‌هاب</span>
              </div>
              <span className="font-mono text-[10px] text-[#908fa0]">DEV</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="w-full h-px bg-[#282a30]"></div>
            <span className="relative px-3 bg-[#191b21] font-mono text-[10px] text-[#908fa0] uppercase tracking-wider">
              یا ورود با ایمیل و رمز عبور
            </span>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-3.5" onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="flex flex-col gap-1">
                <label className="font-mono text-[10px] text-[#c7c4d7] uppercase">
                  نام و نام خانوادگی
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-11 px-4 bg-[#0c0e13] text-[#e2e2e9] placeholder-[#464554] text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8083ff] border border-[#282a30]"
                  placeholder="علی رضایی"
                  required
                  type="text"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-[#c7c4d7] uppercase">
                ایمیل سازمانی
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute right-3.5 text-[18px] text-[#908fa0] pointer-events-none">
                  alternate_email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pr-11 pl-4 bg-[#0c0e13] text-[#e2e2e9] placeholder-[#464554] text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8083ff] border border-[#282a30] text-right"
                  placeholder="ali.rezaei@madar.app"
                  required
                  type="email"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[10px] text-[#c7c4d7] uppercase">
                  رمز عبور
                </label>
                <button
                  type="button"
                  onClick={() => alert('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.')}
                  className="text-[11px] text-[#c0c1ff] hover:underline"
                >
                  فراموشی رمز؟
                </button>
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute right-3.5 text-[18px] text-[#908fa0] pointer-events-none">
                  lock
                </span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pr-11 pl-11 bg-[#0c0e13] text-[#e2e2e9] placeholder-[#464554] text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-[#8083ff] tracking-widest border border-[#282a30] text-right"
                  placeholder="••••••••••••"
                  required
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-[#908fa0] hover:text-white p-1 rounded"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  checked={keepActive}
                  onChange={(e) => setKeepActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0c0e13] accent-[#6859f5] cursor-pointer"
                  type="checkbox"
                />
                <span className="text-xs text-[#908fa0]">جلسه کاری فعال بماند (۳۰ روز)</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                disabled={isSubmitting}
                className="w-full h-11 px-6 rounded-xl bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] hover:brightness-110 text-white font-semibold text-xs tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#6355ee]/25 group"
                type="submit"
              >
                <span>{statusMsg || (isSignUp ? 'ایجاد حساب کاربری مدار' : 'ورود به فضای کاری')}</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-[#c0c1ff] hover:underline"
              >
                {isSignUp ? 'حساب کاربری دارید؟ وارد شوید' : 'حساب ندارید؟ ثبت‌نام نمایید'}
              </button>
            </div>
          </form>
        </div>

        {/* Admin quick login button */}
        <div className="mt-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SEED_PROFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => handleQuickLogin(p.email)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#191b21] hover:bg-[#282a30] border border-[#282a30] text-xs text-slate-300 transition-colors"
              >
                <img src={p.avatar_url} alt={p.full_name} className="w-5 h-5 rounded-full object-cover bg-[#232738]" />
                <span>ورود سریع به عنوان {p.full_name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
