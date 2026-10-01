'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
        onClick={() => !isLoading && onClose()}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-black/80 animate-in zoom-in-95 duration-150 space-y-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}
          >
            {isDestructive ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-base font-bold text-white tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800/80">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs px-4"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            className={`text-xs px-4 font-semibold ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
            }`}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};
