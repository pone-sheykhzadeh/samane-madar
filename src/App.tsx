/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ThemeProvider, useTheme } from './context/ThemeContext.tsx';
import { LoginScreen } from './components/LoginScreen.tsx';
import { NavigationSidebar, NavTab } from './components/NavigationSidebar.tsx';
import { TopBar } from './components/TopBar.tsx';
import { DashboardView } from './components/views/DashboardView.tsx';
import { MyTasksView } from './components/views/MyTasksView.tsx';
import { MessagesView } from './components/views/MessagesView.tsx';
import { CalendarTimelineView } from './components/views/CalendarTimelineView.tsx';
import { ProjectsView } from './components/views/ProjectsView.tsx';
import { TimeManageView } from './components/views/TimeManageView.tsx';
import { ReportsView } from './components/views/ReportsView.tsx';
import { NotesView } from './components/views/NotesView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { dbService } from './services/db.ts';
import {
  Project,
  Task,
  TaskStatus,
  TimeEntry,
  PersonalNote,
  Channel,
  Message,
  NotificationItem,
} from './types/database.ts';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark } = useTheme();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // Domain data
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>('chan-general');
  const [channelMessages, setChannelMessages] = useState<Message[]>([]);
  const [notes, setNotes] = useState<PersonalNote[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load data
  useEffect(() => {
    if (isAuthenticated) {
      dbService.getProjects().then(setProjects);
      dbService.getTasks().then(setTasks);
      setTimeEntries(dbService.getTimeEntries());
      const chs = dbService.getChannels();
      setChannels(chs);
      if (chs.length > 0) {
        setSelectedChannelId(chs[0].id);
        setChannelMessages(dbService.getMessages(chs[0].id));
      }
      setNotes(dbService.getNotes());
      setNotifications(dbService.getNotifications());
    }
  }, [isAuthenticated]);

  // Load messages when channel switches
  useEffect(() => {
    if (selectedChannelId) {
      setChannelMessages(dbService.getMessages(selectedChannelId));
    }
  }, [selectedChannelId]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center font-mono text-sm ${isDark ? 'bg-[#111319] text-white' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#6859f5] animate-ping"></span>
          <span>در حال راه‌اندازی سامانه مدار...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Handlers
  const handleAddTask = async (taskData: Partial<Task>) => {
    const created = await dbService.addTask(taskData);
    setTasks((prev) => [created, ...prev]);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const updated = await dbService.updateTaskStatus(taskId, status);
    setTasks(updated);
  };

  const handleDeleteTask = async (taskId: string) => {
    const updated = await dbService.deleteTask(taskId);
    setTasks(updated);
  };

  const handleAddProject = async (projData: Partial<Project>) => {
    const created = await dbService.addProject(projData);
    setProjects((prev) => [created, ...prev]);
  };

  const handleDeleteProject = async (projectId: string) => {
    const updated = await dbService.deleteProject(projectId);
    setProjects(updated);
  };

  const handleToggleStar = async (projectId: string) => {
    await dbService.toggleStarProject(projectId);
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, is_starred: !p.is_starred } : p))
    );
  };

  const handleSendMessage = (channelId: string, content: string) => {
    const msg = dbService.sendMessage(channelId, content);
    setChannelMessages((prev) => [...prev, msg]);
    setChannels(dbService.getChannels());
  };

  const handleSaveTimeEntry = (entry: TimeEntry) => {
    const updated = [entry, ...timeEntries];
    setTimeEntries(updated);
    dbService.saveTimeEntries(updated);
  };

  const handleSaveNote = (noteData: Partial<PersonalNote>) => {
    dbService.saveNote(noteData);
    setNotes(dbService.getNotes());
  };

  const handleDeleteNote = (id: string) => {
    dbService.deleteNote(id);
    setNotes(dbService.getNotes());
  };

  const handleMarkNotificationRead = (id: string) => {
    dbService.markNotificationRead(id);
    setNotifications(dbService.getNotifications());
  };

  const handleMarkAllNotificationsRead = () => {
    dbService.markAllNotificationsRead();
    setNotifications(dbService.getNotifications());
  };

  const unreadMessagesCount = channels.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  return (
    <div
      className={`font-sans min-h-screen antialiased flex flex-col md:flex-row overflow-x-hidden selection:bg-[#6859f5] selection:text-white transition-colors duration-200 ${
        isDark ? 'bg-[#11131a] text-slate-200' : 'bg-[#f8fafc] text-slate-800'
      }`}
      dir="rtl"
    >
      {/* Navigation Sidebar */}
      <NavigationSidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadCount={unreadMessagesCount}
      />

      {/* Main Content Area */}
      <main
        className={`flex-1 flex flex-col min-w-0 overflow-y-auto transition-colors duration-200 ${
          isDark ? 'bg-[#11131a]' : 'bg-[#f8fafc]'
        }`}
      >
        {/* Top Header Bar */}
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onMarkRead={handleMarkNotificationRead}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onOpenSettings={() => setCurrentTab('settings')}
        />

        {/* Tab Views */}
        <div className="flex-1 min-w-0">
          {currentTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              tasks={tasks}
              timeEntries={timeEntries}
              onToggleStar={handleToggleStar}
              onSelectProject={() => setCurrentTab('projects')}
              onOpenMessages={(partnerName) => {
                if (partnerName) {
                  const ch = channels.find((c) => c.name.toLowerCase().includes(partnerName.toLowerCase()));
                  if (ch) setSelectedChannelId(ch.id);
                }
                setCurrentTab('messages');
              }}
              onNavigateToTasks={() => setCurrentTab('my_task')}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onDeleteProject={handleDeleteProject}
              onAddProject={handleAddProject}
            />
          )}

          {currentTab === 'my_task' && (
            <MyTasksView
              tasks={tasks}
              projects={projects}
              searchQuery={searchQuery}
              onAddTask={handleAddTask}
              onUpdateStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectsView
              projects={projects}
              searchQuery={searchQuery}
              onToggleStar={handleToggleStar}
              onAddProject={handleAddProject}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarTimelineView tasks={tasks} projects={projects} />
          )}

          {currentTab === 'time_manage' && (
            <TimeManageView
              projects={projects}
              timeEntries={timeEntries}
              onSaveTimeEntry={handleSaveTimeEntry}
            />
          )}

          {currentTab === 'reports' && <ReportsView tasks={tasks} projects={projects} />}

          {currentTab === 'messages' && (
            <MessagesView
              channels={channels}
              selectedChannelId={selectedChannelId}
              onSelectChannel={setSelectedChannelId}
              onSendMessage={handleSendMessage}
              messages={channelMessages}
            />
          )}

          {currentTab === 'notes' && (
            <NotesView
              notes={notes}
              searchQuery={searchQuery}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {currentTab === 'settings' && <SettingsView />}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

