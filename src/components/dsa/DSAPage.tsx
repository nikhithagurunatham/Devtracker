import React, { useState, useEffect } from 'react';
import {
  Code2,
  Layers,
  Calendar,
  Sparkles,
  Dices,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  CalendarDays,
  Filter,
  ListTodo,
} from 'lucide-react';
import { DSATopic, DSAPattern, Problem, Task, TaskPriority } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { DSATreeViewer } from './DSATreeViewer';
import { ProblemTable } from './ProblemTable';
import { RevisionQueue } from './RevisionQueue';
import { ProblemModal } from './ProblemModal';
import { TopicModal } from './TopicModal';

export const DSAPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'tree' | 'problems' | 'revision' | 'tasks'>('tree');
  const [topics, setTopics] = useState<DSATopic[]>(DevTrackStore.getDSATopics());
  const [patterns, setPatterns] = useState<DSAPattern[]>(DevTrackStore.getDSAPatterns());
  const [problems, setProblems] = useState<Problem[]>(DevTrackStore.getProblems());
  const [dsaTasks, setDsaTasks] = useState<Task[]>(() =>
    DevTrackStore.getTasks().filter((t) => t.category === 'DSA')
  );

  const [isProblemModalOpen, setIsProblemModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [selectedSectionForNewTopic, setSelectedSectionForNewTopic] = useState<
    'FOUNDATION' | 'CORE' | 'INTERMEDIATE' | 'ADVANCED'
  >('FOUNDATION');

  // DSA Tasks Filter & New Task Input
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('HIGH');
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => new Date().toISOString().split('T')[0]);

  const reloadData = () => {
    setTopics(DevTrackStore.getDSATopics());
    setPatterns(DevTrackStore.getDSAPatterns());
    setProblems(DevTrackStore.getProblems());
    setDsaTasks(DevTrackStore.getTasks().filter((t) => t.category === 'DSA'));
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

  const todayStr = new Date().toISOString().split('T')[0];
  const dueCount = problems.filter(
    (p) => p.nextRevisionAt && p.nextRevisionAt <= todayStr
  ).length;
  const pendingTasksCount = dsaTasks.filter((t) => t.status !== 'COMPLETED').length;

  const handleSaveProblem = (problemData: any) => {
    if (editingProblem) {
      DevTrackStore.updateProblem(editingProblem.id, problemData);
      setEditingProblem(null);
    } else {
      DevTrackStore.addProblem({
        ...problemData,
        topicId: problemData.topicId || 'top-8',
        topicName: problemData.topicName || 'Binary Search',
      });
    }
    reloadData();
  };

  const handleDeleteProblem = (id: string) => {
    DevTrackStore.deleteProblem(id);
    reloadData();
  };

  const handleSelectRandomWeak = () => {
    const random = DevTrackStore.getRandomWeakProblem();
    if (random) {
      setEditingProblem(random);
      setIsProblemModalOpen(true);
    }
  };

  const handleRecordRevision = (problemId: string, confidence: number) => {
    DevTrackStore.updateProblem(problemId, { confidence, status: 'SOLVED' });
    reloadData();
  };

  const handleSaveTopic = (topicData: any) => {
    DevTrackStore.addDSATopic(topicData);
    reloadData();
  };

  const handleDeleteTopic = (id: string) => {
    DevTrackStore.deleteDSATopic(id);
    reloadData();
  };

  const handleOpenAddTopicModal = (sec?: 'FOUNDATION' | 'CORE' | 'INTERMEDIATE' | 'ADVANCED') => {
    if (sec) setSelectedSectionForNewTopic(sec);
    setIsTopicModalOpen(true);
  };

  // --- DSA Task Management Handlers ---
  const handleAddTaskForProblem = (problem: Problem) => {
    const dueDate = problem.nextRevisionAt || todayStr;
    const priority =
      problem.difficulty === 'HARD' ? 'HIGH' : problem.difficulty === 'MEDIUM' ? 'MEDIUM' : 'LOW';

    DevTrackStore.addTask({
      title: `Solve DSA: ${problem.name}`,
      category: 'DSA',
      priority,
      status: 'TODO',
      dueDate,
      tags: ['DSA', problem.difficulty, ...(problem.patterns || [])],
    });
    reloadData();
    showToast(`Scheduled "${problem.name}" in your tasks & calendar!`, 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    DevTrackStore.deleteTask(taskId);
    reloadData();
    showToast('Task removed from DSA & calendar', 'info');
  };

  const handleToggleTaskStatus = (task: Task) => {
    const nextStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED';
    DevTrackStore.updateTask(task.id, { status: nextStatus });
    reloadData();
  };

  const handleCreateCustomDSATask = () => {
    if (!newTaskTitle.trim()) return;

    DevTrackStore.addTask({
      title: newTaskTitle.trim(),
      category: 'DSA',
      priority: newTaskPriority,
      status: 'TODO',
      dueDate: newTaskDueDate,
      tags: ['DSA'],
    });
    reloadData();
    setNewTaskTitle('');
    showToast('DSA task created and synced with Calendar!', 'success');
  };

  const filteredDsaTasks = dsaTasks.filter((t) => {
    if (taskFilter === 'PENDING') return t.status !== 'COMPLETED';
    if (taskFilter === 'COMPLETED') return t.status === 'COMPLETED';
    return true;
  });

  const tabs = [
    { id: 'tree', label: 'Knowledge Tree & Patterns', count: topics.length },
    { id: 'problems', label: 'Problem Database', count: problems.length },
    { id: 'revision', label: 'Revision Queue', count: dueCount },
    { id: 'tasks', label: 'DSA Tasks & Schedule', count: pendingTasksCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Code2 size={22} className="text-cyan-400" />
            <span>DSA Mastery & Spaced Repetition Engine</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            End-to-end progression from Programming Fundamentals to Graph DP & FAANG Hybrid Patterns.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenAddTopicModal('FOUNDATION')}
            className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
            title="Create a custom topic in your DSA tree"
          >
            <Plus size={14} className="text-cyan-400" />
            <span>Add Topic</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectRandomWeak}
            className="text-xs border-indigo-500/30 text-indigo-300"
          >
            <Dices size={14} />
            <span>Random Weak Problem</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingProblem(null);
              setIsProblemModalOpen(true);
            }}
          >
            <Plus size={15} />
            <span>Log Problem</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Active Tab View */}
      {activeTab === 'tree' && (
        <DSATreeViewer
          topics={topics}
          patterns={patterns}
          onDeleteTopic={handleDeleteTopic}
          onOpenAddTopicModal={handleOpenAddTopicModal}
        />
      )}

      {activeTab === 'problems' && (
        <ProblemTable
          problems={problems}
          dsaTasks={dsaTasks}
          onAddProblem={() => {
            setEditingProblem(null);
            setIsProblemModalOpen(true);
          }}
          onEditProblem={(p) => {
            setEditingProblem(p);
            setIsProblemModalOpen(true);
          }}
          onDeleteProblem={handleDeleteProblem}
          onSelectRandomWeak={handleSelectRandomWeak}
          onQuickConfidenceUpdate={(id, conf) => {
            DevTrackStore.updateProblem(id, { confidence: conf });
            reloadData();
          }}
          onAddTaskForProblem={handleAddTaskForProblem}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {activeTab === 'revision' && (
        <RevisionQueue
          problems={problems}
          dsaTasks={dsaTasks}
          onRecordRevision={handleRecordRevision}
          onOpenProblem={(p) => {
            setEditingProblem(p);
            setIsProblemModalOpen(true);
          }}
          onAddTaskForProblem={handleAddTaskForProblem}
          onDeleteTask={handleDeleteTask}
        />
      )}

      {/* DSA Tasks & Schedule Tab */}
      {activeTab === 'tasks' && (
        <div className="space-y-5">
          {/* Quick Add DSA Task Banner */}
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <ListTodo size={16} className="text-cyan-400" />
                <span>Add DSA Practice Task</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {pendingTasksCount} Pending • {dsaTasks.length - pendingTasksCount} Completed
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Task title (e.g., Practice Monotonic Stack, Solve 3 LeetCode Mediums)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateCustomDSATask();
                }}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />

              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent Priority</option>
              </select>

              <input
                type="date"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              />

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreateCustomDSATask}
                disabled={!newTaskTitle.trim()}
                className="bg-cyan-600 hover:bg-cyan-500 whitespace-nowrap text-xs"
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
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode.charAt(0) + mode.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            <span className="text-xs text-slate-400">
              Showing {filteredDsaTasks.length} DSA tasks (synced with Calendar)
            </span>
          </div>

          {/* Task List */}
          {filteredDsaTasks.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
              <p className="text-xs text-slate-500">
                No DSA tasks found for this filter. Use the input above or click &quot;+ Task&quot; on any problem in the Problem Database to schedule tasks!
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredDsaTasks.map((task) => {
                const isCompleted = task.status === 'COMPLETED';
                const isOverdue = task.dueDate && task.dueDate < todayStr && !isCompleted;
                const isDueToday = task.dueDate === todayStr && !isCompleted;

                return (
                  <div
                    key={task.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isCompleted
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleToggleTaskStatus(task)}
                        className="text-slate-400 hover:text-cyan-400 transition-colors flex-shrink-0"
                        title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={18} className="text-cyan-400" />
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
                              {task.tags.slice(0, 3).map((tag, idx) => (
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
                      title="Delete DSA task"
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

      {/* Problem Modal */}
      <ProblemModal
        isOpen={isProblemModalOpen}
        onClose={() => {
          setIsProblemModalOpen(false);
          setEditingProblem(null);
        }}
        onSave={handleSaveProblem}
        problem={editingProblem}
      />

      {/* Topic Modal */}
      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        onSave={handleSaveTopic}
        defaultSection={selectedSectionForNewTopic}
      />
    </div>
  );
};
