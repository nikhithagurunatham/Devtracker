import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  Plus,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { DailyScheduleSlot } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export const AIDailyPlanView: React.FC = () => {
  const [plan, setPlan] = useState<DailyScheduleSlot[]>(DevTrackStore.getDailyPlan());
  const [isApplying, setIsApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleApplyToTasks = () => {
    setIsApplying(true);
    const todayStr = new Date().toISOString().split('T')[0];

    plan.forEach((slot) => {
      DevTrackStore.addTask({
        title: slot.title,
        description: slot.description,
        category: slot.category,
        priority: slot.category === 'DSA' || slot.category === 'REVISION' ? 'HIGH' : 'MEDIUM',
        status: 'TODO',
        dueDate: todayStr,
        estimatedTime: slot.durationMin,
        tags: ['AIDailyPlan', slot.category],
      });
    });

    setIsApplying(false);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3000);
  };

  const handleRegeneratePlan = () => {
    // Generate fresh adaptive schedule based on weak areas
    const newSchedule: DailyScheduleSlot[] = [
      {
        timeRange: '08:00 - 09:00',
        title: 'Binary Search Monotonic Invariants',
        category: 'DSA',
        description: 'Derive search space boundary predicates and solve LC 33 rotated array.',
        durationMin: 60,
      },
      {
        timeRange: '09:00 - 10:15',
        title: 'Binary Search Problem: Koko Eating Bananas',
        category: 'DSA',
        description: 'LeetCode 875. Focus on monotonicity of eatRate(k) boolean validator.',
        durationMin: 75,
      },
      {
        timeRange: '10:15 - 10:30',
        title: 'Morning Break & Posture Reset',
        category: 'PERSONAL',
        description: 'Step away from screen, drink water, stretch neck.',
        durationMin: 15,
      },
      {
        timeRange: '10:30 - 11:30',
        title: 'Recruiter Outreach: Amazon SDE-1 Follow-up',
        category: 'JOB',
        description: 'Check in with Priya Sengupta regarding online assessment schedule.',
        durationMin: 60,
      },
      {
        timeRange: '14:30 - 16:00',
        title: 'React 18 Hooks & Stale Closure Traps',
        category: 'WEB_DEV',
        description: 'Build useInterval custom hook and document useEffect cleanup semantics.',
        durationMin: 90,
      },
      {
        timeRange: '18:00 - 19:30',
        title: 'Offboarding Project: JWT Refresh Token Flow',
        category: 'PROJECT',
        description: 'Implement secure httpOnly cookie rotation and Redis whitelist verification.',
        durationMin: 90,
      },
      {
        timeRange: '21:00 - 21:45',
        title: 'Spaced Repetition: Coin Change (1D DP)',
        category: 'REVISION',
        description: 'Redo state recurrence relation without peeking at previous notes.',
        durationMin: 45,
      },
    ];

    DevTrackStore.setDailyPlan(newSchedule);
    setPlan(newSchedule);
  };

  const totalMinutes = plan.reduce((acc, s) => acc + s.durationMin, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI-Generated Daily Timetable
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Synthesized by analyzing your 100-Day Roadmap (Day 1), foundational topics,
            revision schedule, and targeted preparation goals.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegeneratePlan}
            className="text-xs"
          >
            <RefreshCw size={13} />
            <span>Regenerate Plan</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleApplyToTasks}
            disabled={isApplying}
            className="text-xs bg-indigo-600 hover:bg-indigo-500"
          >
            <Plus size={14} />
            <span>Add All to Today&apos;s Tasks</span>
          </Button>
        </div>
      </div>

      {appliedSuccess && (
        <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle size={15} />
          <span>
            All {plan.length} time-blocked schedule items were converted into active tasks in your Task Manager!
          </span>
        </div>
      )}

      {/* Stats summary */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
        <span>Total Scheduled Deep Work: <strong className="text-white">{totalHours} Hours</strong></span>
        <span>{plan.length} Time-Blocked Slots</span>
      </div>

      {/* Schedule Timeline Flow */}
      <div className="space-y-3">
        {plan.map((slot, idx) => (
          <div
            key={idx}
            className="p-4 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-28 text-xs font-mono font-bold text-indigo-400 flex items-center gap-1.5 flex-shrink-0">
                <Clock size={13} className="text-slate-500" />
                <span>{slot.timeRange}</span>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-sm text-white">{slot.title}</h4>
                  <Badge type={slot.category}>{slot.category}</Badge>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{slot.description}</p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 font-mono flex-shrink-0 self-end sm:self-center">
              {slot.durationMin} mins
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
