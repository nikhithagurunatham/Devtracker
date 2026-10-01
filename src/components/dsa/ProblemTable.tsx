import React, { useState } from 'react';
import {
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Dices,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  CalendarPlus,
  CalendarCheck,
  X,
} from 'lucide-react';
import { Problem, Difficulty, ProblemStatus, Task } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface ProblemTableProps {
  problems: Problem[];
  dsaTasks?: Task[];
  onEditProblem: (problem: Problem) => void;
  onDeleteProblem: (id: string) => void;
  onAddProblem: () => void;
  onSelectRandomWeak: () => void;
  onQuickConfidenceUpdate: (id: string, confidence: number) => void;
  onAddTaskForProblem?: (problem: Problem) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const ProblemTable: React.FC<ProblemTableProps> = ({
  problems,
  dsaTasks = [],
  onEditProblem,
  onDeleteProblem,
  onAddProblem,
  onSelectRandomWeak,
  onQuickConfidenceUpdate,
  onAddTaskForProblem,
  onDeleteTask,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedCompany, setSelectedCompany] = useState<string>('ALL');
  const [filterWeakOnly, setFilterWeakOnly] = useState(false);
  const [filterRevisionDueOnly, setFilterRevisionDueOnly] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Distinct company tags
  const allCompanies = Array.from(
    new Set(problems.flatMap((p) => p.companyTags || []))
  ).filter(Boolean);

  const filtered = problems.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.patterns.some((pat) => pat.toLowerCase().includes(search.toLowerCase())) ||
      p.companyTags.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
      (p.topicName && p.topicName.toLowerCase().includes(search.toLowerCase()));

    const matchesDifficulty =
      selectedDifficulty === 'ALL' || p.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    const matchesCompany =
      selectedCompany === 'ALL' || p.companyTags.includes(selectedCompany);

    const isWeak = p.confidence <= 2 || p.status === 'ATTEMPTED';
    const isDue = p.nextRevisionAt && p.nextRevisionAt <= todayStr;

    if (filterWeakOnly && !isWeak) return false;
    if (filterRevisionDueOnly && !isDue) return false;

    return matchesSearch && matchesDifficulty && matchesStatus && matchesCompany;
  });

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectRandomWeak}
            className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
            title="Pick a random problem based on your weak areas"
          >
            <Dices size={15} />
            <span>Random Problem (Weak Focus)</span>
          </Button>

          <Button
            variant={filterWeakOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterWeakOnly(!filterWeakOnly)}
            className="text-xs"
          >
            <AlertTriangle size={14} className={filterWeakOnly ? 'text-white' : 'text-amber-400'} />
            <span>Weak Areas ({problems.filter((p) => p.confidence <= 2).length})</span>
          </Button>

          <Button
            variant={filterRevisionDueOnly ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterRevisionDueOnly(!filterRevisionDueOnly)}
            className="text-xs"
          >
            <Calendar size={14} className={filterRevisionDueOnly ? 'text-white' : 'text-rose-400'} />
            <span>Revisions Due ({problems.filter((p) => p.nextRevisionAt && p.nextRevisionAt <= todayStr).length})</span>
          </Button>
        </div>

        <Button variant="primary" size="sm" onClick={onAddProblem}>
          <Plus size={15} />
          <span>Add Problem</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems, patterns..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 cursor-pointer"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 cursor-pointer"
        >
          <option value="ALL">All Statuses</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="ATTEMPTED">Attempted</option>
          <option value="HINT_USED">Hint Used</option>
          <option value="SOLVED">Solved</option>
          <option value="MASTERED">Mastered</option>
        </select>

        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-lg text-slate-300 cursor-pointer"
        >
          <option value="ALL">All Companies</option>
          {allCompanies.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/50">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 font-semibold border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Problem</th>
              <th className="py-3 px-3">Difficulty</th>
              <th className="py-3 px-3">Patterns</th>
              <th className="py-3 px-3">Company Tags</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Confidence</th>
              <th className="py-3 px-3">Next Revision</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-normal">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No problems found matching active filters.
                </td>
              </tr>
            ) : (
              filtered.map((problem) => {
                const isDue =
                  problem.nextRevisionAt && problem.nextRevisionAt <= todayStr;

                return (
                  <tr
                    key={problem.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Problem Name & Link */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-200 group-hover:text-white">
                          {problem.name}
                        </span>
                        {problem.url && (
                          <a
                            href={problem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-500 hover:text-indigo-400 transition-colors"
                            title="Open problem in new tab"
                          >
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {problem.topicName || 'DSA'} • {problem.platform}
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3 px-3">
                      <Badge type={problem.difficulty}>{problem.difficulty}</Badge>
                    </td>

                    {/* Patterns */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {problem.patterns.map((pat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-400 border border-slate-700/60"
                          >
                            {pat}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Company Tags */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {problem.companyTags.map((c, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-indigo-950/30 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <Badge type={problem.status}>{problem.status}</Badge>
                    </td>

                    {/* Confidence Meter 1-5 */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => onQuickConfidenceUpdate(problem.id, lvl)}
                            className={`w-3.5 h-3.5 rounded-sm transition-all cursor-pointer ${
                              lvl <= problem.confidence
                                ? lvl <= 2
                                  ? 'bg-rose-500'
                                  : lvl === 3
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                                : 'bg-slate-800 hover:bg-slate-700'
                            }`}
                            title={`Set confidence to ${lvl}/5`}
                          />
                        ))}
                      </div>
                    </td>

                    {/* Next Revision */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {problem.nextRevisionAt ? (
                        <div
                          className={`flex items-center gap-1 text-[11px] font-mono ${
                            isDue ? 'text-rose-400 font-bold' : 'text-slate-400'
                          }`}
                        >
                          <Calendar size={11} />
                          <span>{problem.nextRevisionAt}</span>
                          {isDue && (
                            <span className="text-[9px] px-1 bg-rose-500/20 text-rose-300 rounded">
                              DUE
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Task Schedule / Delete Action */}
                        {(() => {
                          const associatedTask = dsaTasks.find((t) =>
                            t.title.toLowerCase().includes(problem.name.toLowerCase())
                          );
                          if (associatedTask) {
                            return (
                              <div
                                className="flex items-center gap-1 bg-cyan-950/50 border border-cyan-800/60 rounded px-1.5 py-0.5 text-[10px] text-cyan-300"
                                title={`Task scheduled: ${associatedTask.dueDate || 'No date'}`}
                              >
                                <CalendarCheck size={11} className="text-cyan-400" />
                                <span className="font-mono">
                                  {associatedTask.dueDate ? associatedTask.dueDate.substring(5) : 'Scheduled'}
                                </span>
                                {onDeleteTask && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteTask(associatedTask.id);
                                    }}
                                    className="text-slate-400 hover:text-rose-400 ml-0.5 p-0.5"
                                    title="Delete this task"
                                  >
                                    <X size={10} />
                                  </button>
                                )}
                              </div>
                            );
                          }
                          if (onAddTaskForProblem) {
                            return (
                              <button
                                type="button"
                                onClick={() => onAddTaskForProblem(problem)}
                                className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-950/40 rounded transition-colors flex items-center gap-1 text-[11px]"
                                title="Schedule as task in calendar"
                              >
                                <CalendarPlus size={13} />
                                <span className="hidden xl:inline text-[10px]">Add Task</span>
                              </button>
                            );
                          }
                          return null;
                        })()}

                        <button
                          onClick={() => onEditProblem(problem)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                          title="Edit problem details"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => onDeleteProblem(problem.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                          title="Delete problem"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
