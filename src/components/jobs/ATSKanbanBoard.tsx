import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  ExternalLink,
  Calendar,
  AlertCircle,
  Clock,
  Building,
  UserCheck,
  CheckCircle,
  XCircle,
  Filter,
  DollarSign,
  Tag,
} from 'lucide-react';
import { JobApplicationItem, JobListing, JobStatus } from '@/types';
import { DevTrackStore } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';

export const ATSKanbanBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'kanban' | 'saved_jobs'>('kanban');
  const [applications, setApplications] = useState<JobApplicationItem[]>(
    DevTrackStore.getJobApplications()
  );
  const [savedJobs, setSavedJobs] = useState<JobListing[]>(
    DevTrackStore.getSavedJobListings()
  );

  const [selectedApp, setSelectedApp] = useState<JobApplicationItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Application form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Bangalore');
  const [jobUrl, setJobUrl] = useState('');
  const [source, setSource] = useState('LinkedIn');
  const [referralName, setReferralName] = useState('');
  const [status, setStatus] = useState<JobStatus>('APPLIED');
  const [salary, setSalary] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  const reloadData = () => {
    setApplications(DevTrackStore.getJobApplications());
    setSavedJobs(DevTrackStore.getSavedJobListings());
  };

  const handleUpdateStatus = (appId: string, nextStatus: JobStatus) => {
    DevTrackStore.updateJobApplication(appId, { status: nextStatus });
    reloadData();
  };

  const handleCreateApplication = () => {
    if (!company.trim() || !role.trim()) return;

    DevTrackStore.addJobApplication({
      company: company.trim(),
      role: role.trim(),
      location: location.trim(),
      jobUrl: jobUrl.trim() || undefined,
      applicationDate: new Date().toISOString().split('T')[0],
      source: source.trim(),
      referralName: referralName.trim() || undefined,
      status,
      salary: salary.trim() || undefined,
      followUpDate: followUpDate || undefined,
      notes: notes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setCompany('');
    setRole('');
    setJobUrl('');
    setReferralName('');
    setSalary('');
    setNotes('');
    reloadData();
  };

  // 5 core ATS Columns
  const kanbanColumns: { status: JobStatus; label: string; color: string }[] = [
    { status: 'WISHLIST', label: 'Wishlist', color: 'border-slate-700' },
    { status: 'APPLIED', label: 'Applied', color: 'border-blue-500/40' },
    { status: 'OA', label: 'Online Assessment', color: 'border-cyan-500/40' },
    { status: 'INTERVIEW', label: 'Interviews', color: 'border-indigo-500/40' },
    { status: 'OFFER', label: 'Offer Received 🎉', color: 'border-emerald-500/40' },
  ];

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase size={22} className="text-blue-400" />
            <span>ATS Job Application Pipeline</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Track interview rounds, follow-up alerts, salary ranges, and referral checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'kanban' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('kanban')}
          >
            Pipeline Board
          </Button>
          <Button
            variant={activeTab === 'saved_jobs' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('saved_jobs')}
          >
            Saved Job Listings ({savedJobs.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-500"
          >
            <Plus size={15} />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {activeTab === 'kanban' ? (
        /* ATS Kanban Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start">
          {kanbanColumns.map((col) => {
            const colApps = applications.filter((a) => {
              if (col.status === 'INTERVIEW') {
                return (
                  a.status === 'INTERVIEW' ||
                  a.status === 'TECHNICAL_ROUND' ||
                  a.status === 'HR_ROUND'
                );
              }
              return a.status === col.status;
            });

            return (
              <div
                key={col.status}
                className={`bg-slate-900/60 border ${col.color} rounded-2xl p-3.5 min-h-[480px] flex flex-col gap-3 shadow-md`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {col.label}
                  </h3>
                  <span className="text-xs font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {colApps.length}
                  </span>
                </div>

                {/* Applications inside Column */}
                <div className="space-y-2.5 flex-1">
                  {colApps.map((app) => {
                    const isFollowUpDue = app.followUpDate && app.followUpDate <= todayStr;

                    return (
                      <div
                        key={app.id}
                        className="p-3.5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-xl space-y-2.5 transition-all shadow-sm group"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <h4 className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">
                              {app.company}
                            </h4>
                            <p className="text-[11px] text-slate-300 font-medium">{app.role}</p>
                          </div>
                          {app.jobUrl && (
                            <a
                              href={app.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-white"
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </div>

                        {app.salary && (
                          <div className="text-[11px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                            <DollarSign size={11} />
                            <span>{app.salary}</span>
                          </div>
                        )}

                        {/* Badges / Details */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-400">
                          <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                            {app.source}
                          </span>
                          {app.referralName && (
                            <span className="bg-indigo-950/40 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                              Ref: {app.referralName}
                            </span>
                          )}
                        </div>

                        {/* Follow up alert */}
                        {isFollowUpDue && (
                          <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-300 flex items-center gap-1 font-medium">
                            <AlertCircle size={11} />
                            <span>Follow-up Due Today!</span>
                          </div>
                        )}

                        {/* Interview Date alert */}
                        {app.interviewDate && (
                          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded text-[10px] text-indigo-300 flex items-center gap-1 font-mono">
                            <Calendar size={11} />
                            <span>Interview: {app.interviewDate}</span>
                          </div>
                        )}

                        {/* Status Mover Quick Buttons */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <select
                            value={app.status}
                            onChange={(e) => handleUpdateStatus(app.id, e.target.value as JobStatus)}
                            className="bg-slate-950 text-slate-300 text-[10px] px-2 py-1 rounded border border-slate-800 cursor-pointer"
                          >
                            <option value="WISHLIST">Wishlist</option>
                            <option value="APPLIED">Applied</option>
                            <option value="OA">OA</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="REJECTED">Rejected</option>
                          </select>

                          <button
                            onClick={() => {
                              DevTrackStore.deleteJobApplication(app.id);
                              reloadData();
                            }}
                            className="text-slate-500 hover:text-rose-400 text-[10px]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {colApps.length === 0 && (
                    <div className="py-12 text-center text-xs text-slate-600">No applications</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Saved Job Listings */
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
            <span>
              Save and organize prospective job listings with salary bands, tech stack, and deadlines.
            </span>
            <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              DEMO DATA LABELED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {savedJobs.map((job) => (
              <div
                key={job.id}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{job.company}</h4>
                    <p className="text-xs text-slate-300 mt-0.5">{job.role}</p>
                    <p className="text-[11px] text-slate-400">{job.location} • {job.workplaceType}</p>
                  </div>
                  {job.isDemoData && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
                      DEMO DATA
                    </span>
                  )}
                </div>

                {job.salaryRange && (
                  <div className="text-xs font-mono font-semibold text-emerald-400">
                    💰 {job.salaryRange}
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {job.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-slate-400 rounded border border-slate-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">
                    Deadline: {job.deadline || 'Rolling'}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      DevTrackStore.addJobApplication({
                        company: job.company,
                        role: job.role,
                        location: job.location,
                        applicationDate: new Date().toISOString().split('T')[0],
                        source: 'Saved Listing',
                        status: 'APPLIED',
                        salary: job.salaryRange,
                      });
                      reloadData();
                      setActiveTab('kanban');
                    }}
                    className="text-xs !py-1"
                  >
                    Move to Applied
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Job Application Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Job Application"
        subtitle="Track company, role, recruiter follow-up, and ATS stage"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateApplication}>
              Save Application
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Company Name *"
              placeholder="e.g. Amazon, Google, Uber"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              autoFocus
            />
            <Input
              label="Role Title *"
              placeholder="e.g. SDE-1 (Fullstack)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              label="Location"
              placeholder="Bangalore, Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="Salary / CTC"
              placeholder="₹22 - 28 LPA"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Initial Status</label>
              <select
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
              >
                <option value="WISHLIST">Wishlist</option>
                <option value="APPLIED">Applied</option>
                <option value="REFERRED">Referred</option>
                <option value="OA">Online Assessment</option>
                <option value="INTERVIEW">Interview Round</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Source"
              placeholder="LinkedIn, Referral, Career Page"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
            <Input
              label="Referral Name (Optional)"
              placeholder="e.g. Rohan Mehra (SDE-2)"
              value={referralName}
              onChange={(e) => setReferralName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="Job Listing URL"
              placeholder="https://..."
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
            />
            <Input
              label="Follow-up Date"
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Notes / Recruiter details</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              placeholder="Spoke with recruiter Priya Sengupta, OA HackerRank invite expected..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
