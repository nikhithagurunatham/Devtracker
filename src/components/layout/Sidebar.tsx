import React, { useState, useEffect } from 'react';
import { DevTrackStore } from '@/lib/storage';
import {
  LayoutDashboard,
  Map,
  Code2,
  Globe,
  FolderGit2,
  CheckSquare,
  Clock,
  Flame,
  Heart,
  Briefcase,
  BrainCircuit,
  BarChart3,
  Calendar,
  FileText,
  Sparkles,
  ShieldCheck,
  X,
  LogOut,
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  pendingRevisionsCount?: number;
  dueTasksCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingRevisionsCount = 0,
  dueTasksCount = 0,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(() => DevTrackStore.getProfile());

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(DevTrackStore.getProfile());
    };
    window.addEventListener('devtrack_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('devtrack_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const profileName = session?.user?.name || profile?.name || 'Nikhitha';
  const profileInitials =
    profileName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NK';
  const navSections = [
    {
      title: 'CORE OPERATING SYSTEM',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={17} /> },
        { id: 'roadmap', label: '100-Day Roadmap', icon: <Map size={17} /> },
        {
          id: 'tasks',
          label: 'Tasks & Sprints',
          icon: <CheckSquare size={17} />,
          badge: dueTasksCount > 0 ? dueTasksCount : undefined,
          badgeColor: 'bg-indigo-500/20 text-indigo-400',
        },
        { id: 'calendar', label: 'Monthly Calendar', icon: <Calendar size={17} /> },
      ],
    },
    {
      title: 'LEARNING & DSA TREE',
      items: [
        {
          id: 'dsa',
          label: 'DSA Knowledge Tree',
          icon: <Code2 size={17} />,
          badge: pendingRevisionsCount > 0 ? `${pendingRevisionsCount} Due` : undefined,
          badgeColor: 'bg-rose-500/20 text-rose-400 font-semibold',
        },
        { id: 'webdev', label: 'Web Dev Tree', icon: <Globe size={17} /> },
        { id: 'projects', label: 'Portfolio Projects', icon: <FolderGit2 size={17} /> },
      ],
    },
    {
      title: 'PRODUCTIVITY & ATS',
      items: [
        { id: 'study', label: 'Study Timer (Pomodoro)', icon: <Clock size={17} /> },
        { id: 'habits', label: 'Habit Consistency', icon: <Flame size={17} /> },
        { id: 'mood', label: 'Energy & Mood', icon: <Heart size={17} /> },
        { id: 'jobs', label: 'ATS Job Tracker', icon: <Briefcase size={17} /> },
        { id: 'resume', label: 'Resume & Mock Prep', icon: <FileText size={17} /> },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { id: 'ai', label: 'DevMentor AI', icon: <BrainCircuit size={17} /> },
        { id: 'plan', label: "Today's AI Plan", icon: <Sparkles size={17} /> },
        { id: 'analytics', label: 'Analytics & Heatmap', icon: <BarChart3 size={17} /> },
      ],
    },
    {
      title: 'ACCOUNT & ACCESS',
      items: [
        { id: 'auth', label: 'Sign In / Register', icon: <ShieldCheck size={17} /> },
      ],
    },
  ];

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Brand logo */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-indigo-500/20">
            D
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight flex items-center gap-1">
              DevTrack <span className="text-indigo-400 font-mono">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono block -mt-0.5">
              SDE-1 Personal OS
            </span>
          </div>
        </div>
        {isMobile && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav List */}
      <div className="p-3 overflow-y-auto flex-1 space-y-6">
        {navSections.map((sec, sidx) => (
          <div key={sidx} className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-slate-400 tracking-wider">
              {sec.title}
            </span>
            <div className="space-y-0.5 mt-1">
              {sec.items.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      if (isMobile && onCloseMobile) onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={isActive ? 'text-white' : 'text-slate-400'}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Bar in Footer with Direct Sign Out / Sign In Action */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between gap-2">
        <a
          href="/sign-in"
          className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-85 transition-opacity cursor-pointer group"
          title="Switch Profile / Sign In"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-400 font-mono group-hover:border-indigo-500 shrink-0">
            {profileInitials}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-xs font-semibold text-white block truncate group-hover:text-indigo-300">
              {profileName}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono block truncate flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{session ? 'Signed In' : 'Candidate'}</span>
            </span>
          </div>
        </a>

        {/* Quick Sign Out or Sign In Action */}
        {session ? (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/sign-in' })}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/30 rounded-lg transition-all cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut size={15} />
          </button>
        ) : (
          <a
            href="/sign-in"
            className="px-2 py-1 text-[11px] font-semibold bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg transition-colors cursor-pointer shrink-0"
            title="Sign In"
          >
            Sign In
          </a>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-950/95 border-r border-slate-800/80 flex-col justify-between h-screen sticky top-0 select-none z-30 shrink-0">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
            onClick={onCloseMobile}
          />
          <aside className="relative z-10 w-72 bg-slate-950 border-r border-slate-800 flex flex-col justify-between h-screen select-none animate-in slide-in-from-left duration-200 shadow-2xl">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};
