import React, { useState } from 'react';
import {
  Search,
  Plus,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Send,
  Star,
  FolderOpen,
  MoreVertical,
} from 'lucide-react';
import { Channel, Message } from '../../types/database.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface MessagesViewProps {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (id: string) => void;
  onSendMessage: (channelId: string, content: string) => void;
  messages: Message[];
}

export const MessagesView: React.FC<MessagesViewProps> = ({
  channels,
  selectedChannelId,
  onSelectChannel,
  onSendMessage,
  messages,
}) => {
  const { user } = useAuth();
  const [filterText, setFilterText] = useState('');
  const [inputText, setInputText] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  const activeChannel = channels.find((c) => c.id === selectedChannelId) || channels[0];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChannel) return;
    onSendMessage(activeChannel.id, inputText.trim());
    setInputText('');
  };

  const filteredChannels = channels.filter((c) =>
    c.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="flex flex-col w-full h-[calc(100vh-5rem)] p-6 overflow-hidden text-right">
      {/* Top Minimal Utility Bar */}
      <div className="flex items-center justify-between pb-4 shrink-0">
        <div>
          <span className="font-mono text-[10px] text-[#908fa0] tracking-widest uppercase">
            فضای کاری / ارتباطات
          </span>
          <h1 className="font-headline text-2xl font-bold text-white tracking-tight">پیام‌های تیم</h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute right-3.5 text-[#908fa0] text-lg pointer-events-none">
              search
            </span>
            <input
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-80 h-10 pr-10 pl-4 rounded-xl bg-[#191b21] text-white placeholder-[#908fa0] text-xs border border-[#282a30] focus:outline-none focus:ring-1 focus:ring-[#8083ff] shadow-sm text-right"
              placeholder="جستجو در گفتگوها..."
              type="text"
            />
          </div>

          <button
            onClick={() => {
              const name = prompt('نام همکار یا کانال جدید را وارد کنید:');
              if (name) {
                alert(`گفتگوی جدید با «${name}» آغاز شد.`);
              }
            }}
            className="flex items-center gap-2 px-3.5 h-10 rounded-xl bg-[#8083ff] hover:bg-[#8083ff]/90 text-white font-mono text-xs font-semibold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>گفتگوی جدید</span>
          </button>
        </div>
      </div>

      {/* Main Messenger Surface */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-5 rounded-2xl bg-[#0c0e13] p-2 shadow-2xl border border-[#20232e] overflow-hidden">
        {/* LEFT COLUMN: Side Messages Rail / Thread List */}
        <aside className="col-span-4 xl:col-span-3 flex flex-col h-full bg-[#191b21] rounded-xl overflow-hidden border border-[#282a30]">
          {/* Search & Filters */}
          <div className="p-3.5 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#908fa0] uppercase tracking-wider">
                کانال‌ها و افراد
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#282a30] text-[#c7c4d7] font-mono text-[10px]">
                ۰ پیام خوانده‌نشده
              </span>
            </div>

            <div className="relative">
              <span className="material-symbols-outlined absolute right-3 top-2 text-[#908fa0] text-base">
                filter_list
              </span>
              <input
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full h-9 pr-9 pl-3 rounded-lg bg-[#1e1f25] text-white placeholder-[#908fa0] text-xs border-0 focus:outline-none focus:ring-1 focus:ring-[#8083ff] text-right"
                placeholder="فیلتر گفتگوها..."
                type="text"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1">
            {filteredChannels.map((c) => {
              const isActive = c.id === activeChannel?.id;
              const hasAvatar = !!c.partner?.avatar_url;

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectChannel(c.id)}
                  className={`flex items-center gap-3 p-2.5 rounded-xl transition-all cursor-pointer group ${
                    isActive ? 'bg-[#282a30]' : 'hover:bg-[#1e1f25]'
                  }`}
                >
                  <div className="relative shrink-0">
                    {hasAvatar ? (
                      <img
                        src={c.partner?.avatar_url}
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-[#282a30]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[#282a30] flex items-center justify-center font-mono text-xs text-[#7bd0ff] font-bold">
                        {c.name.slice(0, 2)}
                      </div>
                    )}
                    <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-[#191b21]"></span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-semibold text-xs text-white truncate font-headline">{c.name}</span>
                      <span className="font-mono text-[10px] text-[#c0c1ff]">{c.last_time || 'هم‌اکنون'}</span>
                    </div>
                    <p className="text-[11px] text-[#908fa0] truncate">{c.last_message || 'گفتگوی تیم'}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Status Footnote */}
          <div className="p-3 bg-[#0c0e13]/50 shrink-0 flex items-center justify-between border-t border-[#282a30]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#4edea3] shadow-[0_0_8px_#4edea3]"></span>
              <span className="font-mono text-[10px] text-[#908fa0] uppercase tracking-wider">
                وضعیت شبکه: فعال
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">۰.۲ میلی‌ثانیه</span>
          </div>
        </aside>

        {/* RIGHT / MAIN CHAT AREA */}
        <section className="col-span-8 xl:col-span-9 flex flex-col h-full bg-[#191b21] rounded-xl overflow-hidden relative border border-[#282a30]">
          {/* Conversation Header */}
          <div className="h-16 px-6 bg-[#191b21] flex items-center justify-between shrink-0 border-b border-[#282a30] z-10">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {activeChannel?.partner?.avatar_url ? (
                  <img
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#282a30]"
                    src={activeChannel.partner.avatar_url}
                    alt={activeChannel.name}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#282a30] flex items-center justify-center font-bold text-xs text-[#7bd0ff]">
                    {activeChannel?.name.slice(0, 2)}
                  </div>
                )}
                <span className="absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full bg-[#4edea3] ring-2 ring-[#191b21]"></span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-sm text-white font-headline">
                    {activeChannel?.name || 'گفتگوی عمومی'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#1e1f25] text-[#7bd0ff] font-mono text-[10px]">
                    {activeChannel?.partner?.job_title || 'کانال تیمی'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-[#4edea3]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3]"></span>
                  <span>آنلاین</span>
                </div>
              </div>
            </div>

            {/* Chat Action Icons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsStarred(!isStarred)}
                aria-label="ستاره‌دار کردن"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  isStarred ? 'text-amber-400' : 'text-[#908fa0] hover:text-[#7bd0ff] hover:bg-[#1e1f25]'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
              </button>
              <button
                aria-label="پیوست‌ها"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#908fa0] hover:text-white hover:bg-[#1e1f25] transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1e1f25] flex items-center justify-center text-[#908fa0] shadow-inner border border-[#282a30]">
                  <span className="material-symbols-outlined text-3xl">chat_bubble_outline</span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-semibold text-sm text-white font-headline">هنوز پیامی ارسال نشده است</h3>
                  <p className="text-xs text-[#908fa0] leading-relaxed">
                    با ارسال اولین پیام، گفتگوی تیمی خود را آغاز نمایید.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m) => {
                const isMe = m.user_id === user?.id || m.user?.email === user?.email;
                return (
                  <div
                    key={m.id}
                    className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    <img
                      src={m.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={m.user?.full_name}
                      className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#282a30]"
                    />
                    <div className={`max-w-lg ${isMe ? 'items-start' : 'items-end'} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-xs font-semibold text-slate-300">{m.user?.full_name}</span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(m.created_at).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isMe
                            ? 'bg-[#6859f5] text-white shadow-md'
                            : 'bg-[#1e1f25] text-slate-200 border border-[#282a30]'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Input Field & Controls */}
          <div className="p-4 bg-[#191b21] shrink-0 border-t border-[#282a30]">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 bg-[#1e1f25] rounded-2xl px-3 py-2 shadow-inner border border-[#282a30]"
            >
              <button
                type="button"
                onClick={() => alert('پیوست مستندات یا فایل')}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#908fa0] hover:text-white hover:bg-[#282a30] transition-colors"
                title="پیوست فایل"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => alert('بارگذاری تصویر')}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#908fa0] hover:text-white hover:bg-[#282a30] transition-colors"
                title="پیوست تصویر"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-transparent border-0 text-white placeholder-[#908fa0] text-xs focus:outline-none px-2 text-right"
                placeholder={`نوشتن پیام به ${activeChannel?.name || 'کانال'}...`}
                type="text"
              />

              <button
                type="button"
                onClick={() => setInputText((prev) => prev + ' 🚀')}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[#908fa0] hover:text-white hover:bg-[#282a30] transition-colors"
                title="افزودن ایموجی"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                type="submit"
                className="h-9 px-4 rounded-xl bg-[#8083ff] hover:bg-[#8083ff]/90 text-white flex items-center justify-center gap-1.5 transition-all shadow-sm text-xs font-semibold font-mono"
              >
                <span>ارسال</span>
                <Send className="w-3.5 h-3.5 rotate-180" />
              </button>
            </form>

            <div className="flex items-center justify-between pt-2 px-2 text-[#908fa0] font-mono text-[10px]">
              <span>ارسال با کلید Enter • پیام‌های ذخیره‌شده روی پایگاه داده</span>
              <span>امنیت RLS فعال است</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
