'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckSquare,
  Clock,
  Code2,
  Briefcase,
  Sparkles,
  Calendar,
  Layers,
  Flame,
  FolderGit2,
  Globe,
  FileText,
  ArrowRight,
  Loader2,
  X,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand: (action: string, meta?: any) => void;
}

interface SearchItem {
  id: string;
  title: string;
  subtitle?: string;
  type?: string;
}

interface CategorizedResults {
  tasks: SearchItem[];
  projects: SearchItem[];
  dsa: SearchItem[];
  webdev: SearchItem[];
  jobs: SearchItem[];
  notes: SearchItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<CategorizedResults | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSearchResults(null);
    }
  }, [isOpen]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.results) {
            setSearchResults(data.results);
          }
        }
      } catch (err) {
        console.error('Search query failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  if (!isOpen) return null;

  // Default quick action commands when no query
  const defaultCommands = [
    { id: 'add_task', label: 'Add Task / Sprint Item', icon: <CheckSquare size={16} />, category: 'Tasks' },
    { id: 'start_timer', label: 'Start Pomodoro Study Timer', icon: <Clock size={16} />, category: 'Study' },
    { id: 'add_problem', label: 'Solve / Log DSA Problem', icon: <Code2 size={16} />, category: 'DSA' },
    { id: 'add_job', label: 'Add ATS Job Application', icon: <Briefcase size={16} />, category: 'Jobs' },
    { id: 'ask_ai', label: 'Ask DevMentor AI Assistant', icon: <Sparkles size={16} />, category: 'AI' },
    { id: 'view_revision', label: 'View Spaced Revisions Due', icon: <Layers size={16} />, category: 'DSA' },
    { id: 'open_plan', label: "Open Today's AI Execution Plan", icon: <Calendar size={16} />, category: 'Plan' },
    { id: 'log_mood', label: 'Log Daily Mood & Energy', icon: <Flame size={16} />, category: 'Habits' },
  ];

  const hasSearchResults =
    searchResults &&
    (searchResults.tasks.length > 0 ||
      searchResults.projects.length > 0 ||
      searchResults.dsa.length > 0 ||
      searchResults.webdev.length > 0 ||
      searchResults.jobs.length > 0 ||
      searchResults.notes.length > 0);

  const handleSelectResult = (targetTab: string, meta?: any) => {
    onExecuteCommand(targetTab, meta);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Palette Dialog */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-800">
          <Search size={18} className="text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, DSA topics, projects, ATS jobs, lessons, or notes..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          {isSearching && <Loader2 size={16} className="text-indigo-400 animate-spin mr-2 shrink-0" />}
          <kbd className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono border border-slate-700 shrink-0">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-4">
          {/* Categorized Search Results */}
          {query.trim().length >= 2 ? (
            hasSearchResults ? (
              <div className="space-y-4">
                {/* 1. TASKS */}
                {searchResults!.tasks.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckSquare size={12} />
                      TASKS ({searchResults!.tasks.length})
                    </div>
                    {searchResults!.tasks.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => handleSelectResult('tasks', { taskId: task.id })}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-indigo-300">
                            {task.title}
                          </div>
                          {task.subtitle && (
                            <div className="text-[10px] text-slate-400">{task.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-indigo-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 2. PROJECTS */}
                {searchResults!.projects.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FolderGit2 size={12} />
                      PROJECTS ({searchResults!.projects.length})
                    </div>
                    {searchResults!.projects.map((proj) => (
                      <button
                        key={proj.id}
                        onClick={() => handleSelectResult('projects', { projectId: proj.id })}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                            {proj.title}
                          </div>
                          {proj.subtitle && (
                            <div className="text-[10px] text-slate-400">{proj.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-cyan-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 3. DSA */}
                {searchResults!.dsa.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code2 size={12} />
                      DSA KNOWLEDGE & PROBLEMS ({searchResults!.dsa.length})
                    </div>
                    {searchResults!.dsa.map((dsa) => (
                      <button
                        key={dsa.id}
                        onClick={() => handleSelectResult('dsa', { dsaId: dsa.id })}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-amber-300">
                            {dsa.title}
                          </div>
                          {dsa.subtitle && (
                            <div className="text-[10px] text-slate-400">{dsa.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-amber-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 4. WEB DEV */}
                {searchResults!.webdev.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe size={12} />
                      WEB DEVELOPMENT ({searchResults!.webdev.length})
                    </div>
                    {searchResults!.webdev.map((w) => (
                      <button
                        key={w.id}
                        onClick={() => handleSelectResult('webdev', { webdevId: w.id })}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-emerald-300">
                            {w.title}
                          </div>
                          {w.subtitle && (
                            <div className="text-[10px] text-slate-400">{w.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-emerald-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 5. JOBS */}
                {searchResults!.jobs.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase size={12} />
                      ATS JOBS ({searchResults!.jobs.length})
                    </div>
                    {searchResults!.jobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => handleSelectResult('jobs', { jobId: job.id })}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                            {job.title}
                          </div>
                          {job.subtitle && (
                            <div className="text-[10px] text-slate-400">{job.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-purple-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* 6. NOTES */}
                {searchResults!.notes.length > 0 && (
                  <div className="space-y-1">
                    <div className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={12} />
                      NOTES ({searchResults!.notes.length})
                    </div>
                    {searchResults!.notes.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => handleSelectResult('dsa')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white group-hover:text-slate-200">
                            {note.title}
                          </div>
                          {note.subtitle && (
                            <div className="text-[10px] text-slate-400">{note.subtitle}</div>
                          )}
                        </div>
                        <ArrowRight size={13} className="text-slate-600 group-hover:text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : !isSearching ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching tasks, problems, projects, or applications found for "{query}".
              </div>
            ) : null
          ) : (
            // Default Quick Actions
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Navigation & Commands
              </div>
              {defaultCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onExecuteCommand(cmd.id);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/80 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-800 text-indigo-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      {cmd.icon}
                    </div>
                    <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                      {cmd.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {cmd.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigate with mouse or keyboard</span>
          <span className="font-mono">DevTrack Global Search</span>
        </div>
      </div>
    </div>
  );
};
