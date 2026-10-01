'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import {
  Sparkles,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  AlertCircle,
  HelpCircle,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const wasRegistered = searchParams.get('registered') === 'true';

  const { data: session } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<'email' | 'password' | null>(null);

  // Password reset modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const DEMO_EMAIL = 'nikhitha.dev@example.com';
  const DEMO_PASSWORD = 'password123';

  // Email format check
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleCopy = (text: string, field: 'email' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFillCredentials = () => {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setShowPassword(true);
    setError('');
  };

  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setError('');
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });

      if (res?.error) {
        setError('Demo access failed. Please try typing credentials manually.');
        setLoading(false);
      } else {
        window.location.href = callbackUrl || '/';
      }
    } catch (err: any) {
      setError('Quick access failed. Please check network connection.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your email address and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError(
          'Incorrect password or email. For standard candidate access, use password: password123 or click "Auto-Fill Credentials" below.'
        );
        setLoading(false);
      } else {
        window.location.href = callbackUrl || '/';
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetMsg('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();
      setResetMsg(data.message || 'Password reset instructions have been sent.');
    } catch {
      setResetMsg('Password reset initiated. Check your inbox.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 text-slate-950 font-black text-2xl shadow-xl shadow-indigo-500/20 mb-2 ring-1 ring-white/20">
            D
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            DevTrack <span className="text-indigo-400 font-mono">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            Your personal developer operating system — DSA tree, 100-day roadmap, tasks & ATS tracker
          </p>
        </div>

        {/* Auth Card */}
        <div className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-5 ring-1 ring-slate-800/80">
          {/* Post-Registration Success Banner */}
          {wasRegistered && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span>
                Account created successfully! Please sign in with your email and password below.
              </span>
            </div>
          )}

          {/* Active Session Indicator & Quick Switch/Sign Out */}
          {session?.user && (
            <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 text-xs flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px] mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Currently Signed In</span>
                </div>
                <p className="font-bold text-white truncate text-xs">{session.user.name}</p>
                <p className="text-[10px] text-slate-400 truncate font-mono">{session.user.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = callbackUrl || '/';
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs py-1 px-3 h-auto"
                >
                  Dashboard →
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/sign-in' })}
                  className="border-rose-500/40 text-rose-300 hover:bg-rose-950/40 text-xs py-1 px-2.5 h-auto flex items-center gap-1"
                >
                  <LogOut size={12} />
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {/* CLEAR CREDENTIALS REFERENCE BOX */}
          <div className="p-4 bg-indigo-950/40 border border-indigo-500/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <KeyRound size={14} className="text-indigo-400" />
                Default Candidate Credentials
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Verified
              </span>
            </div>

            <div className="space-y-1.5 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800/90">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Email:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-white select-all">{DEMO_EMAIL}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEMO_EMAIL, 'email')}
                    className="text-slate-400 hover:text-indigo-400 p-0.5"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-emerald-400 font-bold select-all">
                    {DEMO_PASSWORD}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(DEMO_PASSWORD, 'password')}
                    className="text-slate-400 hover:text-indigo-400 p-0.5"
                    title="Copy Password"
                  >
                    {copiedField === 'password' ? (
                      <Check size={12} className="text-emerald-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Fill & 1-Click Login Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleFillCredentials}
                className="py-2 px-3 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-850 text-indigo-300 border border-slate-700/80 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Fill Credentials</span>
              </button>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full text-xs font-semibold !py-2 bg-indigo-600 hover:bg-indigo-500 shadow-sm"
              >
                <Sparkles size={13} />
                <span>1-Click Sign In</span>
              </Button>
            </div>
          </div>

          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 absolute">
              or enter manually
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={15} className="text-rose-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address</label>
                {email && (
                  <span
                    className={`text-[10px] flex items-center gap-1 ${
                      isEmailValid ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {isEmailValid ? '✓ Valid format' : 'Enter valid email'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="e.g. nikhitha.dev@example.com"
                  required
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all ${
                    email && isEmailValid
                      ? 'border-emerald-500/50 focus:border-emerald-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter your password (e.g. password123)"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                />
                <span className="text-xs text-slate-400">Remember session (30 days)</span>
              </label>

              {password && (
                <span className="text-[10px] text-slate-500 font-mono">
                  {password.length} characters
                </span>
              )}
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight size={14} />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Need a new account?{' '}
              <Link
                href="/sign-up"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create Account (with Password Requirements) →
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck size={14} className="text-indigo-400/80" />
          <span>Encrypted with bcrypt & secure JWT session authentication</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle size={16} className="text-indigo-400" />
              <span>Password Recovery Help</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you are using the default demo candidate account, the password is{' '}
              <code className="px-1.5 py-0.5 rounded bg-slate-950 text-indigo-300 font-mono font-bold">
                password123
              </code>
              . For custom accounts, enter your email below to send a reset link:
            </p>
            {resetMsg && (
              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
                {resetMsg}
              </div>
            )}
            <form onSubmit={handleResetPassword} className="space-y-3">
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="developer@example.com"
                required
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowForgotModal(false)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={resetLoading}
                  className="bg-indigo-600 text-xs"
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-mono text-xs">
          Loading DevTrack AI...
        </div>
      }
    >
      <SignInForm />
    </React.Suspense>
  );
}
