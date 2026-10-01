import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { AIService, ParsedQuickAction } from '@/lib/ai-service';
import { DevTrackStore } from '@/lib/storage';

interface QuickAddTaskInputProps {
  onTaskCreated: (taskData: any) => void;
}

export const QuickAddTaskInput: React.FC<QuickAddTaskInputProps> = ({ onTaskCreated }) => {
  const [input, setInput] = useState('');
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [parsedResult, setParsedResult] = useState<ParsedQuickAction | null>(null);

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const parsed = AIService.parseQuickAction(input);
    setParsedResult(parsed);
    setIsReviewOpen(true);
  };

  const handleConfirmSave = () => {
    if (parsedResult?.tasksToCreate && parsedResult.tasksToCreate.length > 0) {
      parsedResult.tasksToCreate.forEach((t) => onTaskCreated(t));
    }
    if (parsedResult?.moodScore) {
      const todayStr = new Date().toISOString().split('T')[0];
      DevTrackStore.logMood({
        date: todayStr,
        score: parsedResult.moodScore,
        energy: parsedResult.moodScore,
        note: `Logged via Quick Add: "${input}"`,
      });
      window.dispatchEvent(new CustomEvent('devtrack_store_updated', { detail: { key: 'mood_logs' } }));
    }
    setIsReviewOpen(false);
    setInput('');
    setParsedResult(null);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleParse} className="relative flex items-center">
        <div className="absolute left-3.5 text-indigo-400">
          <Sparkles size={16} />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Quick Add with AI: "Do 2 binary search problems tomorrow" or "Study React for 45 mins"'
          className="w-full pl-10 pr-24 py-2.5 bg-slate-900/90 border border-slate-700/80 hover:border-indigo-500/50 focus:border-indigo-500 rounded-xl text-sm text-slate-100 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
        <div className="absolute right-2">
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!input.trim()}
            className="rounded-lg !py-1 text-xs"
          >
            <span>Parse</span>
            <ArrowRight size={13} />
          </Button>
        </div>
      </form>

      {/* Review Modal */}
      {parsedResult && (
        <Modal
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          title="Review AI-Parsed Task"
          subtitle="Review structured task attributes before adding to your board"
          maxWidth="md"
          footer={
            <>
              <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>
                Cancel
              </Button>
              <Button variant="success" onClick={handleConfirmSave}>
                <Check size={14} />
                <span>Confirm & Add Task</span>
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-xs text-indigo-300">
              <span className="font-semibold text-indigo-200">Raw Input: </span>
              &ldquo;{input}&rdquo;
            </div>

            {parsedResult.tasksToCreate?.map((task, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-medium text-white">{task.title}</h4>
                  <Badge type={task.priority}>{task.priority}</Badge>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-500">Category:</span>
                    <Badge type={task.category}>{task.category}</Badge>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    <span className="text-slate-500">Due:</span>
                    <span className="text-slate-200 font-mono">{task.dueDate}</span>
                  </div>
                  {task.estimatedTime && (
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      <span className="text-slate-500">Est:</span>
                      <span className="text-slate-200">{task.estimatedTime} min</span>
                    </div>
                  )}
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {task.tags.map((t, tidx) => (
                      <span
                        key={tidx}
                        className="text-[11px] px-2 py-0.5 bg-slate-900 text-slate-400 rounded-md border border-slate-800"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {parsedResult.moodScore && (
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Also logging Mood:</span>
                <span className="font-semibold text-amber-400">{parsedResult.moodScore} / 5</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
