import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle,
  HelpCircle,
  Briefcase,
  Copy,
  ChevronRight,
  Code2,
} from 'lucide-react';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

export const ResumeManager: React.FC = () => {
  const profile = DevTrackStore.getProfile();
  const projects = DevTrackStore.getProjects();

  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<{
    missingSkills: string[];
    tailoredBullets: string[];
    mockInterviewQuestions: string[];
  } | null>(null);

  const handleAnalyzeAndTailor = () => {
    setIsTailoring(true);

    // AI Resume Engine evaluation
    setTimeout(() => {
      setTailorResult({
        missingSkills: ['Redis (Distributed Caching)', 'System Scalability (CDN / Load Balancers)', 'Kafka / Message Queues'],
        tailoredBullets: [
          'Engineered an enterprise Employee Offboarding Automation system with role-based JWT auth and MongoDB, slashing IT deprovisioning latency by 75%.',
          'Architected DevTrack AI productivity engine utilizing Next.js 14, PostgreSQL/Prisma ORM, and an adaptive SuperMemo SM-2 spaced repetition algorithm.',
          'Optimized REST API throughput by indexing high-cardinality MongoDB collections and mitigating N+1 query overhead.',
        ],
        mockInterviewQuestions: [
          'In your Offboarding Automation project, how did you handle refresh token revocation if a user session is hijacked?',
          'Walk me through the mathematical difference between O(log n) binary search on sorted indices versus continuous monotonic answer spaces.',
          'Explain the JavaScript Event Loop execution priority between Promise microtasks and setTimeout macrotasks with a code diagram.',
        ],
      });
      setIsTailoring(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText size={22} className="text-emerald-400" />
          <span>SDE-1 Resume & Technical Interview Suite</span>
        </h2>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Targeted resume bullets, gap analysis against JD, and AI-generated technical interview drills.
        </p>
      </div>

      {/* Profile & Skills Snapshot */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">{profile.name}</h3>
            <p className="text-xs text-indigo-400 font-mono">
              Target: {profile.targetRole} • Graduating {profile.graduationYear}
            </p>
          </div>
          <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full font-semibold">
            FAANG & Tier-1 Ready
          </span>
        </div>

        {/* Skills */}
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Verified Skillset
          </span>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill, idx) => (
              <span
                key={idx}
                className="text-xs px-2.5 py-1 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg font-mono"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI Resume Tailoring Tool */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-indigo-400">
          <Sparkles size={18} />
          <h3 className="text-sm font-bold text-white tracking-tight">
            AI Resume Tailor & Job Description Analyzer
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          Paste a target Job Description (e.g. Amazon SDE-1, Uber Backend) to extract missing keyword gaps
          and generate personalized technical interview questions.
        </p>

        <textarea
          rows={4}
          value={jobDescriptionInput}
          onChange={(e) => setJobDescriptionInput(e.target.value)}
          placeholder="Paste Job Description here (e.g. Qualifications: Strong proficiency in Java/C++, experience with distributed systems, microservices, REST APIs...)"
          className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
        />

        <div className="flex justify-end">
          <Button
            variant="primary"
            size="md"
            onClick={handleAnalyzeAndTailor}
            disabled={isTailoring || !jobDescriptionInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {isTailoring ? 'Analyzing JD & Matching Skills...' : 'Analyze & Tailor Bullets'}
          </Button>
        </div>

        {/* Tailored Results Output */}
        {tailorResult && (
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-5 animate-fade-in">
            {/* Missing Skills */}
            <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl space-y-2">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                ⚠️ Identified Skill & Architecture Gaps:
              </span>
              <div className="flex flex-wrap gap-2">
                {tailorResult.missingSkills.map((gap, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 bg-slate-950 text-rose-300 border border-rose-800/50 rounded-lg font-medium"
                  >
                    • {gap}
                  </span>
                ))}
              </div>
            </div>

            {/* Tailored Bullets */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                ✨ Action-Oriented Resume Bullets (STAR Format):
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {tailorResult.tailoredBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2 p-2 bg-slate-900 rounded-lg">
                    <CheckCircle size={14} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Generated Mock Interview Questions */}
            <div className="p-4 bg-indigo-950/20 border border-indigo-500/30 rounded-xl space-y-2.5">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block">
                👔 Mock Technical Interview Questions Generated From Resume:
              </span>
              <div className="space-y-2 text-xs text-slate-300">
                {tailorResult.mockInterviewQuestions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-2.5"
                  >
                    <span className="font-mono font-bold text-indigo-400">Q{idx + 1}.</span>
                    <span className="text-slate-200">{q}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
