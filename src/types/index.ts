export type TaskCategory =
  | 'DSA'
  | 'WEB_DEV'
  | 'PROJECT'
  | 'CS'
  | 'JOB'
  | 'PERSONAL'
  | 'REVISION';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';
export type ProblemStatus =
  | 'NOT_STARTED'
  | 'ATTEMPTED'
  | 'HINT_USED'
  | 'SOLVED'
  | 'MASTERED';

export type DSAProgressionLevel =
  | 'BEGINNER'
  | 'INTERMEDIATE'
  | 'ADVANCED'
  | 'INTERVIEW';

export type JobStatus =
  | 'WISHLIST'
  | 'APPLIED'
  | 'REFERRED'
  | 'OA'
  | 'INTERVIEW'
  | 'TECHNICAL_ROUND'
  | 'HR_ROUND'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type AIMode =
  | 'EXPLAIN'
  | 'HINT'
  | 'DEBUG'
  | 'INTERVIEW'
  | 'QUIZ'
  | 'SEARCH_MY_NOTES'
  | 'CREATE_PLAN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  targetCompanies: string[];
  skills: string[];
  experienceYears: number;
  graduationYear: number;
  preferredLocations: string[];
  dailyStudyTarget: number;
  goalTitle: string;
  currentStreak: number;
  longestStreak: number;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string; // ISO date string (YYYY-MM-DD)
  dueTime?: string; // HH:mm
  estimatedTime?: number; // minutes
  actualTime?: number; // minutes
  recurring?: 'DAILY' | 'WEEKLY' | null;
  tags: string[];
  projectId?: string;
  roadmapDayId?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DSATopic {
  id: string;
  name: string;
  slug: string;
  category: 'DSA' | 'WEB_DEV';
  parentTopicId?: string;
  description?: string;
  progressionLevel: DSAProgressionLevel;
  theory?: string;
  templates?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  patternsCount?: number;
  problemsCount?: number;
  solvedCount?: number;
  confidence?: number; // 1-5
  section?: 'FOUNDATION' | 'CORE' | 'INTERMEDIATE' | 'ADVANCED';
  lastStudiedDate?: string;
  nextRevisionDate?: string;
}

export interface DSAPattern {
  id: string;
  topicId: string;
  name: string;
  description?: string;
  template?: string;
  keyTriggers: string[];
  problemCount?: number;
  masteredCount?: number;
}

export interface Problem {
  id: string;
  topicId: string;
  topicName?: string;
  name: string;
  platform: string;
  url: string;
  difficulty: Difficulty;
  patterns: string[]; // pattern names
  companyTags: string[];
  frequency: number; // 1-10
  status: ProblemStatus;
  confidence: number; // 1-5
  timeTakenMin?: number;
  attemptsCount: number;
  solutionNotes?: string;
  codeSnippet?: string;
  mistakes?: string;
  lastAttemptedAt?: string;
  nextRevisionAt?: string;
}

export interface RevisionItem {
  id: string;
  problemId: string;
  problemName: string;
  topicName: string;
  difficulty: Difficulty;
  patterns: string[];
  scheduledFor: string;
  repetitionCount: number;
  intervalDays: number;
  easeFactor: number;
  confidence: number;
  isDue: boolean;
}

export interface RoadmapDayItem {
  id: string;
  dayNumber: number;
  phaseTitle: string;
  theme: string;
  dsaFocus?: string;
  webDevFocus?: string;
  csFocus?: string;
  lldFocus?: string;
  hldFocus?: string;
  genAiFocus?: string;
  projectsFocus?: string;
  appsFocus?: string;
  revisionFocus?: string;
  targetHours: number;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
}

export interface WebDevTopic {
  id: string;
  name: string;
  category: string;
  concepts: string[];
  lessonsCount: number;
  completedLessons: number;
  confidence: number; // 1-5
  notes?: string;
}

export interface ProjectTaskItem {
  id: string;
  title: string;
  isCompleted: boolean;
  isBug: boolean;
  isFeature: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  startDate: string;
  deadline?: string;
  progress: number;
  tasks: ProjectTaskItem[];
  documentation?: string;
  resumeBullet?: string;
}

export interface StudySessionItem {
  id: string;
  startTime: string;
  endTime?: string;
  durationMin: number;
  topic: string;
  category: TaskCategory;
  productivity: number; // 1-5
  notes?: string;
}

export interface HabitItem {
  id: string;
  name: string;
  description?: string;
  currentStreak: number;
  longestStreak: number;
  targetDays: number[];
  logs: { [dateStr: string]: boolean };
}

export interface MoodEntry {
  id: string;
  date: string;
  score: number; // 1-5
  energy?: number; // 1-5
  stress?: number; // 1-5
  sleepHours?: number;
  note?: string;
}

export interface JobApplicationItem {
  id: string;
  company: string;
  role: string;
  location: string;
  jobUrl?: string;
  applicationDate: string;
  source: string;
  referralName?: string;
  status: JobStatus;
  recruiter?: string;
  salary?: string;
  jobDescription?: string;
  notes?: string;
  followUpDate?: string;
  oaDate?: string;
  interviewDate?: string;
  offerStatus?: string;
}

export interface JobListing {
  id: string;
  company: string;
  role: string;
  location: string;
  workplaceType: 'REMOTE' | 'HYBRID' | 'ONSITE';
  experienceLevel: 'FRESHER' | 'ZERO_TO_ONE' | 'ONE_TO_TWO' | 'SENIOR';
  isProductCo: boolean;
  salaryRange?: string;
  techStack: string[];
  jobUrl?: string;
  deadline?: string;
  description?: string;
  isDemoData: boolean;
}

export interface AIMessageItem {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  contextData?: any;
}

export interface DailyScheduleSlot {
  timeRange: string;
  title: string;
  category: TaskCategory;
  description: string;
  durationMin: number;
}
