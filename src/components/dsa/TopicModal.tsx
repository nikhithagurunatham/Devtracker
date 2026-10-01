import React, { useState } from 'react';
import { DSATopic, DSAProgressionLevel } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Sparkles, Code, BookOpen, Layers, Plus } from 'lucide-react';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (topicData: Partial<DSATopic> & { name: string }) => void;
  defaultSection?: 'FOUNDATION' | 'CORE' | 'INTERMEDIATE' | 'ADVANCED';
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  onSave,
  defaultSection = 'FOUNDATION',
}) => {
  const [name, setName] = useState('');
  const [section, setSection] = useState<'FOUNDATION' | 'CORE' | 'INTERMEDIATE' | 'ADVANCED'>(defaultSection);
  const [description, setDescription] = useState('');
  const [problemsCount, setProblemsCount] = useState<string>('15');
  const [theory, setTheory] = useState('');
  const [templates, setTemplates] = useState('');

  // Keep section in sync when defaultSection prop changes
  React.useEffect(() => {
    if (isOpen) {
      setSection(defaultSection);
    }
  }, [isOpen, defaultSection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const progressionLevel: DSAProgressionLevel =
      section === 'FOUNDATION'
        ? 'BEGINNER'
        : section === 'CORE'
        ? 'INTERMEDIATE'
        : section === 'INTERMEDIATE'
        ? 'INTERMEDIATE'
        : 'ADVANCED';

    onSave({
      name: name.trim(),
      section,
      description:
        description.trim() ||
        `Core concepts, patterns, algorithms, and interview problems for ${name.trim()}.`,
      problemsCount: parseInt(problemsCount, 10) || 10,
      progressionLevel,
      theory: theory.trim(),
      templates: templates.trim(),
      category: 'DSA',
      patternsCount: 2,
    });

    setName('');
    setDescription('');
    setTheory('');
    setTemplates('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add DSA Knowledge Topic"
      subtitle="Create a custom topic or pattern category in your DSA Knowledge Tree."
      maxWidth="xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!name.trim()}>
            <Plus size={14} className="mr-1" />
            Save Topic
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Topic Name <span className="text-rose-400">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Bit Manipulation, Segment Trees, Backtracking, Trie"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Knowledge Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="FOUNDATION">Foundation Knowledge</option>
              <option value="CORE">Core Knowledge</option>
              <option value="INTERMEDIATE">Intermediate Knowledge</option>
              <option value="ADVANCED">Advanced Knowledge</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Target Problems to Master
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              value={problemsCount}
              onChange={(e) => setProblemsCount(e.target.value)}
              placeholder="15"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Scope & Overview Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Brief overview of techniques, edge cases, and core problems covered."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <BookOpen size={13} className="text-indigo-400" />
            <span>Theory & Invariants (Optional)</span>
          </label>
          <textarea
            value={theory}
            onChange={(e) => setTheory(e.target.value)}
            rows={2}
            placeholder="Key mathematical invariants, asymptotic complexity notes, or memory trade-offs."
            className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-[11px] resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Code size={13} className="text-emerald-400" />
            <span>Code Template / Skeleton (Optional)</span>
          </label>
          <textarea
            value={templates}
            onChange={(e) => setTemplates(e.target.value)}
            rows={3}
            placeholder="// Standard reusable boilerplate or recursion skeleton"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-[11px] resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};
