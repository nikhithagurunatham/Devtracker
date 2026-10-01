import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon: ActionIcon = Plus,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 md:p-12 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-inner">
        <Icon size={26} />
      </div>
      <h3 className="text-base font-bold text-white mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button
          size="sm"
          onClick={onAction}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
        >
          <ActionIcon size={14} />
          {actionText}
        </Button>
      )}
    </div>
  );
};
