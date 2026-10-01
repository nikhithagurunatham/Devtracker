'use client';

import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {
  User,
  Mail,
  Target,
  Building2,
  Code2,
  Clock,
  KeyRound,
  Trash2,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const { data: session } = useSession();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'danger'>('profile');

  // Profile fields
  const [name, setName] = useState('Nikhitha');
  const [email, setEmail] = useState('nikhitha.dev@example.com');
  const [targetRole, setTargetRole] = useState('Amazon SDE-1');
  const [targetCompanies, setTargetCompanies] = useState('Amazon, Microsoft, Google, Uber');
  const [skills, setSkills] = useState('JavaScript, TypeScript, React, Node.js, C++, Python');
  const [dailyStudyTarget, setDailyStudyTarget] = useState(5);
  const [goalTitle, setGoalTitle] = useState('Become Amazon SDE-1 interview ready');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Delete account fields
  const [deletePassword, setDeletePassword] = useState('');
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch current profile on mount / open
  useEffect(() => {
    if (!isOpen) return;
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setName(data.profile.name || 'Nikhitha');
            setEmail(data.profile.email || '');
            setTargetRole(data.profile.targetRole || 'SDE-1');
            setTargetCompanies(
              Array.isArray(data.profile.targetCompanies)
                ? data.profile.targetCompanies.join(', ')
                : 'Amazon, Microsoft, Google'
            );
            setSkills(
              Array.isArray(data.profile.skills)
                ? data.profile.skills.join(', ')
                : 'JavaScript, TypeScript, React'
            );
            setDailyStudyTarget(data.profile.dailyStudyTarget || 5);
            setGoalTitle(data.profile.goalTitle || 'Become SDE-1 interview ready');
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    fetchProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const companiesArray = targetCompanies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          targetRole: targetRole.trim(),
          targetCompanies: companiesArray,
          skills: skillsArray,
          dailyStudyTarget: Number(dailyStudyTarget),
          goalTitle: goalTitle.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Profile updated successfully!', 'success');
        onProfileUpdated?.();
      } else {
        showToast(data.error || 'Failed to update profile', 'error');
      }
    } catch {
      showToast('Error saving profile changes', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword.length < 8) {
      setPasswordMsg({ text: 'New password must be at least 8 characters long.', isError: true });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ text: 'New passwords do not match.', isError: true });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordMsg({ text: 'Password successfully changed!', isError: false });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        showToast('Password changed successfully', 'success');
      } else {
        setPasswordMsg({ text: data.error || 'Failed to change password.', isError: true });
      }
    } catch (err: any) {
      setPasswordMsg({ text: err.message || 'Error occurred.', isError: true });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch('/api/user/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast('Account deleted successfully', 'info');
        signOut({ callbackUrl: '/sign-in' });
      } else {
        showToast(data.error || 'Account deletion failed. Verify your password.', 'error');
        setIsDeleting(false);
        setIsConfirmDeleteOpen(false);
      }
    } catch {
      showToast('Error deleting account.', 'error');
      setIsDeleting(false);
      setIsConfirmDeleteOpen(false);
    }
  };

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'NK';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
              {initials}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>{name}</span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {targetRole}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                signOut({ callbackUrl: '/sign-in' });
              }}
              className="text-xs border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 py-1 px-2.5 h-auto flex items-center gap-1.5"
              title="Sign Out of Session"
            >
              <LogOut size={12} />
              <span>Sign Out</span>
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/20">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User size={14} />
            Developer Profile
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'password'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound size={14} />
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'danger'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-rose-300'
            }`}
          >
            <Trash2 size={14} />
            Danger Zone
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Account Email (Read-Only)
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full pl-9 pr-3 py-2 bg-slate-950/60 border border-slate-800/60 rounded-xl text-xs text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Target Role
                  </label>
                  <div className="relative">
                    <Target size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Amazon SDE-1"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Daily Study Target (Hours)
                  </label>
                  <div className="relative">
                    <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="16"
                      value={dailyStudyTarget}
                      onChange={(e) => setDailyStudyTarget(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Companies (comma-separated)
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={targetCompanies}
                    onChange={(e) => setTargetCompanies(e.target.value)}
                    placeholder="Amazon, Microsoft, Google, Uber"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Primary Tech Stack & Languages
                </label>
                <div className="relative">
                  <Code2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="JavaScript, TypeScript, React, Node.js, C++"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Overall Preparation Goal Title
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  placeholder="e.g. Become Amazon SDE-1 interview ready"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSavingProfile}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 flex items-center gap-2"
                >
                  <Save size={14} />
                  Save Profile Changes
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <p className="text-xs text-slate-400">
                Update your account password. All passwords are encrypted with bcrypt before storing.
              </p>

              {passwordMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    passwordMsg.isError
                      ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  {passwordMsg.isError ? (
                    <AlertCircle size={15} className="shrink-0" />
                  ) : (
                    <CheckCircle2 size={15} className="shrink-0" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isChangingPassword}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5"
                >
                  Change Password
                </Button>
              </div>
            </form>
          )}

          {activeTab === 'danger' && (
            <div className="space-y-6">
              {/* Sign out section */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Sign Out of Session</h4>
                  <p className="text-[11px] text-slate-400">
                    Securely clear your current login session across this browser.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                  className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <LogOut size={13} />
                  Sign Out
                </Button>
              </div>

              {/* Delete account section */}
              <div className="p-5 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <Trash2 size={14} />
                    Permanently Delete Account
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    Once you delete your account, there is no going back. All your tasks, DSA progress,
                    roadmap customization, ATS applications, and study records will be permanently removed.
                  </p>
                </div>

                <div className="max-w-sm space-y-2">
                  <label className="block text-[11px] font-medium text-slate-300">
                    Verify password to confirm deletion:
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter account password"
                    className="w-full px-3 py-2 bg-slate-950 border border-rose-900/60 rounded-xl text-xs text-white outline-none focus:border-rose-500"
                  />
                  <Button
                    type="button"
                    size="sm"
                    disabled={!deletePassword}
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="bg-rose-600 hover:bg-rose-500 text-white text-xs px-4 mt-2"
                  >
                    Delete My Account
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Account Deletion */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Permanently Delete Account?"
        description="Are you absolutely sure? All your personalized DSA progress, ATS applications, tasks, and notes will be permanently erased."
        confirmText="Yes, Permanently Delete"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
