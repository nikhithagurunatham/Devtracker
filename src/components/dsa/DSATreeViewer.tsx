import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Code,
  Calendar,
  Sparkles,
  Layers,
  CheckCircle,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react';
import { DSATopic, DSAPattern } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface DSATreeViewerProps {
  topics: DSATopic[];
  patterns: DSAPattern[];
  onTopicClick?: (topic: DSATopic) => void;
  onDeleteTopic?: (id: string) => void;
  onOpenAddTopicModal?: (section?: 'FOUNDATION' | 'CORE' | 'INTERMEDIATE' | 'ADVANCED') => void;
}

export const DSATreeViewer: React.FC<DSATreeViewerProps> = ({
  topics,
  patterns,
  onTopicClick,
  onDeleteTopic,
  onOpenAddTopicModal,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<DSATopic | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    FOUNDATION: true,
    CORE: true,
    INTERMEDIATE: true,
    ADVANCED: true,
    HYBRID: true,
  });

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  const foundationSlugs = ['programming-fundamentals', 'complexity-analysis', 'arrays-and-strings'];
  const coreSlugs = [
    'hashing',
    'two-pointers',
    'sliding-window',
    'prefix-sum',
    'binary-search',
    'linked-lists',
    'stack-and-queue',
  ];
  const intermediateSlugs = ['trees-and-bst', 'heap'];
  const advancedSlugs = ['graphs', 'dynamic-programming', 'trie-and-union-find'];

  // Dynamic grouping supporting custom-added user topics
  const groups = {
    FOUNDATION: topics.filter(
      (t) =>
        t.section === 'FOUNDATION' ||
        foundationSlugs.includes(t.slug) ||
        (!t.section &&
          !coreSlugs.includes(t.slug) &&
          !intermediateSlugs.includes(t.slug) &&
          !advancedSlugs.includes(t.slug) &&
          t.progressionLevel === 'BEGINNER')
    ),
    CORE: topics.filter(
      (t) =>
        t.section === 'CORE' ||
        coreSlugs.includes(t.slug) ||
        (!t.section &&
          !foundationSlugs.includes(t.slug) &&
          !intermediateSlugs.includes(t.slug) &&
          !advancedSlugs.includes(t.slug) &&
          (t.progressionLevel === 'INTERMEDIATE' || !t.progressionLevel))
    ),
    INTERMEDIATE: topics.filter(
      (t) =>
        t.section === 'INTERMEDIATE' ||
        intermediateSlugs.includes(t.slug)
    ),
    ADVANCED: topics.filter(
      (t) =>
        t.section === 'ADVANCED' ||
        advancedSlugs.includes(t.slug) ||
        (!t.section &&
          !foundationSlugs.includes(t.slug) &&
          !coreSlugs.includes(t.slug) &&
          !intermediateSlugs.includes(t.slug) &&
          (t.progressionLevel === 'ADVANCED' || t.progressionLevel === 'INTERVIEW'))
    ),
  };

  const hybridPatternsList = [
    { name: 'HashMap + Prefix Sum', desc: 'Subarray sum equals K, contiguous sum queries in O(n)' },
    { name: 'HashMap + Sliding Window', desc: 'Longest substring without repeating characters, min window' },
    { name: 'Heap + HashMap', desc: 'Top K frequent elements, sort characters by frequency' },
    { name: 'Binary Search + Greedy', desc: 'Search on answer space (Koko Bananas, Split Array Largest Sum)' },
    { name: 'DFS + Memoization', desc: 'Target sum, word break, matrix longest path' },
    { name: 'Tree + HashMap', desc: 'Lowest common ancestor with parent pointers, vertical order traversal' },
    { name: 'Graph + DP', desc: 'Cheapest flights within K stops, shortest path with fuel constraint' },
    { name: 'Two Pointers + Sorting', desc: '3Sum, 4Sum, minimum size subarray' },
    { name: 'Stack + HashMap', desc: 'Next greater element I & II, matching pairs' },
    { name: 'Heap + Sliding Window', desc: 'Sliding window median, continuous top-k' },
  ];

  return (
    <div className="space-y-6">
      {/* Sections */}
      {(['FOUNDATION', 'CORE', 'INTERMEDIATE', 'ADVANCED'] as const).map((secKey) => {
        const secTopics = groups[secKey] || [];
        const isExpanded = expandedSections[secKey];

        const sectionBadgeColors = {
          FOUNDATION: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          CORE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          INTERMEDIATE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
          ADVANCED: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        };

        return (
          <div
            key={secKey}
            className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden shadow-sm"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(secKey)}
              className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/80 hover:bg-slate-850 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                {isExpanded ? (
                  <ChevronDown size={18} className="text-slate-400" />
                ) : (
                  <ChevronRight size={18} className="text-slate-400" />
                )}
                <div>
                  <span className="font-bold text-sm tracking-wide text-white">
                    {secKey} KNOWLEDGE
                  </span>
                  <span className="text-xs text-slate-400 ml-3">
                    ({secTopics.length} topics)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenAddTopicModal && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAddTopicModal(secKey);
                    }}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white flex items-center gap-1 transition-all border border-slate-700/80 cursor-pointer"
                    title={`Add new topic to ${secKey} Knowledge`}
                  >
                    <Plus size={11} />
                    <span>Add Topic</span>
                  </span>
                )}

                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border ${sectionBadgeColors[secKey]}`}
                >
                  {secKey}
                </span>
              </div>
            </button>

            {/* Topic Grid */}
            {isExpanded && (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-slate-950/30">
                {secTopics.map((topic) => {
                  const topicPatterns = patterns.filter((p) => p.topicId === topic.id);
                  const conf = topic.confidence || 0;

                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className="p-4 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 rounded-xl transition-all cursor-pointer flex flex-col justify-between group shadow-sm relative"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm text-slate-200 group-hover:text-white transition-colors">
                            {topic.name}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                                conf === 0
                                  ? 'bg-slate-800 text-slate-400 border border-slate-700'
                                  : conf <= 2
                                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  : conf === 3
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {conf === 0 ? 'Not Started' : `Confidence ${conf}/5`}
                            </span>

                            {onDeleteTopic && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm(`Are you sure you want to delete topic "${topic.name}"?`)) {
                                    onDeleteTopic(topic.id);
                                  }
                                }}
                                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                title={`Delete topic "${topic.name}"`}
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                          {topic.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle size={13} className="text-emerald-400" />
                          <span>
                            {topic.solvedCount || 0} / {topic.problemsCount || 0} Solved
                          </span>
                        </div>

                        <div className="text-[11px] text-indigo-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          <span>Theory & Code</span>
                          <ChevronRight size={12} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Hybrid Patterns Section */}
      <div className="border border-slate-800 rounded-xl bg-slate-900/40 overflow-hidden shadow-sm">
        <button
          onClick={() => toggleSection('HYBRID')}
          className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-900/80 hover:bg-slate-850 transition-colors text-left cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {expandedSections.HYBRID ? (
              <ChevronDown size={18} className="text-slate-400" />
            ) : (
              <ChevronRight size={18} className="text-slate-400" />
            )}
            <div>
              <span className="font-bold text-sm tracking-wide text-white">
                HYBRID INTERVIEW PATTERNS
              </span>
              <span className="text-xs text-slate-400 ml-3">(10 FAANG Combos)</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-400 border-purple-500/30">
            HYBRID
          </span>
        </button>

        {expandedSections.HYBRID && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/30">
            {hybridPatternsList.map((hp, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Layers size={16} />
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">{hp.name}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{hp.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Topic Detail Modal */}
      {selectedTopic && (
        <Modal
          isOpen={!!selectedTopic}
          onClose={() => setSelectedTopic(null)}
          title={selectedTopic.name}
          subtitle={`Progression Level: ${selectedTopic.progressionLevel} • ${
            selectedTopic.confidence && selectedTopic.confidence > 0
              ? `Confidence: ${selectedTopic.confidence}/5`
              : 'Not Started (0/5)'
          }`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              {onDeleteTopic ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete "${selectedTopic.name}"?`)) {
                      onDeleteTopic(selectedTopic.id);
                      setSelectedTopic(null);
                    }
                  }}
                  className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 text-xs"
                >
                  <Trash2 size={14} className="mr-1.5" />
                  Delete Topic
                </Button>
              ) : (
                <div />
              )}
              <Button variant="primary" size="sm" onClick={() => setSelectedTopic(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Overview & Scope
              </h4>
              <p className="text-sm text-slate-200">{selectedTopic.description}</p>
            </div>

            {selectedTopic.theory && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                  <BookOpen size={14} />
                  <span>Theory & Invariants</span>
                </h4>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed font-mono">
                  {selectedTopic.theory}
                </div>
              </div>
            )}

            {selectedTopic.templates && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Code size={14} />
                  <span>Code Template & Skeleton</span>
                </h4>
                <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-emerald-300 overflow-x-auto font-mono">
                  {selectedTopic.templates}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block">Problems Solved:</span>
                <span className="text-base font-bold text-white mt-1 block">
                  {selectedTopic.solvedCount || 0} / {selectedTopic.problemsCount || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg">
                <span className="text-slate-400 block">Last Studied:</span>
                <span className="text-sm font-semibold text-slate-200 mt-1 block font-mono">
                  {selectedTopic.lastStudiedDate || 'Recently'}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
