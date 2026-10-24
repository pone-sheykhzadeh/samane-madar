import React, { useState } from 'react';
import { Plus, Pin, Trash2, Edit3, Lock, ShieldCheck } from 'lucide-react';
import { PersonalNote } from '../../types/database.ts';

interface NotesViewProps {
  notes: PersonalNote[];
  searchQuery: string;
  onSaveNote: (note: Partial<PersonalNote>) => void;
  onDeleteNote: (id: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  searchQuery,
  onSaveNote,
  onDeleteNote,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<PersonalNote | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState('#6859f5');

  const filtered = notes.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedNotes = filtered.filter((n) => n.is_pinned);
  const otherNotes = filtered.filter((n) => !n.is_pinned);

  const openNewNote = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setIsPinned(false);
    setColor('#6859f5');
    setShowModal(true);
  };

  const openEditNote = (note: PersonalNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setIsPinned(note.is_pinned);
    setColor(note.color || '#6859f5');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveNote({
      id: editingNote ? editingNote.id : undefined,
      title,
      content,
      is_pinned: isPinned,
      color,
    });

    setShowModal(false);
  };

  const renderNoteCard = (note: PersonalNote) => (
    <article
      key={note.id}
      className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle flex flex-col justify-between hover:border-[#2e3349] transition-all relative group text-right"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: note.color || '#6859f5' }}
            ></span>
            <h3 className="text-sm font-bold text-white font-headline leading-tight">{note.title}</h3>
          </div>

          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
            <button
              onClick={() => onSaveNote({ ...note, is_pinned: !note.is_pinned })}
              className={`p-1 rounded-lg transition-colors ${
                note.is_pinned ? 'text-amber-400 bg-amber-500/10' : 'text-slate-500 hover:text-white'
              }`}
              title={note.is_pinned ? 'حذف سنجاق' : 'سنجاق به بالا'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => openEditNote(note)}
              className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors"
              title="ویرایش یادداشت"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteNote(note.id)}
              className="p-1 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
              title="حذف یادداشت"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed line-clamp-6">
          {note.content}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-[#25293a] flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1 text-emerald-400">
          <Lock className="w-3 h-3" /> خصوصی شما (RLS)
        </span>
        <span>
          {new Date(note.updated_at).toLocaleDateString('fa-IR')}
        </span>
      </div>
    </article>
  );

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-right">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight font-headline">یادداشت‌های شخصی</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] flex items-center gap-1 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" /> فقط مالک یادداشت (RLS)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            دفترچه یادداشت خصوصی و کاملاً تفکیک‌شده برای هر کاربر
          </p>
        </div>

        <button
          onClick={openNewNote}
          className="px-4 py-2 bg-gradient-to-r from-[#6355ee] to-[#7b6dfc] text-white text-xs font-bold rounded-xl shadow-glow-purple hover:brightness-110 transition-all flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>یادداشت جدید</span>
        </button>
      </div>

      {/* Pinned section if any */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
            <Pin className="w-3.5 h-3.5" />
            <span>یادداشت‌های سنجاق شده ({pinnedNotes.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pinnedNotes.map(renderNoteCard)}
          </div>
        </div>
      )}

      {/* Other notes */}
      <div className="space-y-3">
        {pinnedNotes.length > 0 && (
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
            <span>سایر یادداشت‌ها ({otherNotes.length})</span>
          </div>
        )}
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">یادداشتی وجود ندارد.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherNotes.map(renderNoteCard)}
          </div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#191b21] border border-[#282a30] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-right">
            <h3 className="text-lg font-bold text-white mb-1 font-headline">
              {editingNote ? 'ویرایش یادداشت شخصی' : 'ایجاد یادداشت شخصی'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              این یادداشت تنها برای حساب کاربری شما قابل رویت است
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">عنوان یادداشت</label>
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="عنوان یادداشت..."
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl px-4 py-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">متن یادداشت</label>
                <textarea
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="متن یادداشت یا برنامه‌های شخصی..."
                  className="w-full bg-[#0c0e13] border border-[#282a30] rounded-xl p-3 text-xs text-white leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#0c0e13] accent-[#6859f5]"
                  />
                  <span className="text-xs text-slate-300">سنجاق در بالا</span>
                </label>

                <div className="flex items-center gap-2">
                  {['#6859f5', '#00b7ff', '#00c389', '#ff8a00', '#ff4f8e'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        color === c ? 'scale-125 ring-2 ring-white' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
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
                  ذخیره یادداشت
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
