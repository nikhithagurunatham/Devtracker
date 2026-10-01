import {
  Task,
  Problem,
  DSATopic,
  DSAPattern,
  WebDevTopic,
  ProjectItem,
  HabitItem,
  MoodEntry,
  JobApplicationItem,
  JobListing,
  StudySessionItem,
  UserProfile,
  RoadmapDayItem,
  AIMessageItem,
  DailyScheduleSlot,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  JobStatus,
  ProblemStatus,
} from '@/types';
import {
  initialUserProfile,
  initialRoadmapDays,
  initialDSATopics,
  initialDSAPatterns,
  initialProblems,
  initialTasks,
  initialProjects,
  initialWebDevTopics,
  initialHabits,
  initialMoodLogs,
  initialJobApplications,
  initialSavedJobListings,
  initialStudySessions,
} from './sample-data';
import { calculateNextRevision } from './spaced-repetition';

const STORAGE_KEY_PREFIX = 'devtrack_ai_v2_';

export class DevTrackStore {
  private static serverMemoryStore: Record<string, string> = {};

  private static isClient(): boolean {
    if (typeof window !== 'undefined') {
      // Clear legacy v1 keys once so all user data starts from absolute zero
      if (!localStorage.getItem('devtrack_ai_v2_initialized')) {
        try {
          Object.keys(localStorage).forEach((key) => {
            if (key.startsWith('devtrack_ai_v1_')) {
              localStorage.removeItem(key);
            }
          });
          localStorage.setItem('devtrack_ai_v2_initialized', 'true');
        } catch (e) {
          // ignore
        }
      }
      return true;
    }
    return false;
  }

  private static load<T>(key: string, fallback: T): T {
    if (!this.isClient()) {
      return this.serverMemoryStore[key] ? JSON.parse(this.serverMemoryStore[key]) : fallback;
    }
    try {
      const data = localStorage.getItem(STORAGE_KEY_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      console.error(`Error loading ${key} from storage:`, e);
      return fallback;
    }
  }

  private static save<T>(key: string, data: T): void {
    if (!this.isClient()) {
      this.serverMemoryStore[key] = JSON.stringify(data);
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
      // Dispatch custom event for reactive UI updates across tabs/components
      window.dispatchEvent(new CustomEvent('devtrack_store_updated', { detail: { key } }));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // --- USER PROFILE ---
  static getProfile(): UserProfile {
    const profile = this.load('profile', initialUserProfile);
    if (profile && (profile.name?.toLowerCase().includes('nikhil') || !profile.name)) {
      profile.name = 'Nikhitha';
      profile.email = 'nikhitha.dev@example.com';
      this.save('profile', profile);
    }
    return profile;
  }

  static updateProfile(partial: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...partial };
    this.save('profile', updated);
    return updated;
  }

  // --- ROADMAP ---
  static getRoadmapDays(): RoadmapDayItem[] {
    return this.load('roadmap_days', initialRoadmapDays);
  }

  static updateRoadmapDay(dayNumber: number, partial: Partial<RoadmapDayItem>): RoadmapDayItem[] {
    const days = this.getRoadmapDays();
    const updated = days.map((d) => (d.dayNumber === dayNumber ? { ...d, ...partial } : d));
    this.save('roadmap_days', updated);
    if (partial.isCompleted) {
      const profile = this.getProfile();
      if (!profile.currentStreak || profile.currentStreak === 0) {
        this.updateProfile({ currentStreak: 1, longestStreak: Math.max(1, profile.longestStreak || 0) });
      }
    }
    return updated;
  }

  // --- TASKS (FULL CRUD + BULK + DUPLICATE) ---
  static getTasks(): Task[] {
    return this.load('tasks', initialTasks);
  }

  static getTaskById(id: string): Task | undefined {
    return this.getTasks().find((t) => t.id === id);
  }

  static addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Task {
    const tasks = this.getTasks();
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: this.getProfile().id,
      createdAt: now,
      updatedAt: now,
    };
    tasks.unshift(newTask);
    this.save('tasks', tasks);
    return newTask;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const tasks = this.getTasks();
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const current = tasks[idx];
    const updated: Task = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.status === 'COMPLETED' && current.status !== 'COMPLETED') {
      updated.completedAt = new Date().toISOString();
    } else if (updates.status && updates.status !== 'COMPLETED') {
      updated.completedAt = undefined;
    }

    tasks[idx] = updated;
    this.save('tasks', tasks);
    return updated;
  }

  static deleteTask(id: string): boolean {
    const tasks = this.getTasks();
    const filtered = tasks.filter((t) => t.id !== id);
    if (filtered.length !== tasks.length) {
      this.save('tasks', filtered);
      return true;
    }
    return false;
  }

  static duplicateTask(id: string): Task | null {
    const original = this.getTaskById(id);
    if (!original) return null;

    const { id: _, createdAt: __, updatedAt: ___, ...rest } = original;
    return this.addTask({
      ...rest,
      title: `${original.title} (Copy)`,
      status: 'TODO',
    });
  }

  static bulkCompleteTasks(ids: string[]): void {
    const tasks = this.getTasks();
    const now = new Date().toISOString();
    const idSet = new Set(ids);
    const updated = tasks.map((t) =>
      idSet.has(t.id) ? { ...t, status: 'COMPLETED' as TaskStatus, completedAt: now, updatedAt: now } : t
    );
    this.save('tasks', updated);
  }

  static bulkDeleteTasks(ids: string[]): void {
    const tasks = this.getTasks();
    const idSet = new Set(ids);
    const filtered = tasks.filter((t) => !idSet.has(t.id));
    this.save('tasks', filtered);
  }

  static bulkUpdatePriority(ids: string[], priority: TaskPriority): void {
    const tasks = this.getTasks();
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    const updated = tasks.map((t) =>
      idSet.has(t.id) ? { ...t, priority, updatedAt: now } : t
    );
    this.save('tasks', updated);
  }

  static bulkUpdateCategory(ids: string[], category: TaskCategory): void {
    const tasks = this.getTasks();
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    const updated = tasks.map((t) =>
      idSet.has(t.id) ? { ...t, category, updatedAt: now } : t
    );
    this.save('tasks', updated);
  }

  static bulkUpdateDueDate(ids: string[], dueDate: string): void {
    const tasks = this.getTasks();
    const idSet = new Set(ids);
    const now = new Date().toISOString();
    const updated = tasks.map((t) =>
      idSet.has(t.id) ? { ...t, dueDate, updatedAt: now } : t
    );
    this.save('tasks', updated);
  }

  // --- DSA TOPICS & PATTERNS ---
  static getDSATopics(): DSATopic[] {
    const rawTopics = this.load('dsa_topics', initialDSATopics);
    const problems = this.getProblems();
    return rawTopics.map((topic) => {
      const topicProblems = problems.filter(
        (p) => p.topicId === topic.id || p.topicName?.toLowerCase() === topic.name.toLowerCase()
      );
      const solved = topicProblems.filter((p) => p.status === 'SOLVED' || p.status === 'MASTERED');
      const avgConfidence =
        solved.length > 0
          ? Math.round(solved.reduce((sum, p) => sum + p.confidence, 0) / solved.length)
          : 0;
      return {
        ...topic,
        problemsCount: topicProblems.length > 0 ? topicProblems.length : topic.problemsCount,
        solvedCount: solved.length,
        confidence: avgConfidence,
      };
    });
  }

  static updateDSATopic(id: string, updates: Partial<DSATopic>): void {
    const topics = this.load('dsa_topics', initialDSATopics);
    const updated = topics.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.save('dsa_topics', updated);
  }

  static addDSATopic(topicData: Partial<DSATopic> & { name: string }): DSATopic {
    const topics = this.load('dsa_topics', initialDSATopics);
    const slug =
      topicData.slug ||
      topicData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') ||
      `topic-${Date.now()}`;
    const newTopic: DSATopic = {
      id: 'top_' + Date.now(),
      name: topicData.name,
      slug: slug,
      category: topicData.category || 'DSA',
      progressionLevel: topicData.progressionLevel || 'BEGINNER',
      section: topicData.section || 'FOUNDATION',
      description: topicData.description || '',
      theory: topicData.theory || '',
      templates: topicData.templates || '',
      timeComplexity: topicData.timeComplexity || '',
      spaceComplexity: topicData.spaceComplexity || '',
      patternsCount: topicData.patternsCount || 1,
      problemsCount: Number(topicData.problemsCount) || 0,
      solvedCount: 0,
      confidence: 0,
    };
    topics.push(newTopic);
    this.save('dsa_topics', topics);
    return newTopic;
  }

  static deleteDSATopic(id: string): void {
    const topics = this.load('dsa_topics', initialDSATopics);
    const updated = topics.filter((t) => t.id !== id);
    this.save('dsa_topics', updated);
  }

  static getDSAPatterns(): DSAPattern[] {
    return this.load('dsa_patterns', initialDSAPatterns);
  }

  // --- PROBLEMS & SPACED REPETITION ---
  static getProblems(): Problem[] {
    return this.load('problems', initialProblems);
  }

  static getProblemById(id: string): Problem | undefined {
    return this.getProblems().find((p) => p.id === id);
  }

  static addProblem(problem: Omit<Problem, 'id' | 'attemptsCount'>): Problem {
    const problems = this.getProblems();
    const newProblem: Problem = {
      ...problem,
      id: 'prob_' + Date.now(),
      attemptsCount: 0,
    };
    problems.unshift(newProblem);
    this.save('problems', problems);
    return newProblem;
  }

  static updateProblem(id: string, updates: Partial<Problem>): Problem | null {
    const problems = this.getProblems();
    const idx = problems.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const current = problems[idx];
    let nextRevisionAt = current.nextRevisionAt;

    // If confidence or status was updated to SOLVED/MASTERED, calculate adaptive spaced repetition
    if (updates.confidence !== undefined || updates.status === 'SOLVED' || updates.status === 'MASTERED') {
      const conf = updates.confidence ?? current.confidence;
      const sr = calculateNextRevision(conf, current.attemptsCount);
      nextRevisionAt = sr.nextRevisionDate;
    }

    const updated: Problem = {
      ...current,
      ...updates,
      nextRevisionAt: updates.nextRevisionAt ?? nextRevisionAt,
      lastAttemptedAt: updates.status ? new Date().toISOString() : current.lastAttemptedAt,
      attemptsCount: updates.status && updates.status !== current.status ? current.attemptsCount + 1 : current.attemptsCount,
    };

    problems[idx] = updated;
    this.save('problems', problems);

    // Update topic lastStudiedDate and user streak if completed
    if (updates.status === 'SOLVED' || updates.status === 'MASTERED') {
      const rawTopics = this.load('dsa_topics', initialDSATopics);
      const topicIdx = rawTopics.findIndex(
        (t) => t.id === current.topicId || t.name.toLowerCase() === current.topicName?.toLowerCase()
      );
      if (topicIdx !== -1) {
        rawTopics[topicIdx].lastStudiedDate = new Date().toISOString().split('T')[0];
        this.save('dsa_topics', rawTopics);
      }
      const profile = this.getProfile();
      if (!profile.currentStreak || profile.currentStreak === 0) {
        this.updateProfile({ currentStreak: 1, longestStreak: Math.max(1, profile.longestStreak || 0) });
      }
    }

    return updated;
  }

  static deleteProblem(id: string): boolean {
    const problems = this.getProblems();
    const filtered = problems.filter((p) => p.id !== id);
    if (filtered.length !== problems.length) {
      this.save('problems', filtered);
      return true;
    }
    return false;
  }

  static getRandomWeakProblem(): Problem | null {
    const problems = this.getProblems();
    // Prioritize weak areas: confidence <= 2 or ATTEMPTED / NOT_STARTED
    const weak = problems.filter((p) => p.confidence <= 2 || p.status === 'ATTEMPTED');
    if (weak.length > 0) {
      return weak[Math.floor(Math.random() * weak.length)];
    }
    if (problems.length === 0) return null;
    return problems[Math.floor(Math.random() * problems.length)];
  }

  // --- WEB DEV ---
  static getWebDevTopics(): WebDevTopic[] {
    return this.load('webdev_topics', initialWebDevTopics);
  }

  static updateWebDevTopic(id: string, updates: Partial<WebDevTopic>): void {
    const topics = this.getWebDevTopics();
    const updated = topics.map((t) => (t.id === id ? { ...t, ...updates } : t));
    this.save('webdev_topics', updated);
  }

  // --- PROJECTS ---
  static getProjects(): ProjectItem[] {
    return this.load('projects', initialProjects);
  }

  static getProjectById(id: string): ProjectItem | undefined {
    return this.getProjects().find((p) => p.id === id);
  }

  static addProject(project: Omit<ProjectItem, 'id' | 'progress' | 'tasks'>): ProjectItem {
    const projects = this.getProjects();
    const newProj: ProjectItem = {
      ...project,
      id: 'proj_' + Date.now(),
      progress: 0,
      tasks: [],
    };
    projects.unshift(newProj);
    this.save('projects', projects);
    return newProj;
  }

  static updateProject(id: string, updates: Partial<ProjectItem>): ProjectItem | null {
    const projects = this.getProjects();
    const idx = projects.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const current = projects[idx];
    const updated = { ...current, ...updates };

    // Calculate progress % based on completed tasks
    if (updated.tasks && updated.tasks.length > 0) {
      const completed = updated.tasks.filter((t) => t.isCompleted).length;
      updated.progress = Math.round((completed / updated.tasks.length) * 100);
    }

    projects[idx] = updated;
    this.save('projects', projects);
    return updated;
  }

  static deleteProject(id: string): boolean {
    const projects = this.getProjects();
    const filtered = projects.filter((p) => p.id !== id);
    if (filtered.length !== projects.length) {
      this.save('projects', filtered);
      return true;
    }
    return false;
  }

  static toggleProjectTask(projectId: string, taskId: string): ProjectItem | null {
    const proj = this.getProjectById(projectId);
    if (!proj) return null;

    const updatedTasks = proj.tasks.map((t) =>
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );

    return this.updateProject(projectId, { tasks: updatedTasks });
  }

  // --- STUDY SESSIONS ---
  static getStudySessions(): StudySessionItem[] {
    return this.load('study_sessions', initialStudySessions);
  }

  static addStudySession(session: Omit<StudySessionItem, 'id'>): StudySessionItem {
    const sessions = this.getStudySessions();
    const newSession: StudySessionItem = {
      ...session,
      id: 'sess_' + Date.now(),
    };
    sessions.unshift(newSession);
    this.save('study_sessions', sessions);
    return newSession;
  }

  // --- HABITS ---
  static getHabits(): HabitItem[] {
    return this.load('habits', initialHabits);
  }

  static toggleHabit(habitId: string, dateStr: string): HabitItem | null {
    const habits = this.getHabits();
    const idx = habits.findIndex((h) => h.id === habitId);
    if (idx === -1) return null;

    const habit = habits[idx];
    const currentStatus = habit.logs[dateStr] || false;
    const newStatus = !currentStatus;

    const updatedLogs = { ...habit.logs, [dateStr]: newStatus };

    // Calculate streak
    let currentStreak = 0;
    const checkDate = new Date();
    while (true) {
      const dStr = checkDate.toISOString().split('T')[0];
      if (updatedLogs[dStr]) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    const updated: HabitItem = {
      ...habit,
      logs: updatedLogs,
      currentStreak,
      longestStreak: Math.max(habit.longestStreak, currentStreak),
    };

    habits[idx] = updated;
    this.save('habits', habits);
    return updated;
  }

  static addHabit(name: string, description?: string): HabitItem {
    const habits = this.getHabits();
    const newHabit: HabitItem = {
      id: 'hab_' + Date.now(),
      name,
      description,
      currentStreak: 0,
      longestStreak: 0,
      targetDays: [0, 1, 2, 3, 4, 5, 6],
      logs: {},
    };
    habits.push(newHabit);
    this.save('habits', habits);
    return newHabit;
  }

  static deleteHabit(id: string): boolean {
    const habits = this.getHabits();
    const filtered = habits.filter((h) => h.id !== id);
    if (filtered.length !== habits.length) {
      this.save('habits', filtered);
      return true;
    }
    return false;
  }

  // --- MOOD ---
  static getMoodLogs(): MoodEntry[] {
    return this.load('mood_logs', initialMoodLogs);
  }

  static logMood(entry: Omit<MoodEntry, 'id'>): MoodEntry {
    const logs = this.getMoodLogs();
    const existingIdx = logs.findIndex((m) => m.date === entry.date);

    if (existingIdx !== -1) {
      const updated = { ...logs[existingIdx], ...entry };
      logs[existingIdx] = updated;
      this.save('mood_logs', logs);
      return updated;
    }

    const newEntry: MoodEntry = {
      ...entry,
      id: 'mood_' + Date.now(),
    };
    logs.unshift(newEntry);
    this.save('mood_logs', logs);
    return newEntry;
  }

  // --- JOB APPLICATIONS (ATS) ---
  static getJobApplications(): JobApplicationItem[] {
    return this.load('job_applications', initialJobApplications);
  }

  static getJobApplicationById(id: string): JobApplicationItem | undefined {
    return this.getJobApplications().find((a) => a.id === id);
  }

  static addJobApplication(app: Omit<JobApplicationItem, 'id'>): JobApplicationItem {
    const apps = this.getJobApplications();
    const newApp: JobApplicationItem = {
      ...app,
      id: 'app_' + Date.now(),
    };
    apps.unshift(newApp);
    this.save('job_applications', apps);
    return newApp;
  }

  static updateJobApplication(id: string, updates: Partial<JobApplicationItem>): JobApplicationItem | null {
    const apps = this.getJobApplications();
    const idx = apps.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const updated = { ...apps[idx], ...updates };
    apps[idx] = updated;
    this.save('job_applications', apps);
    return updated;
  }

  static deleteJobApplication(id: string): boolean {
    const apps = this.getJobApplications();
    const filtered = apps.filter((a) => a.id !== id);
    if (filtered.length !== apps.length) {
      this.save('job_applications', filtered);
      return true;
    }
    return false;
  }

  // --- SAVED JOB LISTINGS ---
  static getSavedJobListings(): JobListing[] {
    return this.load('saved_job_listings', initialSavedJobListings);
  }

  static addJobListing(job: Omit<JobListing, 'id'>): JobListing {
    const listings = this.getSavedJobListings();
    const newJob: JobListing = {
      ...job,
      id: 'job_' + Date.now(),
    };
    listings.unshift(newJob);
    this.save('saved_job_listings', listings);
    return newJob;
  }

  // --- AI CONVERSATION & MEMORY ---
  static getAIHistory(): AIMessageItem[] {
    return this.load('ai_chat_history', [
      {
        id: 'msg-1',
        role: 'assistant',
        content:
          "Hello Nikhitha! I'm DevMentor AI, your dedicated SDE-1 coach. I've synced with your roadmap, weak topics, and your goals. How can I assist your prep today?",
        timestamp: '2026-09-29T08:30:00Z',
      },
    ]);
  }

  static addAIMessage(msg: Omit<AIMessageItem, 'id' | 'timestamp'>): AIMessageItem {
    const history = this.getAIHistory();
    const newMsg: AIMessageItem = {
      ...msg,
      id: 'msg_' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    history.push(newMsg);
    this.save('ai_chat_history', history);
    return newMsg;
  }

  static clearAIHistory(): void {
    this.save('ai_chat_history', []);
  }

  // --- AI DAILY PLAN ---
  static getDailyPlan(): DailyScheduleSlot[] {
    return this.load('ai_daily_plan', [
      {
        timeRange: '08:30 - 09:30',
        title: 'Binary Search Monotonic Invariant Derivation',
        category: 'DSA',
        description: 'Review low <= high vs low < high boundary conditions and search-on-answer template.',
        durationMin: 60,
      },
      {
        timeRange: '09:30 - 10:45',
        title: 'Problem 1: Search in Rotated Sorted Array',
        category: 'DSA',
        description: 'Solve without peeking. Trace with 2-element test cases [3, 1] target 1.',
        durationMin: 75,
      },
      {
        timeRange: '10:45 - 11:00',
        title: 'Hydration & Posture Break',
        category: 'PERSONAL',
        description: 'Step away from screen, drink water, stretch neck and shoulders.',
        durationMin: 15,
      },
      {
        timeRange: '11:00 - 11:30',
        title: 'Recruiter Follow-up: Amazon SDE-1',
        category: 'JOB',
        description: 'Send brief, courteous check-in email referencing referral by Rohan Mehra.',
        durationMin: 30,
      },
      {
        timeRange: '14:30 - 16:00',
        title: 'React Hooks: Stale Closure Debugging',
        category: 'WEB_DEV',
        description: 'Document useEffect dependency array mechanics and build useInterval custom hook.',
        durationMin: 90,
      },
      {
        timeRange: '18:00 - 19:30',
        title: 'Project Offboarding: Auth Cookie & Refresh Token',
        category: 'PROJECT',
        description: 'Implement secure httpOnly cookie rotation in Express authentication router.',
        durationMin: 90,
      },
      {
        timeRange: '21:00 - 21:45',
        title: 'Spaced Repetition: Coin Change (DP) & Longest Substring',
        category: 'REVISION',
        description: 'Redo state transition formula for Coin Change. Focus on subproblem definition.',
        durationMin: 45,
      },
    ]);
  }

  static setDailyPlan(plan: DailyScheduleSlot[]): void {
    this.save('ai_daily_plan', plan);
  }
}
