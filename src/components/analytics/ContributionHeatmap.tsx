import React from 'react';

interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number; // activity score
  problemsCount: number;
  studyHours: number;
  tasksCount: number;
}

export const ContributionHeatmap: React.FC = () => {
  // Generate past 16 weeks (112 days) of realistic activity
  const weeksCount = 16;
  const daysTotal = weeksCount * 7;
  const days: ContributionDay[] = [];

  const today = new Date();

  for (let i = daysTotal - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Seed realistic activity weights: higher on recent days
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const baseVal = i < 30 ? 4 : i < 60 ? 3 : 2;

    const prob = isWeekend ? Math.floor(Math.random() * 4) + 1 : Math.floor(Math.random() * 3) + 1;
    const hours = isWeekend ? 6.0 : 4.5;
    const tasks = isWeekend ? 5 : 4;
    const count = prob + Math.round(hours) + tasks;

    days.push({
      date: dateStr,
      count,
      problemsCount: prob,
      studyHours: hours,
      tasksCount: tasks,
    });
  }

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-slate-950 border-slate-800/80';
    if (count <= 4) return 'bg-emerald-950/60 border-emerald-800/40';
    if (count <= 8) return 'bg-emerald-800/70 border-emerald-600/50';
    if (count <= 11) return 'bg-emerald-600 border-emerald-500';
    return 'bg-emerald-400 border-emerald-300 shadow-sm shadow-emerald-400/20';
  };

  return (
    <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-md">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Developer Contribution & Deep Work Heatmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            16-week matrix combining DSA solves, study hours, and completed tasks.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <span>Less</span>
          <span className="w-2.5 h-2.5 rounded-sm bg-slate-950 border border-slate-800" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950/60 border border-emerald-800/40" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-800/70 border border-emerald-600/50" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 border border-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-emerald-300" />
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="grid grid-flow-col grid-rows-7 gap-1.5 min-w-[700px]">
          {days.map((d) => (
            <div
              key={d.date}
              className={`w-3.5 h-3.5 rounded-sm border transition-all cursor-pointer hover:scale-125 hover:z-10 ${getIntensityClass(
                d.count
              )}`}
              title={`${d.date}: ${d.problemsCount} problems solved, ${d.studyHours}h studied, ${d.tasksCount} tasks completed`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
