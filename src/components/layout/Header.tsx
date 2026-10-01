import React, { useState, useEffect, useRef } from 'react';
import { DevTrackStore } from '@/lib/storage';
import {
  Search,
  Command,
  Bell,
  Sparkles,
  Flame,
  Menu,
  ChevronDown,
  LogOut,
  LogIn,
  Settings,
  User,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

import { useSession, signOut } from 'next-auth/react';
import { AccountSettingsModal } from '@/components/account/AccountSettingsModal';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onOpenQuickAction: () => void;
  onToggleMobileMenu?: () => void;
  currentStreak?: number;
  revisionsDueCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onOpenQuickAction,
  onToggleMobileMenu,
  currentStreak = 0,
  revisionsDueCount = 0,
}) => {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(() => DevTrackStore.getProfile());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(DevTrackStore.getProfile());
    };
    window.addEventListener('devtrack_store_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Close user menu on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      window.removeEventListener('devtrack_store_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const displayName = session?.user?.name || profile?.name || 'Nikhitha';

  const userInitials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NK';

  return (
    <>
      <header className="h-14 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20 px-4 md:px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
          )}

          {/* Search / Command palette trigger */}
          <button
            onClick={onOpenCommandPalette}
            className="flex items-center gap-3 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer w-48 sm:w-64 md:w-80"
          >
            <Search size={14} className="text-slate-500 shrink-0" />
            <span className="flex-1 text-left truncate">Search or type a command...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] bg-slate-950 text-slate-400 border border-slate-700 rounded font-mono">
              <Command size={10} /> K
            </kbd>
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Quick Add with AI button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenQuickAction}
            className="text-xs border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
          >
            <Sparkles size={13} className="text-indigo-400" />
            <span className="hidden sm:inline">Quick Natural Language Log</span>
          </Button>

          {/* Streak indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-mono font-bold text-amber-400">
            <Flame size={14} />
            <span>{currentStreak}d Streak</span>
          </div>

          {/* Revisions Notification Bell */}
          <button
            onClick={onOpenCommandPalette}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Notifications & Revisions Due"
          >
            <Bell size={16} />
            {revisionsDueCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* User Session & Sign Out Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 rounded-xl text-xs text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm"
              title="User Account & Session Options"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-slate-950 font-bold text-[10px] flex items-center justify-center font-mono">
                {userInitials}
              </div>
              <span className="hidden sm:inline font-medium">{displayName}</span>
              <ChevronDown
                size={12}
                className={`text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Interactive User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-xs">
                {/* User card header */}
                <div className="p-3 border-b border-slate-800 bg-slate-950/70 rounded-xl mb-1.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      {session ? 'Authenticated Account' : 'Guest / Demo Mode'}
                    </span>
                  </div>
                  <p className="font-bold text-white truncate text-sm">{displayName}</p>
                  <p className="text-[11px] text-slate-400 truncate font-mono">
                    {session?.user?.email || profile?.email || 'nikhitha.dev@example.com'}
                  </p>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsAccountModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
                  >
                    <Settings size={14} className="text-indigo-400" />
                    <span>Account Settings & Profile</span>
                  </button>

                  <a
                    href="/sign-in"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
                  >
                    <User size={14} className="text-purple-400" />
                    <span>Switch / Sign In Another User</span>
                  </a>

                  {/* Sign Out Option */}
                  <div className="pt-1 mt-1 border-t border-slate-800/80">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        signOut({ callbackUrl: '/sign-in' });
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors cursor-pointer text-left font-semibold"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onProfileUpdated={() => {
          setProfile(DevTrackStore.getProfile());
        }}
      />
    </>
  );
};

