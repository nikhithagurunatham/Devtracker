import React, { useState } from 'react';
import {
  FolderGit2,
  ExternalLink,
  Github,
  Plus,
  CheckSquare,
  Square,
  Bug,
  Sparkles,
  Edit2,
  Trash2,
  Calendar,
} from 'lucide-react';
import { ProjectItem, ProjectTaskItem } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { DevTrackStore } from '@/lib/storage';

export const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<ProjectItem[]>(DevTrackStore.getProjects());
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isBugTask, setIsBugTask] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [techStackInput, setTechStackInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [resumeBullet, setResumeBullet] = useState('');

  const reloadProjects = () => {
    const updated = DevTrackStore.getProjects();
    setProjects(updated);
    if (selectedProject) {
      const refreshed = updated.find((p) => p.id === selectedProject.id) || null;
      setSelectedProject(refreshed);
    }
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    DevTrackStore.toggleProjectTask(projectId, taskId);
    reloadProjects();
  };

  const handleAddTask = (projectId: string) => {
    if (!newTaskTitle.trim()) return;
    const proj = DevTrackStore.getProjectById(projectId);
    if (!proj) return;

    const newTask: ProjectTaskItem = {
      id: 'pt_' + Date.now(),
      title: newTaskTitle.trim(),
      isCompleted: false,
      isBug: isBugTask,
      isFeature: !isBugTask,
    };

    DevTrackStore.updateProject(projectId, {
      tasks: [...proj.tasks, newTask],
    });

    setNewTaskTitle('');
    setIsBugTask(false);
    reloadProjects();
  };

  const handleCreateProject = () => {
    if (!name.trim()) return;
    const techStack = techStackInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    DevTrackStore.addProject({
      name: name.trim(),
      description: description.trim(),
      techStack,
      githubUrl: githubUrl.trim() || undefined,
      liveUrl: liveUrl.trim() || undefined,
      startDate: new Date().toISOString().split('T')[0],
      resumeBullet: resumeBullet.trim() || undefined,
    });

    setIsCreateModalOpen(false);
    setName('');
    setDescription('');
    setTechStackInput('');
    setGithubUrl('');
    setLiveUrl('');
    setResumeBullet('');
    reloadProjects();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 size={22} className="text-violet-400" />
            <span>Portfolio Project & Production Tracker</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Build resume-worthy engineering systems with granular feature checklists and live URLs.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={16} />
          <span>New Project</span>
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {projects.map((project) => {
          return (
            <div
              key={project.id}
              className="p-5 bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-2xl flex flex-col justify-between transition-all shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">{project.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/30 whitespace-nowrap">
                    {project.progress}% Complete
                  </span>
                </div>

                {/* Tech Stack Badges */}
                <div className="flex flex-wrap gap-1.5 mt-3.5">
                  {project.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 bg-slate-950 text-slate-300 rounded-md border border-slate-800 font-mono"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 transition-all duration-300 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Tasks List */}
                <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Milestones & Tasks ({project.tasks.filter((t) => t.isCompleted).length} /{' '}
                    {project.tasks.length})
                  </h4>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {project.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleToggleTask(project.id, task.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          task.isCompleted
                            ? 'bg-slate-950/40 text-slate-500 line-through'
                            : 'bg-slate-950/80 hover:bg-slate-850 text-slate-200'
                        }`}
                      >
                        {task.isCompleted ? (
                          <CheckSquare size={14} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Square size={14} className="text-slate-500 flex-shrink-0" />
                        )}
                        <span className="truncate flex-1">{task.title}</span>
                        {task.isBug && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                            <Bug size={10} />
                            <span>Bug</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Task Input inside project card */}
                  <div className="flex items-center gap-2 mt-2 pt-2">
                    <input
                      type="text"
                      placeholder="Add milestone task or bug..."
                      value={selectedProject?.id === project.id ? newTaskTitle : ''}
                      onFocus={() => setSelectedProject(project)}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddTask(project.id);
                      }}
                      className="flex-1 px-2.5 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    />
                    <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBugTask}
                        onChange={(e) => setIsBugTask(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-rose-500"
                      />
                      <span>Bug</span>
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddTask(project.id)}
                      className="text-xs !py-1"
                    >
                      <Plus size={12} />
                      <span>Add</span>
                    </Button>
                  </div>
                </div>

                {/* Resume bullet highlight */}
                {project.resumeBullet && (
                  <div className="mt-4 p-3 bg-violet-950/20 border border-violet-500/20 rounded-xl text-xs text-violet-300">
                    <span className="font-semibold block mb-0.5 text-violet-200">
                      📄 Resume Bullet:
                    </span>
                    &ldquo;{project.resumeBullet}&rdquo;
                  </div>
                )}
              </div>

                {/* Links Footer */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <Github size={13} />
                      <span>GitHub</span>
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>Live Demo</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    DevTrackStore.deleteProject(project.id);
                    reloadProjects();
                  }}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="Delete project"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Portfolio Project"
        subtitle="Track feature sprints, bugs, documentation, and resume bullets"
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleCreateProject}>
              Create Project
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <Input
            label="Project Name *"
            placeholder="e.g. Employee Offboarding Automation"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Description</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              placeholder="Enterprise platform to automate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Input
            label="Tech Stack (comma-separated)"
            placeholder="React, Node.js, Express, MongoDB, Docker"
            value={techStackInput}
            onChange={(e) => setTechStackInput(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/..."
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />
            <Input
              label="Live Deployment URL"
              placeholder="https://myapp.vercel.app"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Resume Description Bullet</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
              placeholder="Architected an automated employee offboarding platform reducing IT deprovisioning time by 75%..."
              value={resumeBullet}
              onChange={(e) => setResumeBullet(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
