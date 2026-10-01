import React, { useState } from 'react';
import {
  Flame,
  Plus,
  Check,
  Calendar,
  Award,
  Trash2,
} from 'lucide-react';
import { HabitItem } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

export const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<HabitItem[]>(DevTrackStore.getHabits());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitDesc, setHabitDesc] = useState('');

  const reloadHabits = () => {
    setHabits(DevTrackStore.getHabits());
  };

  const handleToggleHabit = (habitId: string, dateStr: string) => {
    DevTrackStore.toggleHabit(habitId, dateStr);
    reloadHabits();
  };

  const handleCreateHabit = () => {
    if (!habitName.trim()) return;
    DevTrackStore.addHabit(habitName.trim(), habitDesc.trim() || undefined);
    setHabitName('');
    setHabitDesc('');
    setIsAddModalOpen(false);
    reloadHabits();
  };

  const handleDeleteHabit = (id: string) => {
    DevTrackStore.deleteHabit(id);
    reloadHabits();
  };

  // Generate last 7 days (including today)
  const last7Days: { dateStr: string; dayLabel: string; shortDate: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
    const shortDate = `${d.getDate()}/${d.getMonth() + 1}`;
    last7Days.push({ dateStr, dayLabel, shortDate });
  }

  // Generate last 28 days for mini heatmap
  const last28Days: string[] = [];
  for (let i = 27; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last28Days.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Flame size={22} className="text-amber-400" />
            <span>Developer Consistency & Habit Tracker</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Build unshakeable daily routines: study blocks, DSA practice, hydration, and sleep hygiene.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Habits Table / Grid */}
      <div className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden shadow-md">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Habits ({habits.length})
          </span>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>Last 7 Days Completion</span>
          </div>
        </div>

        <div className="divide-y divide-slate-800/80">
          {habits.map((habit) => (
            <div
              key={habit.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
            >
              {/* Habit Details */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <h3 className="font-semibold text-sm text-white">{habit.name}</h3>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                    <Flame size={12} />
                    <span>{habit.currentStreak} day streak</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (Max: {habit.longestStreak}d)
                  </span>
                </div>
                {habit.description && (
                  <p className="text-xs text-slate-400 mt-1">{habit.description}</p>
                )}
              </div>

              {/* 7-Day Quick Toggle Buttons */}
              <div className="flex items-center gap-2 self-start md:self-center">
                {last7Days.map((day) => {
                  const isChecked = !!habit.logs[day.dateStr];
                  const isToday = day.dateStr === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={day.dateStr}
                      onClick={() => handleToggleHabit(habit.id, day.dateStr)}
                      className={`flex flex-col items-center justify-center w-9 h-11 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                          : isToday
                          ? 'bg-slate-950 border-indigo-500 text-indigo-300 hover:border-indigo-400'
                          : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                      title={`${day.dayLabel} (${day.shortDate})`}
                    >
                      <span className="text-[9px] opacity-75">{day.dayLabel}</span>
                      <span className="font-bold text-xs mt-0.5">
                        {isChecked ? <Check size={13} /> : '·'}
                      </span>
                    </button>
                  );
                })}

                <button
                  onClick={() => handleDeleteHabit(habit.id)}
                  className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors ml-2"
                  title="Delete habit"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Habit Consistency Heatmap */}
      <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/40 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Calendar size={14} />
          <span>4-Week Habit Heatmap</span>
        </h3>

        <div className="grid grid-cols-7 sm:grid-cols-14 md:grid-cols-28 gap-1.5">
          {last28Days.map((dateStr) => {
            // Count total habits completed on this date
            const count = habits.filter((h) => h.logs[dateStr]).length;
            const intensity = count === 0 ? 0 : count <= 2 ? 1 : count <= 4 ? 2 : 3;

            const bgColors = [
              'bg-slate-950 border-slate-800',
              'bg-emerald-950/60 border-emerald-800/60 text-emerald-300',
              'bg-emerald-700/70 border-emerald-600 text-white',
              'bg-emerald-500 border-emerald-400 text-slate-950 font-bold',
            ];

            return (
              <div
                key={dateStr}
                className={`h-7 rounded text-[10px] flex items-center justify-center font-mono border transition-all ${bgColors[intensity]}`}
                title={`${dateStr}: ${count} / ${habits.length} habits completed`}
              >
                {count > 0 ? count : ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Habit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Daily Habit"
        subtitle="Establish non-negotiable software engineering preparation habits"
        maxWidth="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateHabit}>
              Save Habit
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Habit Name *"
            placeholder="e.g. Solve 2 DSA problems daily"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            autoFocus
          />
          <Input
            label="Why this matters (Description)"
            placeholder="e.g. Builds pattern recognition for Amazon OA"
            value={habitDesc}
            onChange={(e) => setHabitDesc(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
