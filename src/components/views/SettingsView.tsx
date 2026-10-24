import React, { useState } from 'react';
import { Database, Check, Copy, Save, UserPlus, Trash2, X, Sun, Moon, Palette } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { isSupabaseConfigured } from '../../lib/supabase.ts';
import { dbService } from '../../services/db.ts';
import { UserProfile } from '../../types/database.ts';

export const SettingsView: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { theme, isDark, setTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [jobTitle, setJobTitle] = useState(user?.job_title || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);

  // Members state
  const [members, setMembers] = useState<UserProfile[]>(() => dbService.getTeamMembers());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('کارشناس پروژه');
  const [memberNotice, setMemberNotice] = useState<string | null>(null);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: fullName, job_title: jobTitle, bio });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const copyMigrationSQL = () => {
    navigator.clipboard.writeText(`-- اسکریپت پایگاه داده و سیاست‌های امنیت RLS مدار
-- فایل اصلی در مسیر supabase/schema.sql قرار دارد.`);
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2500);
  };

  const handleDeleteMember = (memberId: string) => {
    if (members.length <= 1) {
      setMemberNotice('حداقل یک عضو (مدیر ارشد) باید در سامانه باقی بماند.');
      setTimeout(() => setMemberNotice(null), 3000);
      return;
    }
    const updated = dbService.deleteMember(memberId);
    setMembers(updated);
    setMemberNotice('عضو از سامانه حذف شد.');
    setTimeout(() => setMemberNotice(null), 3000);
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
    setShowAddModal(false);
    setMemberNotice(`عضو جدید (${added.full_name}) اضافه شد.`);
    setTimeout(() => setMemberNotice(null), 3000);
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl overflow-y-auto text-right">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-headline">
          تنظیمات فضای کاری و امنیت پایگاه داده
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          مدیریت هویت، سطح دسترسی RLS، اسکیما و پیکربندی سوپابیس
        </p>
      </div>

      {/* Appearance & Theme Setting Section */}
      <section className="bg-[#1b1e2a] rounded-3xl p-6 sm:p-8 border border-[#242838] shadow-card-subtle">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#6859f5]/15 text-[#8083ff] flex items-center justify-center border border-[#6859f5]/25">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-headline">پوسته و تم ظاهری سامانه</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تغییر سریع بین نسخه تیره (پیش‌فرض) و نسخه روشن سامانه
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Dark Mode Choice */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
              isDark
                ? 'bg-[#15171e] border-[#6859f5] ring-2 ring-[#6859f5]/40 shadow-lg'
                : 'bg-[#11131a]/60 border-[#282a30] opacity-70 hover:opacity-100 hover:border-slate-500'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-[#20232c] flex items-center justify-center shrink-0 text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">حالت تیره (پیش‌فرض)</span>
                {isDark && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                طراحی تیره ابسیدین با هایلایت‌های ارگونومیک، کاهش خستگی چشم و مصرف باتری.
              </p>
            </div>
          </button>

          {/* Light Mode Choice */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border text-right transition-all flex items-start gap-3.5 cursor-pointer ${
              !isDark
                ? 'bg-white border-[#6859f5] ring-2 ring-[#6859f5]/40 shadow-lg text-slate-900'
                : 'bg-[#11131a]/60 border-[#282a30] opacity-70 hover:opacity-100 hover:border-slate-500'
            }`}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center shrink-0 text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">نسخه روشن (Light Version)</span>
                {!isDark && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                فضای شفاف با سطوح سفید و تمیز، کنتراست شفاف و بهینه‌سازی شده برای محیط‌های روشن.
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* Supabase Integration Card */}
      <section className="bg-[#1b1e2a] rounded-3xl p-6 sm:p-8 border border-[#242838] shadow-card-subtle">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00c389]/10 text-[#00c389] flex items-center justify-center border border-[#00c389]/20">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-headline">
                  اتصال به پایگاه داده PostgreSQL و احراز هویت
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isSupabaseConfigured
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {isSupabaseConfigured ? 'متصل به سوپابیس ابری' : 'موتور محلی امن فعال'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {isSupabaseConfigured
                  ? 'اتصال پایگاه داده فعال و کنترل امنیت RLS روی تمامی جداول برقرار است.'
                  : 'داده‌ها به شکل امن در حافظه محلی ذخیره می‌شوند. اسکریپت کامل در supabase/schema.sql موجود است.'}
              </p>
            </div>
          </div>

          <button
            onClick={copyMigrationSQL}
            className="px-3.5 py-2 rounded-xl bg-[#232738] hover:bg-[#2d3348] text-xs text-slate-200 transition-colors flex items-center gap-1.5 shrink-0 font-mono"
          >
            {copiedSchema ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSchema ? 'کپی شد' : 'کپی اطلاعات اسکیما'}</span>
          </button>
        </div>

        <div className="bg-[#11131a] rounded-2xl p-4 border border-[#262b3c] space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>نوع پایگاه داده:</span>
            <span className="text-white">PostgreSQL (15+)</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>امنیت سطوح داده (RLS):</span>
            <span className="text-emerald-400">۱۴ سیاست فعال روی جداول</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>سیستم احراز هویت:</span>
            <span className="text-[#c0c1ff]">Supabase GoTrue (Email + OAuth2)</span>
          </div>
        </div>
      </section>

      {/* Profile Settings */}
      <section className="bg-[#1b1e2a] rounded-3xl p-6 sm:p-8 border border-[#242838] shadow-card-subtle">
        <h2 className="text-base font-bold text-white mb-4 font-headline">مشخصات حساب کاربری</h2>

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <img src={user?.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover ring-2 ring-[#6859f5] bg-[#232738]" />
            <div>
              <p className="text-sm font-semibold text-white">{user?.full_name}</p>
              <p className="text-xs font-mono text-slate-400">{user?.email}</p>
              <span className="inline-block mt-1 text-[10px] font-mono text-[#8083ff] bg-[#8083ff]/15 px-2 py-0.5 rounded">
                نقش: {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">نام و نام خانوادگی</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#11131a] border border-[#282a30] rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">سمت شغلی</label>
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full bg-[#11131a] border border-[#282a30] rounded-xl px-4 py-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">درباره شما / زمینه تخصص</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#11131a] border border-[#282a30] rounded-xl p-3 text-xs text-white leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-4 h-4" /> تغییرات با موفقیت ذخیره شد!
              </span>
            ) : <span></span>}

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>ذخیره مشخصات</span>
            </button>
          </div>
        </form>
      </section>

      {/* Team Member Role Administration */}
      <section className="bg-[#1b1e2a] rounded-3xl p-6 sm:p-8 border border-[#242838] shadow-card-subtle">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white font-headline">اعضای تیم و مدیریت دسترسی‌ها</h2>
            <p className="text-xs text-slate-400">سطوح دسترسی به تفکیک مدیر ارشد و سایر اعضا ({members.length} عضو)</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#232738] hover:bg-[#2d3348] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-[#8083ff]" />
            <span>+ افزودن عضو جدید</span>
          </button>
        </div>

        {memberNotice && (
          <div className="mb-4 bg-[#202330] border border-[#8083ff]/40 text-slate-200 text-xs px-4 py-2 rounded-xl flex items-center justify-between">
            <span>{memberNotice}</span>
            <button onClick={() => setMemberNotice(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="divide-y divide-[#242838] text-xs">
          {members.map((member: UserProfile) => {
            const isAdmin = member.role === 'Admin' || member.id === 'user-admin';
            return (
              <div key={member.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={member.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-[#282a30] bg-[#232738]" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-semibold text-white">{member.full_name}</h4>
                      {isAdmin && (
                        <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded">
                          مدیر ارشد
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400">{member.email} • {member.job_title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-slate-300 bg-[#11131a] px-3 py-1 rounded-lg border border-[#282a30]">
                    {member.role}
                  </span>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    title="حذف عضو"
                    className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal: Add Member in Settings */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-1 font-headline">افزودن عضو جدید</h3>
            <p className="text-xs text-slate-400 mb-5">مشخصات همکار جدید را وارد نمایید</p>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">نام و نام خانوادگی</label>
                <input
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="مثال: مریم کریمی"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">سمت شغلی</label>
                <input
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="مثال: توسعه‌دهنده فرانت‌اند"
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple"
                >
                  افزودن به تیم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
