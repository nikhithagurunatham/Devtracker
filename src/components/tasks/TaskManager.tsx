import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Calendar as CalendarIcon,
  AlertCircle,
  Inbox,
  LayoutGrid,
  List,
  CalendarDays,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { TaskItem } from './TaskItem';
import { TaskModal } from './TaskModal';
import { QuickAddTaskInput } from './QuickAddTaskInput';
import { BulkActionBar } from './BulkActionBar';
import { useToast } from '@/components/ui/Toast';

export const TaskManager: React.FC = () => {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'calendar'>('list');

  // Dates
  const todayStr = new Date().toISOString().split('T')[0];
  const tomDate = new Date();
  tomDate.setDate(tomDate.getDate() + 1);
  const tomorrowStr = tomDate.toISOString().split('T')[0];

  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

  // Fetch tasks from API (PostgreSQL Prisma) with DevTrackStore fallback
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setIsError(null);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks);
          // Sync with local offline store as backup
          return;
        }
      }
      // Fallback
      setTasks(DevTrackStore.getTasks());
    } catch (e: any) {
      setTasks(DevTrackStore.getTasks());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const handleStoreUpdate = (e: any) => {
      if (e.detail?.key === 'tasks') {
        setTasks(DevTrackStore.getTasks());
      }
    };
    window.addEventListener('devtrack_store_updated', handleStoreUpdate);
    return () => window.removeEventListener('devtrack_store_updated', handleStoreUpdate);
  }, [fetchTasks]);

  // Filtering by tabs
  const filteredByTab = tasks.filter((t) => {
    if (activeTab === 'today') {
      return t.status !== 'COMPLETED' && (!t.dueDate || t.dueDate === todayStr);
    }
    if (activeTab === 'tomorrow') {
      return t.status !== 'COMPLETED' && t.dueDate === tomorrowStr;
    }
    if (activeTab === 'week') {
      return (
        t.status !== 'COMPLETED' &&
        t.dueDate &&
        t.dueDate >= todayStr &&
        t.dueDate <= nextWeekStr
      );
    }
    if (activeTab === 'upcoming') {
      return t.status !== 'COMPLETED' && t.dueDate && t.dueDate > todayStr;
    }
    if (activeTab === 'overdue') {
      return t.status !== 'COMPLETED' && t.dueDate && t.dueDate < todayStr;
    }
    if (activeTab === 'completed') {
      return t.status === 'COMPLETED';
    }
    return true; // 'all'
  });

  // Filtering by search, category, priority
  const displayTasks = filteredByTab.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory =
      selectedCategory === 'ALL' || t.category === selectedCategory;
    const matchesPriority =
      selectedPriority === 'ALL' || t.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  // HANDLERS with API persistence + optimistic updates
  const handleToggleComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';

    // Optimistic local update
    const updatedTasks = tasks.map((t) =>
      t.id === id ? { ...t, status: nextStatus as TaskStatus, completedAt: nextStatus === 'COMPLETED' ? new Date().toISOString() : undefined } : t
    );
    setTasks(updatedTasks);
    DevTrackStore.updateTask(id, { status: nextStatus as TaskStatus });

    // Call PATCH /api/tasks/:id
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
    } catch (e) {
      // Offline fallback already updated in store
    }
  };

  const handleCreateOrEdit = async (data: any) => {
    if (editingTask) {
      // UPDATE TASK: PATCH /api/tasks/:id
      const id = editingTask.id;
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t))
      );
      DevTrackStore.updateTask(id, data);
      setEditingTask(null);

      try {
        await fetch(`/api/tasks/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
      } catch (e) {
        // Fallback
      }
    } else {
      // CREATE TASK: POST /api/tasks
      // Optimistic update
      const localNew = DevTrackStore.addTask(data);
      setTasks((prev) => [localNew, ...prev]);

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          const resData = await res.json();
          if (resData.task) {
            setTasks((prev) => [resData.task, ...prev.filter((t) => t.id !== localNew.id)]);
          }
        }
      } catch (e) {
        // Fallback already saved locally
      }
    }
  };

  const handleDuplicate = async (id: string) => {
    const original = tasks.find((t) => t.id === id);
    if (!original) return;

    const copyData = {
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      priority: original.priority,
      status: 'TODO' as TaskStatus,
      dueDate: original.dueDate,
      dueTime: original.dueTime,
      estimatedTime: original.estimatedTime,
      tags: original.tags,
      recurring: original.recurring,
      projectId: original.projectId,
      roadmapDayId: original.roadmapDayId,
    };

    // Optimistic create
    const localCopy = DevTrackStore.addTask(copyData);
    setTasks((prev) => [localCopy, ...prev]);

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(copyData),
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.task) {
          setTasks((prev) => [resData.task, ...prev.filter((t) => t.id !== localCopy.id)]);
        }
      }
    } catch (e) {
      // Fallback
    }
  };

  const handleDelete = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    DevTrackStore.deleteTask(id);

    showToast(`Task "${taskToDelete?.title || ''}" deleted`, 'info', 5000, () => {
      if (taskToDelete) {
        setTasks((prev) => [taskToDelete, ...prev]);
        DevTrackStore.addTask(taskToDelete);
        fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskToDelete),
        });
      }
    });

    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (e) {
      // Fallback
    }
  };

  const handleSelectTask = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  // BULK ACTIONS
  const handleBulkComplete = async () => {
    const ids = [...selectedIds];
    setTasks((prev) =>
      prev.map((t) =>
        ids.includes(t.id) ? { ...t, status: 'COMPLETED' as TaskStatus, completedAt: new Date().toISOString() } : t
      )
    );
    DevTrackStore.bulkCompleteTasks(ids);
    setSelectedIds([]);
    showToast(`Completed ${ids.length} tasks`, 'success');

    try {
      await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', taskIds: ids }),
      });
    } catch (e) {}
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    const deletedTasks = tasks.filter((t) => ids.includes(t.id));
    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)));
    DevTrackStore.bulkDeleteTasks(ids);
    setSelectedIds([]);

    showToast(`Deleted ${ids.length} tasks`, 'info', 5000, () => {
      setTasks((prev) => [...deletedTasks, ...prev]);
      deletedTasks.forEach((t) => DevTrackStore.addTask(t));
    });

    try {
      await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', taskIds: ids }),
      });
    } catch (e) {}
  };

  const handleBulkChangePriority = async (priority: TaskPriority) => {
    const ids = [...selectedIds];
    setTasks((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, priority } : t))
    );
    DevTrackStore.bulkUpdatePriority(ids, priority);
    setSelectedIds([]);

    try {
      await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updatePriority', taskIds: ids, value: priority }),
      });
    } catch (e) {}
  };

  const handleBulkChangeCategory = async (category: TaskCategory) => {
    const ids = [...selectedIds];
    setTasks((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, category } : t))
    );
    DevTrackStore.bulkUpdateCategory(ids, category);
    setSelectedIds([]);

    try {
      await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateCategory', taskIds: ids, value: category }),
      });
    } catch (e) {}
  };

  const handleBulkChangeDueDate = async (dueDate: string) => {
    const ids = [...selectedIds];
    setTasks((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, dueDate } : t))
    );
    DevTrackStore.bulkUpdateDueDate(ids, dueDate);
    setSelectedIds([]);

    try {
      await fetch('/api/tasks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateDueDate', taskIds: ids, value: dueDate }),
      });
    } catch (e) {}
  };

  const counts = {
    today: tasks.filter((t) => t.status !== 'COMPLETED' && (!t.dueDate || t.dueDate === todayStr)).length,
    tomorrow: tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate === tomorrowStr).length,
    week: tasks.filter(
      (t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate >= todayStr && t.dueDate <= nextWeekStr
    ).length,
    upcoming: tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate > todayStr).length,
    overdue: tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate < todayStr).length,
    completed: tasks.filter((t) => t.status === 'COMPLETED').length,
    all: tasks.length,
  };

  const tabList = [
    { id: 'today', label: 'Today', count: counts.today },
    { id: 'tomorrow', label: 'Tomorrow', count: counts.tomorrow },
    { id: 'week', label: 'This Week', count: counts.week },
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming },
    { id: 'overdue', label: 'Overdue', count: counts.overdue },
    { id: 'completed', label: 'Completed', count: counts.completed },
    { id: 'all', label: 'All Tasks', count: counts.all },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Developer Task Management</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
              Full CRUD & Prisma Synced
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Track daily DSA practice, web dev modules, project features, and interview action items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle: List, Kanban, Calendar */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List view"
            >
              <List size={14} />
              <span className="hidden sm:inline text-[11px]">List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'kanban' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban view"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline text-[11px]">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                viewMode === 'calendar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Calendar view"
            >
              <CalendarDays size={14} />
              <span className="hidden sm:inline text-[11px]">Calendar</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchTasks}
            title="Refresh tasks from PostgreSQL database"
            className="!px-2"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-indigo-400' : ''} />
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add Task</span>
          </Button>
        </div>
      </div>

      {/* NLP Quick Add Input with Review Modal */}
      <QuickAddTaskInput
        onTaskCreated={(t) => {
          handleCreateOrEdit(t);
        }}
      />

      {/* Tabs Bar */}
      <Tabs
        tabs={tabList}
        activeTab={activeTab}
        onChange={(id) => {
          setActiveTab(id);
          setSelectedIds([]);
        }}
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, description, or #tag..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex items-center gap-2">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="DSA">DSA</option>
            <option value="WEB_DEV">Web Dev</option>
            <option value="PROJECT">Project</option>
            <option value="CS">CS Fundamentals</option>
            <option value="JOB">Job Application</option>
            <option value="REVISION">Revision</option>
            <option value="PERSONAL">Personal</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent ⚡</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Loading state indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-slate-900/30 border border-slate-800/80 rounded-2xl gap-2 text-xs text-indigo-400 animate-pulse">
          <Loader2 size={16} className="animate-spin" />
          <span>Syncing tasks with PostgreSQL database...</span>
        </div>
      )}

      {/* Main View: List | Kanban | Calendar */}
      {viewMode === 'list' && (
        <div className="space-y-2.5">
          {displayTasks.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <Inbox size={32} className="mx-auto text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No tasks in this view</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All caught up! Add a new task or use the AI Quick Add bar above to schedule your next
                study session.
              </p>
            </div>
          ) : (
            displayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                isSelected={selectedIds.includes(task.id)}
                onSelect={handleSelectTask}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsModalOpen(true);
                }}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['TODO', 'IN_PROGRESS', 'COMPLETED'] as TaskStatus[]).map((colStatus) => {
            const colTasks = displayTasks.filter((t) => t.status === colStatus);
            const colTitles = {
              TODO: 'To Do',
              IN_PROGRESS: 'In Progress',
              COMPLETED: 'Completed',
              CANCELLED: 'Cancelled',
            };

            return (
              <div
                key={colStatus}
                className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 min-h-[400px]"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        colStatus === 'COMPLETED'
                          ? 'bg-emerald-500'
                          : colStatus === 'IN_PROGRESS'
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                    />
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      {colTitles[colStatus]}
                    </h3>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-800/50 rounded-lg">
                      <p className="text-xs text-slate-500">No tasks</p>
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        isSelected={selectedIds.includes(task.id)}
                        onSelect={handleSelectTask}
                        onToggleComplete={handleToggleComplete}
                        onEdit={(t) => {
                          setEditingTask(t);
                          setIsModalOpen(true);
                        }}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === 'calendar' && (() => {
        const now = new Date();
        const currentDayOfWeek = now.getDay();
        const distToMon = (currentDayOfWeek + 6) % 7;
        const weekMonday = new Date(now);
        weekMonday.setDate(now.getDate() - distToMon);

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => {
          const d = new Date(weekMonday);
          d.setDate(weekMonday.getDate() + idx);
          const dStr = d.toISOString().split('T')[0];
          return { dayName, date: d, dateStr: dStr };
        });

        const weekLabel = `${weekDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekDays[6].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

        return (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CalendarDays size={16} className="text-indigo-400" />
                <span>Current Week Schedule</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{weekLabel}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {weekDays.map(({ dayName, date, dateStr }) => {
                const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={dayName}
                    className={`p-3 rounded-xl border flex flex-col gap-2 min-h-[150px] transition-colors ${
                      isToday
                        ? 'bg-indigo-950/20 border-indigo-500/50 ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-800/60">
                      <span className="font-semibold text-slate-400">{dayName}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`font-mono text-xs ${isToday ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                          {date.getDate()}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTask({
                              id: '',
                              userId: '',
                              title: '',
                              category: 'DSA',
                              priority: 'MEDIUM',
                              status: 'TODO',
                              dueDate: dateStr,
                              tags: [],
                              createdAt: '',
                              updatedAt: '',
                            });
                            setIsModalOpen(true);
                          }}
                          className="p-0.5 rounded text-slate-500 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title={`Add task for ${dateStr}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      {dayTasks.length === 0 ? (
                        <span className="text-[10px] text-slate-600 block mt-2">No tasks</span>
                      ) : (
                        dayTasks.map((t) => (
                          <div
                            key={t.id}
                            className={`p-1.5 rounded text-[11px] font-medium border flex items-center justify-between gap-1 group/item transition-colors ${
                              t.status === 'COMPLETED'
                                ? 'line-through text-slate-500 bg-slate-900/40 border-slate-800/50'
                                : 'text-slate-200 bg-slate-900 border-slate-700/60 hover:border-indigo-500'
                            }`}
                          >
                            <span
                              onClick={() => {
                                setEditingTask(t);
                                setIsModalOpen(true);
                              }}
                              className="truncate flex-1 cursor-pointer"
                              title={t.title}
                            >
                              {t.title}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(t.id);
                              }}
                              className="opacity-0 group-hover/item:opacity-100 text-slate-500 hover:text-rose-400 p-0.5 transition-opacity"
                              title="Delete task"
                            >
                              <AlertCircle size={10} className="hidden" />
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkComplete={handleBulkComplete}
        onBulkDelete={handleBulkDelete}
        onBulkChangePriority={handleBulkChangePriority}
        onBulkChangeCategory={handleBulkChangeCategory}
        onBulkChangeDueDate={handleBulkChangeDueDate}
      />

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleCreateOrEdit}
        initialTask={editingTask}
      />
    </div>
  );
};
