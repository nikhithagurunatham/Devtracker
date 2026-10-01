import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  Edit2,
  Award,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { RoadmapDayItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';

interface RoadmapTimelineProps {
  days: RoadmapDayItem[];
  goalTitle: string;
  onUpdateDay: (dayNumber: number, updates: Partial<RoadmapDayItem>) => void;
}

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  days,
  goalTitle,
  onUpdateDay,
}) => {
  const [selectedDay, setSelectedDay] = useState<RoadmapDayItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filterPhase, setFilterPhase] = useState<string>('ALL');

  // Edit form states
  const [editTheme, setEditTheme] = useState('');
  const [editDsa, setEditDsa] = useState('');
  const [editWeb, setEditWeb] = useState('');
  const [editCs, setEditCs] = useState('');
  const [editProjects, setEditProjects] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editHours, setEditHours] = useState('5.0');

  const currentDayNumber = days.find((d) => !d.isCompleted)?.dayNumber || 1;
  const totalDays = 100;
  const completedDays = days.filter((d) => d.isCompleted).length;
  const daysRemaining = totalDays - completedDays;
  const completionPercentage = Math.round((completedDays / totalDays) * 100);

  const handleOpenEdit = (day: RoadmapDayItem) => {
    setSelectedDay(day);
    setEditTheme(day.theme);
    setEditDsa(day.dsaFocus || '');
    setEditWeb(day.webDevFocus || '');
    setEditCs(day.csFocus || '');
    setEditProjects(day.projectsFocus || '');
    setEditNotes(day.notes || '');
    setEditHours(day.targetHours.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveDay = () => {
    if (!selectedDay) return;
    onUpdateDay(selectedDay.dayNumber, {
      theme: editTheme,
      dsaFocus: editDsa || undefined,
      webDevFocus: editWeb || undefined,
      csFocus: editCs || undefined,
      projectsFocus: editProjects || undefined,
      notes: editNotes || undefined,
      targetHours: parseFloat(editHours) || 5.0,
    });
    setIsEditModalOpen(false);
  };

  const handleToggleComplete = (day: RoadmapDayItem) => {
    onUpdateDay(day.dayNumber, {
      isCompleted: !day.isCompleted,
      completedAt: !day.isCompleted ? new Date().toISOString() : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Goal</span>
          <span className="text-sm md:text-base font-bold text-white mt-1 block truncate">
            {goalTitle}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Current Milestone</span>
          <span className="text-base md:text-lg font-bold text-indigo-400 mt-1 block font-mono">
            Day {currentDayNumber} / {totalDays}
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Days Completed</span>
          <span className="text-base md:text-lg font-bold text-emerald-400 mt-1 block font-mono">
            {completedDays} Days ({completionPercentage}%)
          </span>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 block">Days Remaining</span>
          <span className="text-base md:text-lg font-bold text-amber-400 mt-1 block font-mono">
            {daysRemaining} Days
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
        <div className="flex justify-between text-xs text-slate-400">
          <span>100-Day Timeline Completion</span>
          <span className="font-mono text-indigo-400 font-semibold">{completionPercentage}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${Math.max(5, completionPercentage)}%` }}
          />
        </div>
      </div>

      {/* 100-Day Grid Preview Bar (Visual miniature map) */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/50 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>100-Day Micro Matrix</span>
          <span className="text-[11px] text-slate-500 font-mono">
            Current Position: Day {currentDayNumber}
          </span>
        </h4>
        <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((num) => {
            const isDone = num < currentDayNumber;
            const isToday = num === currentDayNumber;
            return (
              <div
                key={num}
                className={`h-5 text-[10px] flex items-center justify-center rounded font-mono transition-all ${
                  isToday
                    ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400'
                    : isDone
                    ? 'bg-emerald-600/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-950 text-slate-600 border border-slate-800'
                }`}
                title={`Day ${num}${isToday ? ' (Today)' : isDone ? ' (Completed)' : ''}`}
              >
                {num}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Milestone Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white tracking-tight">
          Milestone Days & Curriculum
        </h3>

        <div className="space-y-3">
          {days.map((day) => {
            const isCurrent = day.dayNumber === currentDayNumber;

            return (
              <div
                key={day.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-indigo-950/20 border-indigo-500/60 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30'
                    : day.isCompleted
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-75'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(day)}
                      className="cursor-pointer"
                      title={day.isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      <CheckCircle2
                        size={20}
                        className={
                          day.isCompleted
                            ? 'text-emerald-500 fill-emerald-500/20'
                            : 'text-slate-600 hover:text-slate-400'
                        }
                      />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-indigo-400">
                          Day {day.dayNumber}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold tracking-wider uppercase">
                            TODAY
                          </span>
                        )}
                        <span className="text-xs text-slate-400 font-medium">
                          {day.phaseTitle}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-0.5">{day.theme}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Clock size={12} />
                      <span>{day.targetHours}h study</span>
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleOpenEdit(day)}
                      className="text-xs !py-1"
                    >
                      <Edit2 size={13} />
                      <span>Edit Day</span>
                    </Button>
                  </div>
                </div>

                {/* Day Focus Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-3 text-xs">
                  {day.dsaFocus && (
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-cyan-400 font-semibold block mb-0.5">DSA Focus:</span>
                      <p className="text-slate-300">{day.dsaFocus}</p>
                    </div>
                  )}

                  {day.webDevFocus && (
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-emerald-400 font-semibold block mb-0.5">
                        Web Dev Focus:
                      </span>
                      <p className="text-slate-300">{day.webDevFocus}</p>
                    </div>
                  )}

                  {day.projectsFocus && (
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-violet-400 font-semibold block mb-0.5">Project:</span>
                      <p className="text-slate-300">{day.projectsFocus}</p>
                    </div>
                  )}

                  {day.revisionFocus && (
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-rose-400 font-semibold block mb-0.5">Revision:</span>
                      <p className="text-slate-300">{day.revisionFocus}</p>
                    </div>
                  )}

                  {day.csFocus && (
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-amber-400 font-semibold block mb-0.5">
                        CS Fundamentals:
                      </span>
                      <p className="text-slate-300">{day.csFocus}</p>
                    </div>
                  )}

                  {day.notes && (
                    <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80">
                      <span className="text-indigo-400 font-semibold block mb-0.5">Notes:</span>
                      <p className="text-slate-300 italic">{day.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Day Modal */}
      {selectedDay && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Day ${selectedDay.dayNumber} Curriculum`}
          subtitle={selectedDay.phaseTitle}
          maxWidth="lg"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveDay}>
                Save Day Curriculum
              </Button>
            </>
          }
        >
          <div className="space-y-3.5">
            <Input
              label="Theme / Title"
              value={editTheme}
              onChange={(e) => setEditTheme(e.target.value)}
            />
            <Input
              label="Target Study Hours"
              type="number"
              step="0.5"
              value={editHours}
              onChange={(e) => setEditHours(e.target.value)}
            />
            <Input
              label="DSA Focus"
              value={editDsa}
              onChange={(e) => setEditDsa(e.target.value)}
            />
            <Input
              label="Web Dev Focus"
              value={editWeb}
              onChange={(e) => setEditWeb(e.target.value)}
            />
            <Input
              label="Project Milestone"
              value={editProjects}
              onChange={(e) => setEditProjects(e.target.value)}
            />
            <Input
              label="CS Fundamentals"
              value={editCs}
              onChange={(e) => setEditCs(e.target.value)}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-300">Daily Notes</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
