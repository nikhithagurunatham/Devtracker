import React, { useState, useEffect } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, ProjectItem, RoadmapDayItem } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DevTrackStore } from '@/lib/storage';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: any) => void;
  initialTask?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('DSA');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<string>('45');
  const [tagsInput, setTagsInput] = useState('');
  const [recurring, setRecurring] = useState<string>('NONE');
  const [projectId, setProjectId] = useState('');
  const [roadmapDayId, setRoadmapDayId] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [availableProjects, setAvailableProjects] = useState<ProjectItem[]>([]);
  const [availableRoadmapDays, setAvailableRoadmapDays] = useState<RoadmapDayItem[]>([]);

  useEffect(() => {
    setAvailableProjects(DevTrackStore.getProjects());
    setAvailableRoadmapDays(DevTrackStore.getRoadmapDays());

    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setPriority(initialTask.priority);
      setStatus(initialTask.status);
      setDueDate(initialTask.dueDate || '');
      setDueTime(initialTask.dueTime || '');
      setEstimatedTime(initialTask.estimatedTime?.toString() || '');
      setTagsInput(initialTask.tags.join(', '));
      setRecurring(initialTask.recurring || 'NONE');
      setProjectId(initialTask.projectId || '');
      setRoadmapDayId(initialTask.roadmapDayId || '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('DSA');
      setPriority('MEDIUM');
      setStatus('TODO');
      setDueDate(new Date().toISOString().split('T')[0]);
      setDueTime('12:00');
      setEstimatedTime('45');
      setTagsInput('');
      setRecurring('NONE');
      setProjectId('');
      setRoadmapDayId('');
    }
    setErrors({});
  }, [initialTask, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Task title is required' });
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : undefined,
      tags,
      recurring: recurring !== 'NONE' ? recurring : undefined,
      projectId: projectId || undefined,
      roadmapDayId: roadmapDayId || undefined,
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'Edit Task' : 'Create New Task'}
      subtitle="Organize your daily developer prep, DSA, projects, and ATS applications"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {initialTask ? 'Save Changes' : 'Create Task'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <Input
          label="Task Title *"
          placeholder="e.g. Solve 2 Binary Search problems"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          autoFocus
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">Description</label>
          <textarea
            rows={2}
            className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Key notes, problem numbers, or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Category</label>
            <select
              className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
            >
              <option value="DSA">DSA</option>
              <option value="WEB_DEV">Web Development</option>
              <option value="PROJECT">Project</option>
              <option value="CS">CS Fundamentals</option>
              <option value="JOB">Job Application</option>
              <option value="REVISION">Revision</option>
              <option value="PERSONAL">Personal Habit</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Priority</label>
            <select
              className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent ⚡</option>
            </select>
          </div>
        </div>

        {/* Due Date & Due Time & Estimated Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input
            label="Due Time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
          <Input
            label="Est. Time (mins)"
            type="number"
            min="5"
            step="5"
            value={estimatedTime}
            onChange={(e) => setEstimatedTime(e.target.value)}
          />
        </div>

        {/* Status & Recurring Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Status</label>
            <select
              className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Recurring</label>
            <select
              className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={recurring}
              onChange={(e) => setRecurring(e.target.value)}
            >
              <option value="NONE">None (One-time)</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
            </select>
          </div>
        </div>

        {/* Optional Project & Optional Roadmap Day */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Optional Project</label>
            <select
              className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value="">No Project (Standalone Task)</option>
              {availableProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Optional Roadmap Day</label>
            <select
              className="px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              value={roadmapDayId}
              onChange={(e) => setRoadmapDayId(e.target.value)}
            >
              <option value="">No Roadmap Day</option>
              {availableRoadmapDays.slice(0, 30).map((d) => (
                <option key={d.id} value={d.id}>
                  Day {d.dayNumber}: {d.theme}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <Input
          label="Tags (comma-separated)"
          placeholder="BinarySearch, LeetCode, AmazonTag"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />
      </form>
    </Modal>
  );
};
