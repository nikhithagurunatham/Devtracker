import React, { useState } from 'react';
import { CheckSquare, Trash2, Flag, Folder, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TaskPriority, TaskCategory } from '@/types';
import { Modal } from '@/components/ui/Modal';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkComplete: () => void;
  onBulkDelete: () => void;
  onBulkChangePriority: (priority: TaskPriority) => void;
  onBulkChangeCategory: (category: TaskCategory) => void;
  onBulkChangeDueDate: (date: string) => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkComplete,
  onBulkDelete,
  onBulkChangePriority,
  onBulkChangeCategory,
  onBulkChangeDueDate,
}) => {
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl px-5 py-3 flex items-center gap-3 animate-fade-in text-sm text-white">
        <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
          <span className="font-semibold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full text-xs">
            {selectedCount}
          </span>
          <span className="text-slate-300 text-xs">selected</span>
        </div>

        {/* Complete */}
        <Button
          size="sm"
          variant="outline"
          onClick={onBulkComplete}
          className="text-xs"
          title="Mark selected tasks complete"
        >
          <CheckSquare size={13} className="text-emerald-400" />
          <span>Complete</span>
        </Button>

        {/* Change Priority */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowPriorityMenu(!showPriorityMenu)}
            className="text-xs"
          >
            <Flag size={13} className="text-amber-400" />
            <span>Priority</span>
          </Button>
          {showPriorityMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-32 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 text-xs z-50">
              {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    onBulkChangePriority(p);
                    setShowPriorityMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Change Category */}
        <div className="relative">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className="text-xs"
          >
            <Folder size={13} className="text-cyan-400" />
            <span>Category</span>
          </Button>
          {showCategoryMenu && (
            <div className="absolute bottom-full mb-2 left-0 w-36 bg-slate-900 border border-slate-800 rounded-lg shadow-xl py-1 text-xs z-50">
              {(['DSA', 'WEB_DEV', 'PROJECT', 'CS', 'JOB', 'REVISION', 'PERSONAL'] as TaskCategory[]).map(
                (c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onBulkChangeCategory(c);
                      setShowCategoryMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-slate-300 hover:text-white"
                  >
                    {c}
                  </button>
                )
              )}
            </div>
          )}
        </div>

        {/* Change Due Date */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDateModal(true)}
          className="text-xs"
        >
          <Calendar size={13} className="text-blue-400" />
          <span>Due Date</span>
        </Button>

        {/* Delete */}
        <Button
          size="sm"
          variant="danger"
          onClick={() => setShowDeleteModal(true)}
          className="text-xs"
        >
          <Trash2 size={13} />
          <span>Delete</span>
        </Button>

        {/* Dismiss selection */}
        <button
          onClick={onClearSelection}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
          title="Clear selection"
        >
          <X size={15} />
        </button>
      </div>

      {/* Due Date Modal */}
      <Modal
        isOpen={showDateModal}
        onClose={() => setShowDateModal(false)}
        title="Set Due Date for Selected Tasks"
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                onBulkChangeDueDate(newDueDate);
                setShowDateModal(false);
              }}
            >
              Update Due Date
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="text-xs text-slate-400">New Due Date</label>
          <input
            type="date"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-white text-sm"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={`Delete ${selectedCount} Tasks?`}
        maxWidth="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onBulkDelete();
                setShowDeleteModal(false);
              }}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-300">
          Are you sure you want to permanently delete these {selectedCount} selected tasks? This action
          cannot be reversed.
        </p>
      </Modal>
    </>
  );
};
