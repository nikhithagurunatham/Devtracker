import React, { useState, useEffect } from 'react';
import {
  Globe,
  CheckCircle,
  BookOpen,
  Code,
  Sparkles,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  CalendarDays,
  CalendarCheck,
  CalendarPlus,
  X,
  ListTodo,
  Filter,
} from 'lucide-react';
import { WebDevTopic, Task, TaskPriority } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

interface WebDevTreeProps {
  topics: WebDevTopic[];
  onUpdateTopic: (id: string, updates: Partial<WebDevTopic>) => void;
}

export const WebDevTree: React.FC<WebDevTreeProps> = ({
  topics,
  onUpdateTopic,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'topics' | 'tasks'>('topics');
  const [selectedTopic, setSelectedTopic] = useState<WebDevTopic | null>(null);

  // Web Dev Tasks State
  const [webDevTasks, setWebDevTasks] = useState<Task[]>(() =>
    DevTrackStore.getTasks().filter((t) => t.category === 'WEB_DEV')
  );

  // New Web Dev Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTopic, setNewTaskTopic] = useState(topics[0]?.name || 'JavaScript');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');

  const reloadTasks = () => {
    setWebDevTasks(DevTrackStore.getTasks().filter((t) => t.category === 'WEB_DEV'));
  };

  useEffect(() => {
    reloadTasks();
    const handleStoreUpdate = () => reloadTasks();
    window.addEventListener('devtrack_store_updated', handleStoreUpdate);
    window.addEventListener('storage', handleStoreUpdate);

    return () => {
      window.removeEventListener('devtrack_store_updated', handleStoreUpdate);
      window.removeEventListener('storage', handleStoreUpdate);
    };
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];
  const totalLessons = topics.reduce((acc, t) => acc + t.lessonsCount, 0);
  const completedLessons = topics.reduce((acc, t) => acc + t.completedLessons, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);
  const pendingTasksCount = webDevTasks.filter((t) => t.status !== 'COMPLETED').length;

  // Handlers for Web Dev Tasks
  const handleAddWebDevTask = (title: string, topicName?: string, dueDate?: string) => {
    if (!title.trim()) return;

    DevTrackStore.addTask({
      title: title.trim(),
      category: 'WEB_DEV',
      priority: newTaskPriority,
      status: 'TODO',
      dueDate: dueDate || newTaskDueDate,
      tags: ['WebDev', ...(topicName ? [topicName] : [])],
    });
    reloadTasks();
    showToast(`Task "${title}" scheduled in tasks & calendar!`, 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    DevTrackStore.deleteTask(taskId);
    reloadTasks();
    showToast('Task removed from Web Dev & calendar', 'info');
  };

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    DevTrackStore.updateTask(task.id, { status: nextStatus });
    reloadTasks();
  };

  const handleCreateCustomTask = () => {
    if (!newTaskTitle.trim()) return;
    handleAddWebDevTask(newTaskTitle, newTaskTopic, newTaskDueDate);
    setNewTaskTitle('');
  };

  const filteredTasks = webDevTasks.filter((t) => {
    if (taskFilter === 'PENDING') return t.status !== 'COMPLETED';
    if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Metric Banner */}
      <div className="p-5 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-cyan-950/20 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Globe size={20} className="text-emerald-400" />
            <span>Full-Stack Web Development Curriculum</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Industry-aligned modules from JavaScript internals to Next.js 14, React Patterns, and Production DevOps.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Lessons Completed</span>
            <span className="text-base font-bold text-emerald-400 font-mono">
              {completedLessons} / {totalLessons} ({overallProgress}%)
            </span>
          </div>

          <div className="text-right border-l border-slate-800 pl-4">
            <span className="text-xs text-slate-400 block">Active Tasks</span>
            <span className="text-base font-bold text-indigo-400 font-mono">
              {pendingTasksCount}
            </span>
          </div>
        </div>
      </div>

      {/* Sub navigation: Topics vs Tasks */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('topics')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'topics'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <BookOpen size={14} />
          <span>Curriculum & Topics ({topics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <ListTodo size={14} />
          <span>Web Dev Tasks & Schedule ({pendingTasksCount})</span>
        </button>
      </div>

      {/* VIEW 1: CURRICULUM TOPICS */}
      {activeTab === 'topics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => {
            const pct = Math.round((topic.completedLessons / topic.lessonsCount) * 100);
            const topicTasks = webDevTasks.filter((t) =>
              t.title.toLowerCase().includes(topic.name.toLowerCase()) ||
              (t.tags && t.tags.some((tag) => tag.toLowerCase() === topic.name.toLowerCase()))
            );
            const activeTopicTasks = topicTasks.filter((t) => t.status !== 'COMPLETED');

            return (
              <div
                key={topic.id}
                className="p-5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3
                      onClick={() => setSelectedTopic(topic)}
                      className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors cursor-pointer hover:underline"
                    >
                      {topic.name}
                    </h3>
                    <Badge type="WEB_DEV">{topic.category}</Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Lessons Progress</span>
                      <span className="font-mono text-emerald-400 font-semibold">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Key Concepts Preview */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {topic.concepts.slice(0, 4).map((c, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-800"
                      >
                        {c}
                      </span>
                    ))}
                    {topic.concepts.length > 4 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{topic.concepts.length - 4} more
                      </span>
                    )}
                  </div>

                  {/* Active Tasks Badge */}
                  {activeTopicTasks.length > 0 && (
                    <div className="mt-3 flex items-center justify-between text-[11px] bg-emerald-950/30 border border-emerald-800/40 rounded-lg px-2.5 py-1 text-emerald-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <CalendarCheck size={12} className="text-emerald-400" />
                        <span>{activeTopicTasks.length} task(s) scheduled</span>
                      </span>
                      <button
                        onClick={() => setActiveTab('tasks')}
                        className="text-[10px] underline hover:text-emerald-200 cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddWebDevTask(`Study & Practice: ${topic.name}`, topic.name, todayStr);
                    }}
                    className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/50 px-2 py-1 rounded-lg transition-colors"
                    title="Add practice task to calendar"
                  >
                    <CalendarPlus size={12} />
                    <span>+ Add Task</span>
                  </button>

                  <button
                    onClick={() => setSelectedTopic(topic)}
                    className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <span>View Syllabus</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: WEB DEV TASKS & SCHEDULE */}
      {activeTab === 'tasks' && (
        <div className="space-y-5">
          {/* Quick Add Web Dev Task Box */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ListTodo size={16} className="text-emerald-400" />
                <span>Add Web Development Task</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {pendingTasksCount} Pending • {webDevTasks.length - pendingTasksCount} Completed
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Task title (e.g., Build custom useDebounce hook, Setup Next.js middleware)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCustomTask();
                }}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />

              <select
                value={newTaskTopic}
                onChange={(e) => setNewTaskTopic(e.target.value)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                {topics.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>

              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
              />

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateCustomTask}
                disabled={!newTaskTitle.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 whitespace-nowrap text-xs"
              >
                <Plus size={14} />
                <span>Add Task</span>
              </Button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
              {(['ALL', 'PENDING', 'COMPLETED'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTaskFilter(mode)}
                  className={`px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                    taskFilter === mode
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredTasks.length} Web Dev tasks (synced with Calendar)
            </span>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <p className="text-xs text-slate-500">
                No tasks found for this filter. Use the input above or click &quot;+ Add Task&quot; on any topic card to schedule tasks!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const isCompleted = task.status === 'COMPLETED';
                const isOverdue = task.dueDate && task.dueDate < todayStr && !isCompleted;
                const isDueToday = task.dueDate === todayStr && !isCompleted;

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isCompleted
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task)}
                        className="text-slate-400 hover:text-emerald-400 transition-colors flex-shrink-0"
                        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-emerald-400" />
                        ) : (
                          <Circle size={18} />
                        )}
                      </button>

                      <div className="min-w-0 flex-1">
                        <span
                          className={`text-xs font-medium block truncate ${
                            isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {task.title}
                        </span>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              task.priority === 'URGENT'
                                ? 'bg-rose-950/40 text-rose-400 border-rose-800/40'
                                : task.priority === 'HIGH'
                                ? 'bg-amber-950/40 text-amber-400 border-amber-800/40'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {task.priority}
                          </span>

                          {task.dueDate && (
                            <span
                              className={`text-[10px] font-mono flex items-center gap-1 ${
                                isOverdue
                                  ? 'text-rose-400 font-bold'
                                  : isDueToday
                                  ? 'text-amber-400 font-bold'
                                  : 'text-slate-400'
                              }`}
                            >
                              <CalendarDays size={11} />
                              <span>{task.dueDate}</span>
                              {isOverdue && <span>(Overdue)</span>}
                              {isDueToday && <span>(Today)</span>}
                            </span>
                          )}

                          {task.tags && task.tags.length > 0 && (
                            <div className="flex items-center gap-1">
                              {task.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.2 bg-slate-950 text-slate-400 rounded border border-slate-800"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors flex-shrink-0"
                      title="Delete Web Dev task"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Topic Detail Modal with Syllabus Concept-Level Task Scheduling */}
      {selectedTopic && (
        <Modal
          isOpen={!!selectedTopic}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.name}
          subtitle={`Category: ${selectedTopic.category} • Confidence: ${selectedTopic.confidence}/5`}
          maxWidth="lg"
          footer={
            <Button variant="primary" onClick={() => setSelectedTopic(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-5">
            {/* Concept List with Task buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Core Conceptual Syllabus
                </h4>
                <span className="text-[10px] text-slate-500">
                  Click + to schedule any concept as a task on your calendar
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedTopic.concepts.map((concept, idx) => {
                  const conceptTask = webDevTasks.find((t) =>
                    t.title.toLowerCase().includes(concept.toLowerCase())
                  );

                  return (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{concept}</span>
                      </div>

                      {conceptTask ? (
                        <div className="flex items-center gap-1 bg-emerald-950/60 border border-emerald-800/60 rounded px-1.5 py-0.5 text-[10px] text-emerald-300 flex-shrink-0">
                          <CalendarCheck size={10} className="text-emerald-400" />
                          <span>Added</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteTask(conceptTask.id)}
                            className="text-slate-400 hover:text-rose-400 ml-0.5 p-0.5"
                            title="Delete task"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleAddWebDevTask(`Learn Web Dev: ${concept}`, selectedTopic.name, todayStr)
                          }
                          className="p-1 text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/50 rounded transition-colors flex-shrink-0"
                          title={`Schedule task: Learn ${concept}`}
                        >
                          <Plus size={13} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Slider */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
              <label className="text-xs font-semibold text-slate-300">Update Lesson Progress:</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max={selectedTopic.lessonsCount}
                  value={selectedTopic.completedLessons}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onUpdateTopic(selectedTopic.id, { completedLessons: val });
                    setSelectedTopic({ ...selectedTopic, completedLessons: val });
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-emerald-400 whitespace-nowrap">
                  {selectedTopic.completedLessons} / {selectedTopic.lessonsCount}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
