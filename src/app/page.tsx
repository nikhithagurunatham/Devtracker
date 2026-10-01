'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { QuickActionModal } from '@/components/layout/QuickActionModal';
import { MotivationalQuoteBanner } from '@/components/layout/MotivationalQuoteBanner';

// Views
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { TaskManager } from '@/components/tasks/TaskManager';
import { RoadmapTimeline } from '@/components/roadmap/RoadmapTimeline';
import { DSAPage } from '@/components/dsa/DSAPage';
import { WebDevTree } from '@/components/webdev/WebDevTree';
import { ProjectManager } from '@/components/projects/ProjectManager';
import { PomodoroTimer } from '@/components/study/PomodoroTimer';
import { HabitTracker } from '@/components/habits/HabitTracker';
import { MoodTracker } from '@/components/mood/MoodTracker';
import { ATSKanbanBoard } from '@/components/jobs/ATSKanbanBoard';
import { DevMentorChat } from '@/components/ai/DevMentorChat';
import { AIDailyPlanView } from '@/components/ai/AIDailyPlanView';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { MonthlyCalendar } from '@/components/calendar/MonthlyCalendar';
import { ResumeManager } from '@/components/resume/ResumeManager';

import { DevTrackStore } from '@/lib/storage';
import { Problem, RoadmapDayItem, UserProfile } from '@/types';

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // App state for counts & navigation
  const [userProfile, setUserProfile] = useState<UserProfile>(DevTrackStore.getProfile());
  const [dueTasksCount, setDueTasksCount] = useState(0);
  const [pendingRevisionsCount, setPendingRevisionsCount] = useState(0);
  const [roadmapDays, setRoadmapDays] = useState<RoadmapDayItem[]>(
    DevTrackStore.getRoadmapDays()
  );

  const refreshCounts = () => {
    const tasks = DevTrackStore.getTasks();
    const todayStr = new Date().toISOString().split('T')[0];
    const dueTasks = tasks.filter(
      (t) => t.status !== 'COMPLETED' && (!t.dueDate || t.dueDate <= todayStr)
    );
    setDueTasksCount(dueTasks.length);

    const problems = DevTrackStore.getProblems();
    const dueRevisions = problems.filter(
      (p) => p.nextRevisionAt && p.nextRevisionAt <= todayStr
    );
    setPendingRevisionsCount(dueRevisions.length);

    setRoadmapDays(DevTrackStore.getRoadmapDays());
    setUserProfile(DevTrackStore.getProfile());
  };

  useEffect(() => {
    refreshCounts();

    const handleUpdate = () => refreshCounts();
    window.addEventListener('devtrack_store_updated', handleUpdate);

    // Global Command Palette Shortcut (Ctrl+K or Cmd+K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('devtrack_store_updated', handleUpdate);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleExecuteCommand = (action: string) => {
    if (action === 'add_task') {
      setActiveTab('tasks');
    } else if (action === 'start_timer') {
      setActiveTab('study');
    } else if (action === 'add_problem') {
      setActiveTab('dsa');
    } else if (action === 'add_job') {
      setActiveTab('jobs');
    } else if (action === 'ask_ai') {
      setActiveTab('ai');
    } else if (action === 'view_revision') {
      setActiveTab('dsa');
    } else if (action === 'open_plan') {
      setActiveTab('plan');
    } else if (action === 'log_mood') {
      setActiveTab('mood');
    }
  };

  const handleUpdateRoadmapDay = (
    dayNumber: number,
    updates: Partial<RoadmapDayItem>
  ) => {
    DevTrackStore.updateRoadmapDay(dayNumber, updates);
    setRoadmapDays(DevTrackStore.getRoadmapDays());
  };

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'auth') {
            window.location.href = '/sign-in';
          } else {
            setActiveTab(tab);
          }
        }}
        dueTasksCount={dueTasksCount}
        pendingRevisionsCount={pendingRevisionsCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenQuickAction={() => setIsQuickActionOpen(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          currentStreak={userProfile.currentStreak || 0}
          revisionsDueCount={pendingRevisionsCount}
        />

        {/* View Port Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pb-16">
          {/* Motivational Quote on opening application */}
          <MotivationalQuoteBanner />

          {activeTab === 'dashboard' && (
            <DashboardOverview
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenProblem={(p) => setActiveTab('dsa')}
              onQuickAddTask={() => setActiveTab('tasks')}
            />
          )}

          {activeTab === 'roadmap' && (
            <RoadmapTimeline
              days={roadmapDays}
              goalTitle={DevTrackStore.getProfile().goalTitle}
              onUpdateDay={handleUpdateRoadmapDay}
            />
          )}

          {activeTab === 'tasks' && <TaskManager />}

          {activeTab === 'dsa' && <DSAPage />}

          {activeTab === 'webdev' && (
            <WebDevTree
              topics={DevTrackStore.getWebDevTopics()}
              onUpdateTopic={(id, updates) => {
                DevTrackStore.updateWebDevTopic(id, updates);
                refreshCounts();
              }}
            />
          )}

          {activeTab === 'projects' && <ProjectManager />}

          {activeTab === 'study' && <PomodoroTimer />}

          {activeTab === 'habits' && <HabitTracker />}

          {activeTab === 'mood' && <MoodTracker />}

          {activeTab === 'jobs' && <ATSKanbanBoard />}

          {activeTab === 'ai' && <DevMentorChat />}

          {activeTab === 'plan' && <AIDailyPlanView />}

          {activeTab === 'analytics' && <AnalyticsDashboard />}

          {activeTab === 'calendar' && <MonthlyCalendar />}

          {activeTab === 'resume' && <ResumeManager />}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onExecuteCommand={handleExecuteCommand}
      />

      {/* Quick Action Natural Language Log Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSuccess={() => refreshCounts()}
      />
    </div>
  );
}
