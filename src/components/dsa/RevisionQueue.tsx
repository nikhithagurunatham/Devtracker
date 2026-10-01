import React, { useState } from 'react';
import {
  Calendar,
  Sparkles,
  ExternalLink,
  CheckCircle,
  Clock,
  ArrowRight,
  CalendarCheck,
  CalendarPlus,
  X,
} from 'lucide-react';
import { Problem, Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { calculateNextRevision } from '@/lib/spaced-repetition';

interface RevisionQueueProps {
  problems: Problem[];
  dsaTasks?: Task[];
  onRecordRevision: (problemId: string, confidence: number) => void;
  onOpenProblem: (problem: Problem) => void;
  onAddTaskForProblem?: (problem: Problem) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const RevisionQueue: React.FC<RevisionQueueProps> = ({
  problems,
  dsaTasks = [],
  onRecordRevision,
  onOpenProblem,
  onAddTaskForProblem,
  onDeleteTask,
}) => {
  const [activeRevisionProblem, setActiveRevisionProblem] = useState<Problem | null>(null);
  const [selectedConfidence, setSelectedConfidence] = useState<number>(4);

  const todayStr = new Date().toISOString().split('T')[0];
  const dueProblems = problems.filter(
    (p) => p.nextRevisionAt && p.nextRevisionAt <= todayStr
  );
  const upcomingProblems = problems.filter(
    (p) => p.nextRevisionAt && p.nextRevisionAt > todayStr
  );

  const handleConfirmRevision = () => {
    if (!activeRevisionProblem) return;
    onRecordRevision(activeRevisionProblem.id, selectedConfidence);
    setActiveRevisionProblem(null);
  };

  const previewCalc = activeRevisionProblem
    ? calculateNextRevision(selectedConfidence, activeRevisionProblem.attemptsCount)
    : null;

  return (
    <div className="space-y-6">
      {/* Revision Due Today Banner / Section */}
      <div className="p-5 bg-gradient-to-r from-rose-950/30 via-slate-900 to-indigo-950/30 border border-rose-500/30 rounded-2xl shadow-lg">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-base font-bold text-white tracking-tight">
                REVISION DUE TODAY ({dueProblems.length})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Spaced Repetition Engine (SM-2) flagged these problems for memory retention reinforcement.
            </p>
          </div>

          <div className="text-xs font-mono text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/30">
            {dueProblems.length === 0
              ? '✅ All revisions up to date!'
              : `${dueProblems.length} pending revision`}
          </div>
        </div>

        {/* Due Problems List */}
        {dueProblems.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {dueProblems.map((prob) => (
              <div
                key={prob.id}
                className="p-3.5 bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 rounded-xl flex items-center justify-between gap-3 transition-all"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-slate-100 truncate">
                      {prob.name}
                    </span>
                    <Badge type={prob.difficulty}>{prob.difficulty}</Badge>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span>{prob.topicName}</span>
                    <span>•</span>
                    <span className="text-rose-400 font-mono">
                      Current Conf: {prob.confidence}/5
                    </span>
                  </div>

                  {prob.mistakes && (
                    <div className="text-[10px] text-rose-300/80 bg-rose-950/20 px-2 py-0.5 rounded border border-rose-900/30 mt-1.5 line-clamp-1">
                      ⚠️ Pitfall: {prob.mistakes}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {(() => {
                    const associatedTask = dsaTasks.find((t) =>
                      t.title.toLowerCase().includes(prob.name.toLowerCase())
                    );
                    if (associatedTask) {
                      return (
                        <div className="flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/60 rounded px-2 py-1 text-xs text-cyan-300">
                          <CalendarCheck size={12} className="text-cyan-400" />
                          <span className="font-mono text-[10px]">In Tasks</span>
                          {onDeleteTask && (
                            <button
                              type="button"
                              onClick={() => onDeleteTask(associatedTask.id)}
                              className="text-slate-400 hover:text-rose-400 ml-1 p-0.5"
                              title="Delete scheduled task"
                            >
                              <X size={10} />
                            </button>
                          )}
                        </div>
                      );
                    }
                    if (onAddTaskForProblem) {
                      return (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAddTaskForProblem(prob)}
                          className="text-xs !py-1 !px-2 border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
                          title="Schedule as task on calendar"
                        >
                          <CalendarPlus size={12} />
                          <span>+ Task</span>
                        </Button>
                      );
                    }
                    return null;
                  })()}

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setActiveRevisionProblem(prob)}
                    className="text-xs !py-1 !px-2.5 bg-rose-600 hover:bg-rose-500"
                  >
                    <span>Log Solve</span>
                    <ArrowRight size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Revisions Queue */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 p-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
          <Calendar size={14} />
          <span>Upcoming Spaced Repetition Schedule</span>
        </h4>

        <div className="space-y-2">
          {upcomingProblems.length === 0 ? (
            <p className="text-xs text-slate-500 py-3">No upcoming revisions scheduled yet.</p>
          ) : (
            upcomingProblems.map((p) => {
              const associatedTask = dsaTasks.find((t) =>
                t.title.toLowerCase().includes(p.name.toLowerCase())
              );
              return (
                <div
                  key={p.id}
                  className="p-3 bg-slate-900/70 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-slate-200">{p.name}</span>
                    <Badge type={p.difficulty}>{p.difficulty}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">Due: {p.nextRevisionAt}</span>

                    {associatedTask ? (
                      <div className="flex items-center gap-1 bg-cyan-950/60 border border-cyan-800/60 rounded px-1.5 py-0.5 text-[10px] text-cyan-300">
                        <CalendarCheck size={11} className="text-cyan-400" />
                        <span>Scheduled</span>
                        {onDeleteTask && (
                          <button
                            type="button"
                            onClick={() => onDeleteTask(associatedTask.id)}
                            className="text-slate-400 hover:text-rose-400 ml-0.5"
                            title="Delete task"
                          >
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    ) : onAddTaskForProblem ? (
                      <button
                        type="button"
                        onClick={() => onAddTaskForProblem(p)}
                        className="px-2 py-0.5 text-[11px] rounded border border-cyan-500/30 text-cyan-300 hover:bg-cyan-950/40 transition-colors flex items-center gap-1"
                        title="Schedule as task"
                      >
                        <CalendarPlus size={11} />
                        <span>Schedule</span>
                      </button>
                    ) : null}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onOpenProblem(p)}
                      className="text-xs !py-0.5"
                    >
                      View
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Spaced Repetition Feedback Modal */}
      {activeRevisionProblem && (
        <Modal
          isOpen={!!activeRevisionProblem}
          onClose={() => setActiveRevisionProblem(null)}
          title={`Completed Revision: ${activeRevisionProblem.name}`}
          subtitle="How confident are you with this problem right now?"
          maxWidth="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setActiveRevisionProblem(null)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleConfirmRevision}>
                <CheckCircle size={14} />
                <span>Save Revision Interval</span>
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs space-y-1">
              <div className="text-slate-400">Previous confidence: <span className="font-bold text-white">{activeRevisionProblem.confidence}/5</span></div>
              <div className="text-slate-400">Total historical attempts: <span className="font-mono text-white">{activeRevisionProblem.attemptsCount}</span></div>
            </div>

            {/* 1-5 Confidence Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                Rate your solving confidence (SM-2 Spaced Repetition Trigger):
              </label>

              {[
                { score: 1, label: "1 — Don't understand", days: 'Schedule for tomorrow (+1 day)' },
                { score: 2, label: '2 — Struggled', days: 'Schedule in 2 days (+2 days)' },
                { score: 3, label: '3 — Can solve with hints', days: 'Schedule in 4 days (+4 days)' },
                { score: 4, label: '4 — Can solve independently', days: 'Schedule in 7 days (+7 days)' },
                { score: 5, label: '5 — Can solve quickly', days: 'Schedule in 14 days (+14 days)' },
              ].map((opt) => (
                <button
                  key={opt.score}
                  type="button"
                  onClick={() => setSelectedConfidence(opt.score)}
                  className={`w-full p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                    selectedConfidence === opt.score
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-[11px] text-indigo-400 font-mono">{opt.days}</span>
                </button>
              ))}
            </div>

            {previewCalc && (
              <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                ✨ Next scheduled revision:{' '}
                <span className="font-mono font-bold">{previewCalc.nextRevisionDate}</span> (+
                {previewCalc.nextIntervalDays} days) with ease factor {previewCalc.newEaseFactor}.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
