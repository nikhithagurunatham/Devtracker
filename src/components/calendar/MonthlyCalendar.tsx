import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  AlertCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Sparkles,
  Code2,
  Globe,
  FolderGit2,
  CalendarDays,
  Filter,
} from 'lucide-react';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import {
  Task,
  Problem,
  JobApplicationItem,
  StudySessionItem,
  TaskCategory,
  TaskPriority,
} from '@/types';

export const MonthlyCalendar: React.FC = () => {
  const { showToast } = useToast();
  // Dynamic current date initialization
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [jobApps, setJobApps] = useState<JobApplicationItem[]>([]);
  const [sessions, setSessions] = useState<StudySessionItem[]>([]);

  // Filtering
  const [selectedFilter, setSelectedFilter] = useState<
    'ALL' | 'DSA' | 'WEB_DEV' | 'PROJECT' | 'JOB' | 'REVISION'
  >('ALL');

  // Day inspection & task modal
  const [selectedDayStr, setSelectedDayStr] = useState<string | null>(null);

  // New task form inside day modal
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('DSA');
  const [newPriority, setNewPriority] = useState<TaskPriority>('MEDIUM');

  const reloadData = () => {
    setTasks(DevTrackStore.getTasks());
    setProblems(DevTrackStore.getProblems());
    setJobApps(DevTrackStore.getJobApplications());
    setSessions(DevTrackStore.getStudySessions());
  };

  useEffect(() => {
    reloadData();
    const handleStoreUpdate = () => reloadData();
    window.addEventListener('devtrack_store_updated', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    return () => {
      window.removeEventListener('devtrack_store_updated', handleStoreUpdate);
      window.removeEventListener('storage', handleStoreUpdate);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
  };

  // Build grid cells
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const actualTodayStr = new Date().toISOString().split('T')[0];

  // Handler: Add task for selected day
  const handleAddTaskForDay = async (dateStr: string) => {
    if (!newTitle.trim()) return;

    const taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'> = {
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'TODO',
      dueDate: dateStr,
      tags: [newCategory],
    };

    const created = DevTrackStore.addTask(taskData);
    reloadData();
    setNewTitle('');
    showToast(`Task added for ${dateStr}!`, 'success');

    // Async API sync
    try {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      });
    } catch (e) {
      // offline fallback
    }
  };

  // Handler: Delete task
  const handleDeleteTask = async (id: string, title: string) => {
    DevTrackStore.deleteTask(id);
    reloadData();
    showToast(`Task "${title}" deleted from calendar`, 'info');

    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (e) {
      // offline fallback
    }
  };

  // Handler: Toggle Task completion
  const handleToggleTask = async (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    DevTrackStore.updateTask(task.id, { status: nextStatus });
    reloadData();

    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      // offline fallback
    }
  };

  // Selected Day Items for Modal
  const modalTasks = selectedDayStr
    ? tasks.filter((t) => t.dueDate === selectedDayStr)
    : [];
  const modalRevisions = selectedDayStr
    ? problems.filter((p) => p.nextRevisionAt === selectedDayStr)
    : [];
  const modalInterviews = selectedDayStr
    ? jobApps.filter(
        (j) => j.interviewDate === selectedDayStr || j.oaDate === selectedDayStr
      )
    : [];

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon size={24} className="text-indigo-400" />
            <span>Developer Monthly Calendar</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Click any day to view deadlines, schedule new tasks, or manage DSA & Web Dev study targets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={jumpToToday}
            className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
          >
            <CalendarDays size={14} />
            <span>Today</span>
          </Button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <Button variant="ghost" size="sm" onClick={prevMonth} className="!p-1.5 h-8 w-8">
              <ChevronLeft size={16} />
            </Button>
            <span className="text-xs md:text-sm font-bold text-white min-w-[130px] text-center font-mono">
              {monthNames[month]} {year}
            </span>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="!p-1.5 h-8 w-8">
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 flex items-center gap-1 font-medium mr-1">
          <Filter size={13} />
          <span>Filter:</span>
        </span>

        {[
          { id: 'ALL', label: 'All Activities', color: 'slate' },
          { id: 'DSA', label: 'DSA Tasks', color: 'cyan', icon: Code2 },
          { id: 'WEB_DEV', label: 'Web Dev Tasks', color: 'emerald', icon: Globe },
          { id: 'PROJECT', label: 'Projects', color: 'indigo', icon: FolderGit2 },
          { id: 'JOB', label: 'Interviews & OAs', color: 'amber', icon: Briefcase },
          { id: 'REVISION', label: 'Spaced Repetition', color: 'rose', icon: Sparkles },
        ].map((btn) => {
          const isActive = selectedFilter === btn.id;
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setSelectedFilter(btn.id as any)}
              className={`px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {Icon && <Icon size={12} />}
              <span>{btn.label}</span>
            </button>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-xl">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-900/90 text-center text-xs font-semibold text-slate-400 py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-800/70 bg-slate-950/20 text-xs min-h-[540px]">
          {/* Empty prefix cells */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="p-2 bg-slate-950/40 text-slate-700 min-h-[95px]" />
          ))}

          {/* Actual Month Days */}
          {daysArray.map((dayNum) => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === actualTodayStr;

            // Items for this day
            const dayTasksAll = tasks.filter((t) => t.dueDate === dateStr);
            const dayRevisionsAll = problems.filter((p) => p.nextRevisionAt === dateStr);
            const dayInterviewsAll = jobApps.filter(
              (j) => j.interviewDate === dateStr || j.oaDate === dateStr
            );

            // Filtered views
            const dayTasks =
              selectedFilter === 'ALL'
                ? dayTasksAll
                : selectedFilter === 'DSA'
                ? dayTasksAll.filter((t) => t.category === 'DSA')
                : selectedFilter === 'WEB_DEV'
                ? dayTasksAll.filter((t) => t.category === 'WEB_DEV')
                : selectedFilter === 'PROJECT'
                ? dayTasksAll.filter((t) => t.category === 'PROJECT')
                : selectedFilter === 'JOB'
                ? dayTasksAll.filter((t) => t.category === 'JOB')
                : [];

            const dayRevisions =
              selectedFilter === 'ALL' || selectedFilter === 'REVISION' || selectedFilter === 'DSA'
                ? dayRevisionsAll
                : [];

            const dayInterviews =
              selectedFilter === 'ALL' || selectedFilter === 'JOB' ? dayInterviewsAll : [];

            const totalItemsCount =
              dayTasks.length + dayRevisions.length + dayInterviews.length;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDayStr(dateStr)}
                className={`p-2 min-h-[105px] flex flex-col justify-between transition-all cursor-pointer group relative ${
                  isToday
                    ? 'bg-indigo-950/30 ring-1 ring-inset ring-indigo-500/60'
                    : 'hover:bg-slate-850/60'
                }`}
                title={`Click to inspect or manage tasks for ${dateStr}`}
              >
                {/* Date Header + Quick Add Button */}
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center transition-colors ${
                      isToday
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {dayNum}
                  </span>

                  <div className="flex items-center gap-1">
                    {isToday && (
                      <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest hidden sm:inline">
                        Today
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDayStr(dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all"
                      title="Add task for this day"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                {/* Day events pills */}
                <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                  {/* Interviews / OAs */}
                  {dayInterviews.map((app) => (
                    <div
                      key={app.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 truncate flex items-center gap-1"
                      title={`Interview/OA: ${app.company} (${app.role})`}
                    >
                      <span>👔</span>
                      <span className="truncate">{app.company}</span>
                    </div>
                  ))}

                  {/* Revisions */}
                  {dayRevisions.map((rev) => (
                    <div
                      key={rev.id}
                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/20 text-rose-300 border border-rose-500/30 truncate flex items-center gap-1"
                      title={`DSA Spaced Repetition: ${rev.name}`}
                    >
                      <span>🔁</span>
                      <span className="truncate">{rev.name}</span>
                    </div>
                  ))}

                  {/* Tasks */}
                  {dayTasks.slice(0, 2).map((t) => {
                    const isCompleted = t.status === 'COMPLETED';
                    const isDSA = t.category === 'DSA';
                    const isWeb = t.category === 'WEB_DEV';
                    const isProject = t.category === 'PROJECT';

                    let colorStyle = 'bg-slate-900 text-slate-300 border-slate-800';
                    if (isDSA) colorStyle = 'bg-cyan-950/40 text-cyan-300 border-cyan-800/50';
                    else if (isWeb)
                      colorStyle = 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50';
                    else if (isProject)
                      colorStyle = 'bg-indigo-950/40 text-indigo-300 border-indigo-800/50';

                    return (
                      <div
                        key={t.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border truncate flex items-center gap-1 ${colorStyle} ${
                          isCompleted ? 'opacity-50 line-through' : ''
                        }`}
                        title={t.title}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}

                  {totalItemsCount > 2 && (
                    <div className="text-[9px] text-slate-500 pl-1 font-mono">
                      +{totalItemsCount - 2} more items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details & Task Management Modal */}
      {selectedDayStr && (
        <Modal
          isOpen={!!selectedDayStr}
          onClose={() => setSelectedDayStr(null)}
          title={`Schedule & Tasks for ${selectedDayStr}`}
          subtitle="Manage existing tasks or schedule new DSA, Web Dev, or Project tasks for this day."
          maxWidth="xl"
          footer={
            <Button variant="primary" onClick={() => setSelectedDayStr(null)}>
              Done
            </Button>
          }
        >
          <div className="space-y-6">
            {/* Quick Add Task Form */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Plus size={14} className="text-indigo-400" />
                <span>Add Task for {selectedDayStr}</span>
              </h4>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Task title (e.g., Solve 3Sum, Build React custom hook)..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTaskForDay(selectedDayStr);
                  }}
                  className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />

                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="DSA">DSA</option>
                  <option value="WEB_DEV">Web Dev</option>
                  <option value="PROJECT">Project</option>
                  <option value="CS">Core CS</option>
                  <option value="JOB">Job / ATS</option>
                  <option value="PERSONAL">Personal</option>
                  <option value="REVISION">Revision</option>
                </select>

                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="px-2.5 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleAddTaskForDay(selectedDayStr)}
                  disabled={!newTitle.trim()}
                  className="whitespace-nowrap"
                >
                  <Plus size={14} />
                  <span>Add Task</span>
                </Button>
              </div>

              {/* Quick 1-click Preset Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-500">Quick presets:</span>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle('Solve LeetCode Problem of the Day');
                    setNewCategory('DSA');
                    setNewPriority('HIGH');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-800/40 hover:bg-cyan-900/50"
                >
                  + DSA Daily Problem
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle('Implement Web Dev Concept & Code Demo');
                    setNewCategory('WEB_DEV');
                    setNewPriority('MEDIUM');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/50"
                >
                  + Web Dev Practice
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTitle('Project Feature Implementation & Commit');
                    setNewCategory('PROJECT');
                    setNewPriority('HIGH');
                  }}
                  className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/40 text-indigo-400 border border-indigo-800/40 hover:bg-indigo-900/50"
                >
                  + Project Task
                </button>
              </div>
            </div>

            {/* Existing Tasks List for This Day */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Scheduled Tasks ({modalTasks.length})
                </h4>
              </div>

              {modalTasks.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/30">
                  <p className="text-xs text-slate-500">
                    No tasks scheduled for this day yet. Use the input above to schedule one.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {modalTasks.map((t) => {
                    const isCompleted = t.status === 'COMPLETED';
                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isCompleted
                            ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={() => handleToggleTask(t)}
                            className="text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                            title={isCompleted ? 'Mark as TODO' : 'Mark as Completed'}
                          >
                            {isCompleted ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <Circle size={18} />
                            )}
                          </button>

                          <div className="min-w-0">
                            <span
                              className={`text-xs font-medium block truncate ${
                                isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                              }`}
                            >
                              {t.title}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge type={t.category}>{t.category}</Badge>
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  t.priority === 'URGENT'
                                    ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                                    : t.priority === 'HIGH'
                                    ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {t.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete Task Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteTask(t.id, t.title)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors flex-shrink-0"
                          title="Delete task from calendar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Other Events on this day (Revisions & Interviews) */}
            {(modalRevisions.length > 0 || modalInterviews.length > 0) && (
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Other Scheduled Events
                </h4>

                {modalRevisions.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-2.5 bg-rose-950/20 border border-rose-500/30 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-rose-400" />
                      <span className="font-semibold text-rose-200">DSA Revision: {rev.name}</span>
                    </div>
                    <Badge type={rev.difficulty}>{rev.difficulty}</Badge>
                  </div>
                ))}

                {modalInterviews.map((job) => (
                  <div
                    key={job.id}
                    className="p-2.5 bg-amber-950/20 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase size={14} className="text-amber-400" />
                      <span className="font-semibold text-amber-200">
                        Interview / OA: {job.company} ({job.role})
                      </span>
                    </div>
                    <Badge type={job.status}>{job.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
