import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AIService, ParsedQuickAction } from '@/lib/ai-service';
import { DevTrackStore } from '@/lib/storage';

interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const QuickActionModal: React.FC<QuickActionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<ParsedQuickAction | null>(null);
  const [isApplied, setIsApplied] = useState(false);

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const res = AIService.parseQuickAction(input);
    setParsed(res);
  };

  const handleApplyAll = async () => {
    if (!parsed) return;

    // 1. Create tasks if parsed
    if (parsed.tasksToCreate && parsed.tasksToCreate.length > 0) {
      for (const t of parsed.tasksToCreate) {
        DevTrackStore.addTask({
          ...t,
          status: 'TODO',
        });
        try {
          await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...t, status: 'TODO' }),
          });
        } catch (e) {}
      }
    }

    // 2. Log mood if parsed
    if (parsed.moodScore) {
      DevTrackStore.logMood({
        date: new Date().toISOString().split('T')[0],
        score: parsed.moodScore,
        note: `Logged via Quick Action: "${input}"`,
      });
      try {
        await fetch('/api/mood', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            score: parsed.moodScore,
            note: `Logged via Quick Action: "${input}"`,
          }),
        });
      } catch (e) {}
    }

    // 3. Log job application if parsed
    if (parsed.appliedCompany) {
      const jobData = {
        company: parsed.appliedCompany,
        role: parsed.appliedRole || 'Software Engineer',
        location: 'Bangalore / Remote',
        applicationDate: new Date().toISOString().split('T')[0],
        source: 'Quick Action',
        status: 'APPLIED' as const,
      };
      DevTrackStore.addJobApplication(jobData);
      try {
        await fetch('/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jobData),
        });
      } catch (e) {}
    }

    // 4. Log study session for web dev or dsa if time was specified
    if (parsed.webDevMinutes) {
      const sessionData = {
        startTime: new Date().toISOString(),
        durationMin: parsed.webDevMinutes,
        topic: parsed.webDevTopicName || 'React Web Dev',
        category: 'WEB_DEV' as const,
        productivity: 4,
      };
      DevTrackStore.addStudySession(sessionData);
      try {
        await fetch('/api/study/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData),
        });
      } catch (e) {}
    }

    setIsApplied(true);
    setTimeout(() => {
      setIsApplied(false);
      setParsed(null);
      setInput('');
      onSuccess();
      onClose();
    }, 1000);
  };

  const sampleInputs = [
    'Finished 2 medium binary search problems, studied React useEffect for 45 minutes, mood 4',
    'Applied to Amazon SDE-1 today',
    'Revise Coin Change and Two Sum tomorrow for 1 hour',
    'Worked on Offboarding project auth cookies for 90 minutes, mood 5',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Natural Language Quick Logger"
      subtitle="Speak or type freely — AI parses and records DSA, study time, mood, and ATS applications simultaneously"
      maxWidth="lg"
      footer={
        parsed ? (
          <>
            <Button variant="ghost" onClick={() => setParsed(null)}>
              Back
            </Button>
            <Button variant="success" onClick={handleApplyAll} disabled={isApplied}>
              <CheckCircle2 size={15} />
              <span>{isApplied ? 'Applied Successfully!' : 'Confirm & Apply Updates'}</span>
            </Button>
          </>
        ) : (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )
      }
    >
      <div className="space-y-4">
        {!parsed ? (
          <>
            <form onSubmit={handleParse} className="space-y-3">
              <textarea
                rows={3}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='e.g. "Finished 2 medium binary search problems, studied React useEffect for 45 minutes, mood 4"'
                className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />

              <div className="flex justify-end">
                <Button type="submit" variant="primary" size="md" disabled={!input.trim()}>
                  <Sparkles size={14} />
                  <span>Parse with AI</span>
                </Button>
              </div>
            </form>

            {/* Quick Suggestions */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Try clicking a sample input:
              </span>
              <div className="space-y-1.5">
                {sampleInputs.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInput(sample)}
                    className="w-full text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-850 border border-slate-800/80 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    &ldquo;{sample}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Parsed review */
          <div className="space-y-3 animate-fade-in">
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
              <span className="font-semibold text-white block mb-0.5">Summary of Actions:</span>
              {parsed.summaryExplanation}
            </div>

            <div className="space-y-2 text-xs">
              {parsed.tasksToCreate?.map((task, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <span className="text-slate-400 block text-[10px]">Create Task:</span>
                    <span className="font-semibold text-white">{task.title}</span>
                  </div>
                  <span className="text-indigo-400 font-mono text-[11px]">{task.dueDate}</span>
                </div>
              ))}

              {parsed.webDevMinutes && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-slate-300">Log Study Session:</span>
                  <span className="text-emerald-400 font-mono font-semibold">
                    +{parsed.webDevMinutes} mins on {parsed.webDevTopicName || 'Web Dev'}
                  </span>
                </div>
              )}

              {parsed.moodScore && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-slate-300">Log Mood:</span>
                  <span className="text-amber-400 font-mono font-semibold">
                    Score {parsed.moodScore} / 5
                  </span>
                </div>
              )}

              {parsed.appliedCompany && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
                  <span className="text-slate-300">Record ATS Job Application:</span>
                  <span className="text-blue-400 font-semibold font-mono">
                    {parsed.appliedCompany} ({parsed.appliedRole})
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
