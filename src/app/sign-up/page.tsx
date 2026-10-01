'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  KeyRound,
  AlertCircle,
  Wand2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Amazon SDE-1');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Post registration summary modal
  const [createdAccount, setCreatedAccount] = useState<{
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // --- Real-time Validation Checks ---
  const validation = useMemo(() => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    const rulesPassed = [
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
    ].filter(Boolean).length;

    // Matching check
    const isMatching = confirmPassword.length > 0 && password === confirmPassword;
    const isMismatch = confirmPassword.length > 0 && password !== confirmPassword;

    // Strength
    let strengthLabel = 'Too Short';
    let strengthColor = 'bg-rose-500';
    let strengthScore = 15;

    if (password.length >= 8) {
      if (rulesPassed <= 2) {
        strengthLabel = 'Weak';
        strengthColor = 'bg-rose-500';
        strengthScore = 35;
      } else if (rulesPassed === 3) {
        strengthLabel = 'Fair';
        strengthColor = 'bg-amber-500';
        strengthScore = 60;
      } else if (rulesPassed === 4) {
        strengthLabel = 'Good';
        strengthColor = 'bg-indigo-500';
        strengthScore = 80;
      } else if (rulesPassed === 5) {
        strengthLabel = 'Strong & Secure';
        strengthColor = 'bg-emerald-500';
        strengthScore = 100;
      }
    }

    const isValid = hasMinLength && (hasUppercase || hasLowercase) && hasNumber && isMatching;

    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      rulesPassed,
      isMatching,
      isMismatch,
      strengthLabel,
      strengthColor,
      strengthScore,
      isValid,
    };
  }, [password, confirmPassword]);

  // Email format check
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Generate a guaranteed valid strong password
  const handleGenerateStrongPassword = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const suggested = `DevTrack#${randomNum}!`;
    setPassword(suggested);
    setConfirmPassword(suggested);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isEmailValid) {
      setError('Please provide a valid email address (e.g., name@example.com).');
      return;
    }

    if (!validation.hasMinLength) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (!agreeTerms) {
      setError('Please acknowledge the terms of use.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Call backend registration API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          targetRole,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Registration failed. An account with this email may already exist.');
        setLoading(false);
        return;
      }

      // Store created account credentials to show user clear confirmation
      setCreatedAccount({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      setLoading(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to create account. Please check network connection.');
      setLoading(false);
    }
  };

  const handleProceedToLogin = async () => {
    if (!createdAccount) return;
    setLoading(true);
    try {
      const loginRes = await signIn('credentials', {
        redirect: false,
        email: createdAccount.email,
        password: createdAccount.password,
      });

      if (loginRes?.error) {
        router.push('/sign-in?registered=true');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (e) {
      router.push('/sign-in?registered=true');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-indigo-500 text-slate-950 font-black text-2xl shadow-xl shadow-indigo-500/20 mb-2 ring-1 ring-white/20">
            D
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            Create DevTrack Account
          </h1>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            Personalize your SDE-1 roadmap, DSA knowledge tree, and ATS pipeline
          </p>
        </div>

        {/* REGISTRATION FORM CARD */}
        <div className="p-6 md:p-8 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl space-y-5 ring-1 ring-slate-800/80">
          {error && (
            <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={15} className="text-rose-400 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Full Name *</label>
                {name.trim().length >= 2 && (
                  <span className="text-[10px] text-emerald-400">✓ Good</span>
                )}
              </div>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nikhitha"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Email Address *</label>
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
                  onChange={(e) => setEmail(e.target.value)}
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

            {/* Password Field with Generator button */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Password *
                </label>

                {/* Quick Auto-Generate Password Helper */}
                <button
                  type="button"
                  onClick={handleGenerateStrongPassword}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  title="Generate a valid strong password"
                >
                  <Wand2 size={12} />
                  <span>Generate Strong Password</span>
                </button>
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password (min 8 chars)"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password Strength:</span>
                    <span className="font-bold text-white font-mono">
                      {validation.strengthLabel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${validation.strengthColor} transition-all duration-300`}
                      style={{ width: `${validation.strengthScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* LIVE PASSWORD REQUIREMENTS CHECKLIST */}
              <div className="mt-2.5 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl space-y-1.5 text-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                  Password Requirements:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      validation.hasMinLength ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {validation.hasMinLength ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-slate-600 shrink-0" />
                    )}
                    <span>At least 8 characters</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      validation.hasNumber ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {validation.hasNumber ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-slate-600 shrink-0" />
                    )}
                    <span>At least 1 number (0-9)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      validation.hasUppercase ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {validation.hasUppercase ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-slate-600 shrink-0" />
                    )}
                    <span>1 uppercase letter (A-Z)</span>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 transition-colors ${
                      validation.hasSpecial ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                    }`}
                  >
                    {validation.hasSpecial ? (
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle size={13} className="text-slate-600 shrink-0" />
                    )}
                    <span>1 special symbol (!@#$)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Confirm Password *
                </label>
                {confirmPassword && (
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      validation.isMatching ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {validation.isMatching ? (
                      <>
                        <CheckCircle2 size={12} />
                        <span>Passwords match</span>
                      </>
                    ) : (
                      <>
                        <XCircle size={12} />
                        <span>Passwords do not match yet</span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-950 border rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all font-mono ${
                    confirmPassword
                      ? validation.isMatching
                        ? 'border-emerald-500 focus:border-emerald-500'
                        : 'border-rose-500/60 focus:border-rose-500'
                      : 'border-slate-800 focus:border-indigo-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Target Role Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Engineering Role
              </label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="Amazon SDE-1">Amazon SDE-1</option>
                <option value="Google L3 Software Engineer">Google L3 Software Engineer</option>
                <option value="Microsoft SWE">Microsoft SWE</option>
                <option value="Full-Stack Developer">Full-Stack Developer</option>
                <option value="Frontend Engineer (React/Next.js)">Frontend Engineer (React/Next.js)</option>
                <option value="Backend Engineer (Node/Java/Go)">Backend Engineer (Node/Java/Go)</option>
              </select>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 mt-0.5 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                />
                <span className="text-[11px] text-slate-400 leading-snug">
                  I agree to DevTrack AI terms and initialize my personalized 100-day preparation roadmap.
                </span>
              </label>
            </div>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>Create Account</span>
              <ArrowRight size={14} />
            </Button>
          </form>

          <div className="text-center pt-2 border-t border-slate-800/80">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                href="/sign-in"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Sign In to Dashboard →
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

      {/* REGISTRATION SUCCESS MODAL: Clear summary of created credentials */}
      {createdAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Account Created Successfully!</h3>
                <p className="text-xs text-slate-400">
                  Your DevTrack AI developer account is ready.
                </p>
              </div>
            </div>

            {/* Clear Credentials Box */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Your Login Credentials:
              </span>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-white font-semibold select-all">
                    {createdAccount.email}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Password:</span>
                  <span className="font-mono text-emerald-400 font-bold select-all">
                    {createdAccount.password}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              We have set up your 100-day preparation roadmap and initial study metrics. You can sign in immediately below.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Email: ${createdAccount.email}\nPassword: ${createdAccount.password}`
                  );
                  setCopiedCreds(true);
                  setTimeout(() => setCopiedCreds(false), 2000);
                }}
                className="py-2.5 px-3 text-xs font-semibold rounded-xl bg-slate-950 text-slate-300 hover:text-white border border-slate-800 transition-colors flex items-center gap-1.5"
              >
                {copiedCreds ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copiedCreds ? 'Copied!' : 'Copy Credentials'}</span>
              </button>

              <Button
                variant="primary"
                onClick={handleProceedToLogin}
                isLoading={loading}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs shadow-lg shadow-emerald-600/30"
              >
                <span>Sign In Directly</span>
                <ArrowRight size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
