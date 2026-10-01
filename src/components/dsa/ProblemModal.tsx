import React, { useState, useEffect } from 'react';
import { Problem, Difficulty, ProblemStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { ExternalLink, Sparkles, Check, AlertCircle } from 'lucide-react';
import { calculateNextRevision } from '@/lib/spaced-repetition';

interface ProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (problemData: any) => void;
  problem?: Problem | null;
}

export const ProblemModal: React.FC<ProblemModalProps> = ({
  isOpen,
  onClose,
  onSave,
  problem,
}) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [platform, setPlatform] = useState('LeetCode');
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [status, setStatus] = useState<ProblemStatus>('NOT_STARTED');
  const [confidence, setConfidence] = useState<number>(3);
  const [timeTakenMin, setTimeTakenMin] = useState<string>('30');
  const [patternsInput, setPatternsInput] = useState('');
  const [companyTagsInput, setCompanyTagsInput] = useState('');
  const [solutionNotes, setSolutionNotes] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [mistakes, setMistakes] = useState('');

  useEffect(() => {
    if (problem) {
      setName(problem.name);
      setUrl(problem.url);
      setPlatform(problem.platform);
      setDifficulty(problem.difficulty);
      setStatus(problem.status);
      setConfidence(problem.confidence);
      setTimeTakenMin(problem.timeTakenMin?.toString() || '30');
      setPatternsInput(problem.patterns.join(', '));
      setCompanyTagsInput(problem.companyTags.join(', '));
      setSolutionNotes(problem.solutionNotes || '');
      setCodeSnippet(problem.codeSnippet || '');
      setMistakes(problem.mistakes || '');
    } else {
      setName('');
      setUrl('');
      setPlatform('LeetCode');
      setDifficulty('MEDIUM');
      setStatus('NOT_STARTED');
      setConfidence(3);
      setTimeTakenMin('30');
      setPatternsInput('');
      setCompanyTagsInput('');
      setSolutionNotes('');
      setCodeSnippet('');
      setMistakes('');
    }
  }, [problem, isOpen]);

  const handleSave = () => {
    if (!name.trim()) return;

    const patterns = patternsInput
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const companyTags = companyTagsInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    onSave({
      name: name.trim(),
      url: url.trim(),
      platform,
      difficulty,
      status,
      confidence,
      timeTakenMin: timeTakenMin ? parseInt(timeTakenMin, 10) : undefined,
      patterns,
      companyTags,
      solutionNotes: solutionNotes.trim() || undefined,
      codeSnippet: codeSnippet.trim() || undefined,
      mistakes: mistakes.trim() || undefined,
    });

    onClose();
  };

  const nextRevision = calculateNextRevision(confidence, problem?.attemptsCount || 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={problem ? `Problem: ${problem.name}` : 'Log New DSA Problem'}
      subtitle="Track pattern mastery, solution notes, pitfalls, and spaced repetition"
      maxWidth="2xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save Problem
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Title & Platform */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <Input
              label="Problem Name *"
              placeholder="e.g. Longest Substring Without Repeating Characters"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Platform</label>
            <select
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="LeetCode">LeetCode</option>
              <option value="Codeforces">Codeforces</option>
              <option value="HackerRank">HackerRank</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* URL with quick open */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <Input
              label="Problem URL"
              placeholder="https://leetcode.com/problems/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors"
            >
              <span>Visit</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Difficulty, Status, Time Taken */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Difficulty</label>
            <select
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Solving Status</label>
            <select
              className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProblemStatus)}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="ATTEMPTED">Attempted (Struggled)</option>
              <option value="HINT_USED">Solved With Hint</option>
              <option value="SOLVED">Solved Independently</option>
              <option value="MASTERED">Mastered (Optimal & Fast)</option>
            </select>
          </div>

          <div>
            <Input
              label="Time Taken (Minutes)"
              type="number"
              value={timeTakenMin}
              onChange={(e) => setTimeTakenMin(e.target.value)}
            />
          </div>
        </div>

        {/* Confidence Rating 1 to 5 (Adaptive Spaced Repetition) */}
        <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Confidence Level (Spaced Repetition Trigger)</span>
            </label>
            <span className="text-xs font-bold text-indigo-400 font-mono">
              Level {confidence} / 5
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { score: 1, label: "Don't understand", days: 'Tomorrow' },
              { score: 2, label: 'Struggled', days: 'In 2 days' },
              { score: 3, label: 'With hints', days: 'In 4 days' },
              { score: 4, label: 'Independently', days: 'In 7 days' },
              { score: 5, label: 'Can solve fast', days: 'In 14 days' },
            ].map((lvl) => (
              <button
                key={lvl.score}
                type="button"
                onClick={() => setConfidence(lvl.score)}
                className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                  confidence === lvl.score
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-200">Lv {lvl.score}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{lvl.label}</div>
                <div className="text-[10px] text-indigo-400 font-mono mt-1">{lvl.days}</div>
              </button>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 pt-1">
            Next scheduled revision:{' '}
            <span className="text-indigo-300 font-mono font-medium">
              {nextRevision.nextRevisionDate} (+{nextRevision.nextIntervalDays} days)
            </span>
          </p>
        </div>

        {/* Patterns & Company Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Patterns (e.g. Sliding Window, HashMap)"
            value={patternsInput}
            onChange={(e) => setPatternsInput(e.target.value)}
            placeholder="Sliding Window, HashMap"
          />
          <Input
            label="Company Tags (e.g. Amazon, Google, Uber)"
            value={companyTagsInput}
            onChange={(e) => setCompanyTagsInput(e.target.value)}
            placeholder="Amazon, Google, Meta"
          />
        </div>

        {/* Solution Notes & Mistakes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Solution Approach & Invariant</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-500 font-mono"
              placeholder="Store char -> index. Advance left pointer with Math.max..."
              value={solutionNotes}
              onChange={(e) => setSolutionNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-rose-300">Mistakes & Pitfalls (For AI Memory)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-rose-900/40 rounded-lg text-rose-100 placeholder-slate-500 font-mono"
              placeholder="Forgot to handle 2-element edge case [3, 1] target 1..."
              value={mistakes}
              onChange={(e) => setMistakes(e.target.value)}
            />
          </div>
        </div>

        {/* Code Snippet */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-300">Code Snippet (C++ / Java / TypeScript)</label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-emerald-300 placeholder-slate-600 font-mono"
            placeholder="int low = 0, high = nums.size() - 1; ..."
            value={codeSnippet}
            onChange={(e) => setCodeSnippet(e.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
};
