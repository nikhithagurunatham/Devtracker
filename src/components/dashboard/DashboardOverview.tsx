import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  Target,
  CheckCircle,
  Circle,
  AlertCircle,
  Briefcase,
  ChevronRight,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RefreshCw,
  Heart,
} from 'lucide-react';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Task, Problem, JobApplicationItem } from '@/types';

interface DashboardOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenProblem: (problem: Problem) => void;
  onQuickAddTask: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onNavigateTab,
  onOpenProblem,
  onQuickAddTask,
}) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setTick((t) => t + 1);
    window.addEventListener('devtrack_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('devtrack_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const profile = DevTrackStore.getProfile();
  const tasks = DevTrackStore.getTasks();
  const problems = DevTrackStore.getProblems();
  const jobApps = DevTrackStore.getJobApplications();
  const moodLogs = DevTrackStore.getMoodLogs();
  const webTopics = DevTrackStore.getWebDevTopics();
  const projects = DevTrackStore.getProjects();
  const roadmapDays = DevTrackStore.getRoadmapDays();
  const currentDay = roadmapDays.find((d) => !d.isCompleted) || roadmapDays[0] || {
    dayNumber: 1,
    phaseTitle: 'Phase 1: Foundation & Complexity',
    theme: 'Language Basics & Asymptotic Analysis',
    dsaFocus: 'Big-O notation, Time & Space Complexity, Memory layout',
    webDevFocus: 'HTML5 Semantic tags, Modern CSS Box Model',
    csFocus: 'Process vs Thread, Memory Hierarchy',
  };
  const currentDayNumber = currentDay.dayNumber;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Tasks for today
  const todayTasks = tasks.filter(
    (t) => t.status !== 'COMPLETED' && (!t.dueDate || t.dueDate === todayStr)
  );

  // Revisions due
  const revisionsDue = problems.filter(
    (p) => p.nextRevisionAt && p.nextRevisionAt <= todayStr
  );

  // Weak problems / topics
  const weakProblems = problems.filter((p) => p.confidence <= 2 || p.status === 'ATTEMPTED');
  const weakTopics = Array.from(new Set(weakProblems.map((p) => p.topicName).filter(Boolean)));

  // Active Job Applications & Follow-ups
  const activeApps = jobApps.filter((a) => a.status !== 'REJECTED' && a.status !== 'WITHDRAWN');
  const followUpsDue = jobApps.filter((a) => a.followUpDate && a.followUpDate <= todayStr);
  const upcomingInterviews = jobApps.filter((a) => a.interviewDate || a.oaDate);

  // Today's mood
  const todayMood = moodLogs.find((m) => m.date === todayStr);

  // Progress metrics
  const dsaSolved = problems.filter((p) => p.status === 'SOLVED' || p.status === 'MASTERED').length;
  const dsaPercentage = problems.length > 0 ? Math.round((dsaSolved / problems.length) * 100) : 0;

  const webCompletedLessons = webTopics.reduce((a, b) => a + b.completedLessons, 0);
  const webTotalLessons = webTopics.reduce((a, b) => a + b.lessonsCount, 0);
  const webPercentage = webTotalLessons > 0 ? Math.round((webCompletedLessons / webTotalLessons) * 100) : 0;

  const projectsAvg = Math.round(
    projects.reduce((a, b) => a + b.progress, 0) / (projects.length || 1)
  );

  const handleToggleTask = (id: string) => {
    const task = DevTrackStore.getTaskById(id);
    if (!task) return;
    DevTrackStore.updateTask(id, {
      status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED',
    });
    // Trigger reactive reload
    window.dispatchEvent(new CustomEvent('devtrack_store_updated', { detail: { key: 'tasks' } }));
  };

  const handleQuickLogMood = (score: number) => {
    DevTrackStore.logMood({
      date: todayStr,
      score,
      energy: score,
      stress: Math.max(1, 6 - score),
    });
    window.dispatchEvent(new CustomEvent('devtrack_store_updated', { detail: { key: 'mood_logs' } }));
  };

  return (
    <div className="space-y-6">
      {/* Good Morning Hero Header */}
      <div className="p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <span>{todayDateFormatted}</span>
              <span>•</span>
              <span className="font-bold">DAY {currentDayNumber} / 100</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
              GOOD MORNING, {profile.name.toUpperCase()}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
              Roadmap Goal:{' '}
              <strong className="text-indigo-300 font-semibold">{profile.goalTitle}</strong>.
              {' '}{currentDay.phaseTitle}: {currentDay.theme}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak Pill */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Flame size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Current Streak
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {profile.currentStreak} Days
                </span>
              </div>
            </div>

            {/* Daily Study Goal */}
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock size={20} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                  Study Hours
                </span>
                <span className="text-lg font-bold text-white font-mono">
                  {((DevTrackStore.getStudySessions().filter(s => s.startTime.startsWith(todayStr)).reduce((a, b) => a + b.durationMin, 0)) / 60).toFixed(1)} / {profile.dailyStudyTarget}h
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Daily AI Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* WHAT YOU DID */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle size={15} />
            <span>WHAT YOU DID</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {dsaSolved > 0 ? (
              <>You solved <strong className="text-white">{dsaSolved} DSA problems</strong> and made progress across your modules.</>
            ) : (
              <>Welcome to Day 1! Ready to kick off your SDE-1 preparation roadmap and start your first topic.</>
            )}
          </p>
        </div>

        {/* WHAT YOU'RE WEAK AT */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
            <AlertCircle size={15} />
            <span>WHAT YOU&apos;RE WEAK AT</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {weakProblems.length > 0 ? (
              <>Your lowest confidence areas are <strong className="text-rose-300">{weakTopics.slice(0, 2).join(', ')}</strong>. You have {revisionsDue.length} revisions due.</>
            ) : (
              <>No weak topics flagged yet. As you solve problems and rate confidence, DevMentor will automatically track weak areas.</>
            )}
          </p>
        </div>

        {/* WHAT YOU SHOULD DO NEXT */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={15} />
            <span>WHAT YOU SHOULD DO NEXT</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {dsaSolved === 0 ? (
              <>Start with <strong className="text-indigo-200">Programming Fundamentals & Asymptotic Analysis</strong> in the DSA Tree today.</>
            ) : (
              <>Continue Day {currentDayNumber} tasks and complete your daily study focus blocks.</>
            )}
          </p>
        </div>
      </div>

      {/* Revision Due Alert Banner if any */}
      {revisionsDue.length > 0 && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {revisionsDue.length} Spaced Repetitions Due Today
              </span>
              <p className="text-xs text-rose-300/90 mt-0.5">
                Problems:{' '}
                {revisionsDue.map((r) => r.name).join(', ')}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onNavigateTab('dsa')}
            className="text-xs whitespace-nowrap self-start sm:self-center"
          >
            <span>Start Revision Session</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      )}

      {/* Main Grid: Today's Tasks & Today's Progress / ATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Focus & Tasks */}
        <div className="lg:col-span-2 space-y-5">
          {/* Today's Focus Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Target size={16} className="text-indigo-400" />
                <span>Today&apos;s Focus & Action Plan</span>
              </h3>
              <Button size="sm" variant="outline" onClick={onQuickAddTask} className="text-xs !py-1">
                + Add Task
              </Button>
            </div>

            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1.5 font-medium">
              {currentDay.dsaFocus && <li>DSA — {currentDay.dsaFocus}</li>}
              {currentDay.webDevFocus && <li>Web Dev — {currentDay.webDevFocus}</li>}
              {currentDay.csFocus && <li>CS Fundamentals — {currentDay.csFocus}</li>}
              {currentDay.projectsFocus && <li>Project — {currentDay.projectsFocus}</li>}
              <li>Solve Day {currentDayNumber} practice problems & review notes</li>
            </ol>

            {/* Quick Interactive Tasks List */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Pending Tasks For Today ({todayTasks.length})
              </h4>
              <div className="space-y-2">
                {todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Circle size={17} className="text-slate-500 hover:text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-slate-200 truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge type={task.category}>{task.category}</Badge>
                      <Badge type={task.priority}>{task.priority}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Active Job Applications & Follow-ups */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Briefcase size={16} className="text-blue-400" />
                <span>Active ATS Applications ({activeApps.length})</span>
              </h3>
              <button
                onClick={() => onNavigateTab('jobs')}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Pipeline</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeApps.map((app) => (
                <div
                  key={app.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{app.company}</span>
                      <span className="text-slate-400">— {app.role}</span>
                    </div>
                    {app.followUpDate === todayStr && (
                      <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                        ⚠️ Action Required: Follow-up email due today!
                      </span>
                    )}
                  </div>

                  <Badge type={app.status}>{app.status}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Progress Bars, Mood, Weak Areas */}
        <div className="space-y-5">
          {/* Progress Overview Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-400" />
              <span>Overall Curriculum Progress</span>
            </h3>

            <div className="space-y-3">
              {/* DSA */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>DSA Progression</span>
                  <span className="font-mono text-cyan-400 font-bold">{dsaPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-cyan-500 rounded-full"
                    style={{ width: `${dsaPercentage}%` }}
                  />
                </div>
              </div>

              {/* Web Dev */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Web Development</span>
                  <span className="font-mono text-emerald-400 font-bold">{webPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${webPercentage}%` }}
                  />
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Portfolio Projects</span>
                  <span className="font-mono text-violet-400 font-bold">{projectsAvg}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{ width: `${projectsAvg}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Today's Mood Card */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-rose-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Today&apos;s Mood & Energy
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('mood')}
                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>{todayMood?.score ? 'Edit Full Details' : 'Full Log'}</span>
                <ChevronRight size={13} />
              </button>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-400 block">Status for {todayDateFormatted}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm font-bold text-white">
                    {todayMood?.score ? (
                      <>
                        Rating <span className="text-indigo-400 font-mono">{todayMood.score} / 5</span>
                        {todayMood.score >= 4 ? ' (High Energy 🚀)' : todayMood.score === 3 ? ' (Moderate 😐)' : ' (Low / Recovery 🧘)'}
                      </>
                    ) : (
                      <span className="text-amber-400 font-medium">Not logged yet today</span>
                    )}
                  </span>
                </div>
              </div>
              <div className="text-2xl">
                {todayMood?.score === 5
                  ? '🚀'
                  : todayMood?.score === 4
                  ? '🙂'
                  : todayMood?.score === 3
                  ? '😐'
                  : todayMood?.score === 2
                  ? '🙁'
                  : todayMood?.score === 1
                  ? '😫'
                  : '😶'}
              </div>
            </div>

            {/* Quick 1-Click Emoji Log Buttons */}
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-2">
                {todayMood?.score ? 'Quick change mood rating:' : 'Quick log in 1-click:'}
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { lvl: 1, icon: '😫', label: 'Terrible' },
                  { lvl: 2, icon: '🙁', label: 'Low' },
                  { lvl: 3, icon: '😐', label: 'Okay' },
                  { lvl: 4, icon: '🙂', label: 'Good' },
                  { lvl: 5, icon: '🚀', label: 'Great' },
                ].map(({ lvl, icon, label }) => {
                  const isSelected = todayMood?.score === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleQuickLogMood(lvl)}
                      title={`${label} (${lvl}/5)`}
                      className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/40 text-white'
                          : 'bg-slate-950 border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 text-slate-300'
                      }`}
                    >
                      <span className="text-lg leading-none">{icon}</span>
                      <span className="text-[10px] mt-1 font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Weak DSA Topics Box */}
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400 block">
              Weak DSA Areas (Prioritize Today)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {weakTopics.map((topic, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 bg-rose-950/30 text-rose-300 border border-rose-500/30 rounded-lg font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              DevMentor AI recommends solving 1 problem in each weak topic before introducing new algorithms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
