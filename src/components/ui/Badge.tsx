import React from 'react';
import { TaskCategory, TaskPriority, TaskStatus, Difficulty, ProblemStatus, JobStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'category'
    | 'priority'
    | 'status'
    | 'difficulty'
    | 'outline';
  type?: TaskCategory | TaskPriority | TaskStatus | Difficulty | ProblemStatus | JobStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  type,
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  // Category Colors
  if (type === 'DSA') colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
  else if (type === 'WEB_DEV') colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  else if (type === 'PROJECT') colorClasses = 'bg-violet-500/10 text-violet-400 border-violet-500/30';
  else if (type === 'CS') colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  else if (type === 'JOB') colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  else if (type === 'REVISION') colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  else if (type === 'PERSONAL') colorClasses = 'bg-slate-500/10 text-slate-400 border-slate-500/30';

  // Priority Colors
  else if (type === 'LOW') colorClasses = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  else if (type === 'MEDIUM') colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
  else if (type === 'HIGH') colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  else if (type === 'URGENT') colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold';

  // Difficulty Colors
  else if (type === 'EASY') colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  else if (type === 'MEDIUM') colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  else if (type === 'HARD') colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30 font-semibold';

  // Problem Status Colors
  else if (type === 'MASTERED') colorClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
  else if (type === 'SOLVED') colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  else if (type === 'HINT_USED') colorClasses = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  else if (type === 'ATTEMPTED') colorClasses = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
  else if (type === 'NOT_STARTED') colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';

  // Job Status Colors
  else if (type === 'OFFER') colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 font-semibold';
  else if (type === 'INTERVIEW') colorClasses = 'bg-indigo-500/15 text-indigo-400 border-indigo-500/40';
  else if (type === 'OA') colorClasses = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40';
  else if (type === 'APPLIED') colorClasses = 'bg-blue-500/15 text-blue-400 border-blue-500/40';
  else if (type === 'WISHLIST') colorClasses = 'bg-slate-700/30 text-slate-400 border-slate-700';
  else if (type === 'REJECTED') colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${sizeClasses} ${colorClasses} ${className}`}
    >
      {children}
    </span>
  );
};
