import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  MoreVertical,
  Clock,
  Calendar,
  Copy,
  Edit2,
  Trash2,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface TaskItemProps {
  task: Task;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected = false,
  onSelect,
  onToggleComplete,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const isCompleted = task.status === 'COMPLETED';
  const isOverdue =
    !isCompleted &&
    task.dueDate &&
    task.dueDate < new Date().toISOString().split('T')[0];

  return (
    <>
      <div
        className={`group relative flex items-center justify-between p-3.5 bg-slate-900/70 hover:bg-slate-800/80 border rounded-xl transition-all duration-150 ${
          isCompleted
            ? 'border-slate-800/50 opacity-60'
            : isOverdue
            ? 'border-rose-500/40 bg-rose-950/10'
            : 'border-slate-800 hover:border-slate-700'
        } ${isSelected ? 'ring-1 ring-indigo-500 bg-indigo-950/20' : ''}`}
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Multi-select Checkbox */}
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(task.id, e.target.checked)}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          )}

          {/* Complete Toggle Button */}
          <button
            onClick={() => onToggleComplete(task.id)}
            className="text-slate-400 hover:text-emerald-400 transition-colors focus:outline-none flex-shrink-0 cursor-pointer"
            title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
          >
            {isCompleted ? (
              <CheckCircle2 size={19} className="text-emerald-500 fill-emerald-500/20" />
            ) : (
              <Circle size={19} className="hover:text-emerald-400" />
            )}
          </button>

          {/* Task Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-sm font-medium transition-colors ${
                  isCompleted
                    ? 'line-through text-slate-500'
                    : 'text-slate-200 group-hover:text-white'
                }`}
              >
                {task.title}
              </span>

              {/* Priority & Category Badges */}
              <Badge type={task.category}>{task.category}</Badge>
              <Badge type={task.priority}>{task.priority}</Badge>

              {task.recurring && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {task.recurring}
                </span>
              )}
            </div>

            {/* Description if present */}
            {task.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>
            )}

            {/* Metadata Footer: Due Date, Time, Estimated, Tags */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 ${
                    isOverdue ? 'text-rose-400 font-medium' : 'text-slate-400'
                  }`}
                >
                  <Calendar size={12} />
                  <span>
                    {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
                  </span>
                  {isOverdue && <span className="text-[10px] uppercase font-bold">(Overdue)</span>}
                </div>
              )}

              {task.estimatedTime && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock size={12} />
                  <span>{task.estimatedTime}m</span>
                </div>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="flex items-center gap-1 text-slate-400">
                  <Tag size={11} />
                  <span className="truncate max-w-[150px]">{task.tags.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons & Context Menu */}
        <div className="flex items-center gap-1 relative ml-2">
          {/* Quick Edit */}
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Edit task"
          >
            <Edit2 size={14} />
          </button>

          {/* Quick Duplicate */}
          <button
            onClick={() => onDuplicate(task.id)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Duplicate task"
          >
            <Copy size={14} />
          </button>

          {/* Quick Delete */}
          <button
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            title="Delete task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Required Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete Task?"
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onDelete(task.id);
                setIsDeleteConfirmOpen(false);
              }}
            >
              Delete Task
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-sm text-slate-200">
              Are you sure you want to permanently delete:
            </p>
            <p className="text-sm font-semibold text-white mt-1">&ldquo;{task.title}&rdquo;</p>
            <p className="text-xs text-slate-400 mt-2">This action cannot be undone.</p>
          </div>
        </div>
      </Modal>
    </>
  );
};
