import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 rounded-xl ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-5 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-7 w-14 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="w-5 h-5 rounded-md shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 4,
  cols = 5,
}) => {
  return (
    <div className="w-full border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-900/40">
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-800/60">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 ${c === 0 ? 'w-1/4' : 'w-1/6'}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
