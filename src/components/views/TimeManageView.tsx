import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Clock, Check, Folder } from 'lucide-react';
import { TimeEntry, Project } from '../../types/database.ts';

interface TimeManageViewProps {
  projects: Project[];
  timeEntries: TimeEntry[];
  onSaveTimeEntry: (entry: TimeEntry) => void;
}

export const TimeManageView: React.FC<TimeManageViewProps> = ({
  projects,
  timeEntries: initialEntries,
  onSaveTimeEntry,
}) => {
  const [entries, setEntries] = useState<TimeEntry[]>(initialEntries);
  const [activeTaskTitle, setActiveTaskTitle] = useState('طراحی رابط کاربری');
  const [selectedProject, setSelectedProject] = useState(projects[0]?.name || 'پروژه عمومی');
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, '0')}s`;
  };

  const handleStopAndLog = () => {
    if (seconds === 0) return;
    const newEntry: TimeEntry = {
      id: `time-${Date.now()}`,
      workspace_id: 'ws-01',
      title: activeTaskTitle,
      project_name: selectedProject,
      duration_seconds: seconds,
      is_running: false,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    onSaveTimeEntry(newEntry);
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-right">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight font-headline">مدیریت زمان و تمرکز</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          ثبت دقیق زمان کارکرد اسپرینت، تایم‌شیت تسک‌ها و بازدهی کاری
        </p>
      </div>

      {/* Main Stopwatch Cockpit */}
      <div className="bg-[#1b1e2a] rounded-3xl p-6 sm:p-8 border border-[#242838] shadow-card-subtle flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-mono text-[#c0c1ff]">
            <Clock className="w-4 h-4 text-[#8083ff]" />
            <span>جلسه کاری فعال</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              value={activeTaskTitle}
              onChange={(e) => setActiveTaskTitle(e.target.value)}
              placeholder="روی چه تسکی کار می‌کنید؟"
              className="bg-[#11131a] border border-[#282a30] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#6859f5] w-64 text-right"
            />
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-[#11131a] border border-[#282a30] rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Digit Display */}
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-widest text-[#4edea3]">
            {formatTime(seconds)}
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mt-1">
            {isRunning ? 'در حال ضبط زمان' : 'متوقف'}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isRunning
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-[#6859f5] text-white shadow-lg shadow-[#6859f5]/30'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={() => {
              setIsRunning(false);
              setSeconds(0);
            }}
            title="شروع مجدد"
            className="w-10 h-10 rounded-xl bg-[#232738] text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleStopAndLog}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>ثبت زمان</span>
          </button>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-[#1b1e2a] rounded-3xl p-6 border border-[#242838] shadow-card-subtle">
        <h3 className="text-sm font-semibold text-white mb-4 font-headline">سوابق زمان ثبت شده</h3>

        <div className="divide-y divide-[#242838]/80 text-xs">
          {entries.map((entry) => (
            <div key={entry.id} className="py-3 flex items-center justify-between hover:bg-[#202432]/50 px-2 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#232738] flex items-center justify-center text-[#7bd0ff]">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">{entry.title}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3 text-slate-500" />
                      {entry.project_name || 'پروژه'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold text-amber-400">
                  {formatTime(entry.duration_seconds)}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  ثبت شده
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
