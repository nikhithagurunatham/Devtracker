-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "TaskCategory" AS ENUM ('DSA', 'WEB_DEV', 'PROJECT', 'CS', 'JOB', 'PERSONAL', 'REVISION');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProblemStatus" AS ENUM ('NOT_STARTED', 'ATTEMPTED', 'HINT_USED', 'SOLVED', 'MASTERED');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "DSAProgressionLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'INTERVIEW');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('WISHLIST', 'APPLIED', 'REFERRED', 'OA', 'INTERVIEW', 'TECHNICAL_ROUND', 'HR_ROUND', 'OFFER', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "JobWorkplaceType" AS ENUM ('REMOTE', 'HYBRID', 'ONSITE');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('FRESHER', 'ZERO_TO_ONE', 'ONE_TO_TWO', 'SENIOR');

-- CreateEnum
CREATE TYPE "AIMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- CreateEnum
CREATE TYPE "AIMode" AS ENUM ('EXPLAIN', 'HINT', 'DEBUG', 'INTERVIEW', 'QUIZ', 'SEARCH_MY_NOTES', 'CREATE_PLAN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "targetRole" TEXT NOT NULL DEFAULT 'SDE-1',
    "targetCompanies" TEXT[] DEFAULT ARRAY['Amazon', 'Microsoft', 'Google', 'Uber']::TEXT[],
    "skills" TEXT[] DEFAULT ARRAY['JavaScript', 'TypeScript', 'React', 'Node.js', 'C++', 'DSA']::TEXT[],
    "experienceYears" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "graduationYear" INTEGER NOT NULL DEFAULT 2025,
    "preferredLocations" TEXT[] DEFAULT ARRAY['Bangalore', 'Hyderabad', 'Remote']::TEXT[],
    "dailyStudyTarget" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "goalTitle" TEXT NOT NULL DEFAULT 'Become Amazon SDE-1 interview ready',
    "currentStreak" INTEGER NOT NULL DEFAULT 12,
    "longestStreak" INTEGER NOT NULL DEFAULT 24,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "soundEnabled" BOOLEAN NOT NULL DEFAULT true,
    "notifications" BOOLEAN NOT NULL DEFAULT true,
    "notifyRevision" BOOLEAN NOT NULL DEFAULT true,
    "notifyInterview" BOOLEAN NOT NULL DEFAULT true,
    "notifyTaskDue" BOOLEAN NOT NULL DEFAULT true,
    "pomodoroWorkMin" INTEGER NOT NULL DEFAULT 25,
    "pomodoroBreakMin" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '100-Day SDE-1 Preparation Roadmap',
    "goal" TEXT NOT NULL DEFAULT 'Crack FAANG SDE-1',
    "totalDays" INTEGER NOT NULL DEFAULT 100,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3) NOT NULL,
    "dailyStudyHours" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "currentDayNumber" INTEGER NOT NULL DEFAULT 23,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapDay" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "phaseTitle" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "dsaFocus" TEXT,
    "webDevFocus" TEXT,
    "csFocus" TEXT,
    "lldFocus" TEXT,
    "hldFocus" TEXT,
    "genAiFocus" TEXT,
    "projectsFocus" TEXT,
    "appsFocus" TEXT,
    "revisionFocus" TEXT,
    "targetHours" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "RoadmapDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'DSA',
    "parentTopicId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "progressionLevel" "DSAProgressionLevel" NOT NULL DEFAULT 'BEGINNER',
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "theory" TEXT,
    "templates" TEXT,
    "timeComplexity" TEXT,
    "spaceComplexity" TEXT,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pattern" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "template" TEXT,
    "keyTriggers" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'LeetCode',
    "url" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "companyTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "frequency" INTEGER NOT NULL DEFAULT 5,
    "status" "ProblemStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "confidence" INTEGER NOT NULL DEFAULT 3,
    "timeTakenMin" INTEGER,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "solutionNotes" TEXT,
    "codeSnippet" TEXT,
    "mistakes" TEXT,
    "lastAttemptedAt" TIMESTAMP(3),
    "nextRevisionAt" TIMESTAMP(3),

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProblemPattern" (
    "problemId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,

    CONSTRAINT "ProblemPattern_pkey" PRIMARY KEY ("problemId","patternId")
);

-- CreateTable
CREATE TABLE "ProblemAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "solved" BOOLEAN NOT NULL DEFAULT false,
    "solvedNoHelp" BOOLEAN NOT NULL DEFAULT false,
    "hintUsed" BOOLEAN NOT NULL DEFAULT false,
    "viewedSol" BOOLEAN NOT NULL DEFAULT false,
    "timeTakenMin" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "notes" TEXT,
    "mistakes" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProblemAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "repetitionCount" INTEGER NOT NULL DEFAULT 0,
    "intervalDays" INTEGER NOT NULL DEFAULT 1,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "confidence" INTEGER NOT NULL DEFAULT 3,
    "isDue" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "practiceUrl" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "confidence" INTEGER NOT NULL DEFAULT 3,
    "lastStudiedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextRevisionAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "LearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topicId" TEXT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "githubUrl" TEXT,
    "liveUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadline" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "documentation" TEXT,
    "resumeBullet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTask" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isBug" BOOLEAN NOT NULL DEFAULT false,
    "isFeature" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Todo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TaskCategory" NOT NULL DEFAULT 'DSA',
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "TaskStatus" NOT NULL DEFAULT 'TODO',
    "dueDate" TIMESTAMP(3),
    "dueTime" TEXT,
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    "recurring" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "projectId" TEXT,
    "roadmapDayId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "durationMin" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "category" "TaskCategory" NOT NULL DEFAULT 'DSA',
    "productivity" INTEGER NOT NULL DEFAULT 4,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "targetDays" INTEGER[] DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::INTEGER[],
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mood" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "energy" INTEGER,
    "stress" INTEGER,
    "sleepHours" DOUBLE PRECISION,
    "note" TEXT,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "workplaceType" "JobWorkplaceType" NOT NULL DEFAULT 'HYBRID',
    "experienceLevel" "ExperienceLevel" NOT NULL DEFAULT 'FRESHER',
    "isProductCo" BOOLEAN NOT NULL DEFAULT true,
    "salaryRange" TEXT,
    "techStack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "jobUrl" TEXT,
    "deadline" TIMESTAMP(3),
    "description" TEXT,
    "isDemoData" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jobUrl" TEXT,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'LinkedIn',
    "referralName" TEXT,
    "status" "JobStatus" NOT NULL DEFAULT 'APPLIED',
    "recruiter" TEXT,
    "salary" TEXT,
    "jobDescription" TEXT,
    "notes" TEXT,
    "followUpDate" TIMESTAMP(3),
    "oaDate" TIMESTAMP(3),
    "interviewDate" TIMESTAMP(3),
    "offerStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "roundName" TEXT NOT NULL,
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "interviewer" TEXT,
    "meetingLink" TEXT,
    "feedbackNotes" TEXT,
    "passed" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'DSA Mentorship Session',
    "mode" "AIMode" NOT NULL DEFAULT 'EXPLAIN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "AIMessageRole" NOT NULL DEFAULT 'USER',
    "content" TEXT NOT NULL,
    "contextData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'SDE-1 Resume 2025',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience" JSONB NOT NULL DEFAULT '[]',
    "projects" JSONB NOT NULL DEFAULT '[]',
    "education" JSONB NOT NULL DEFAULT '[]',
    "aiFeedback" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "Roadmap_userId_idx" ON "Roadmap"("userId");

-- CreateIndex
CREATE INDEX "RoadmapDay_roadmapId_idx" ON "RoadmapDay"("roadmapId");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapDay_roadmapId_dayNumber_key" ON "RoadmapDay"("roadmapId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_slug_key" ON "Topic"("slug");

-- CreateIndex
CREATE INDEX "Topic_category_slug_idx" ON "Topic"("category", "slug");

-- CreateIndex
CREATE INDEX "Pattern_topicId_idx" ON "Pattern"("topicId");

-- CreateIndex
CREATE INDEX "Problem_topicId_status_idx" ON "Problem"("topicId", "status");

-- CreateIndex
CREATE INDEX "Problem_nextRevisionAt_idx" ON "Problem"("nextRevisionAt");

-- CreateIndex
CREATE INDEX "Problem_difficulty_idx" ON "Problem"("difficulty");

-- CreateIndex
CREATE INDEX "ProblemAttempt_userId_problemId_idx" ON "ProblemAttempt"("userId", "problemId");

-- CreateIndex
CREATE INDEX "ProblemAttempt_attemptedAt_idx" ON "ProblemAttempt"("attemptedAt");

-- CreateIndex
CREATE INDEX "Revision_userId_scheduledFor_idx" ON "Revision"("userId", "scheduledFor");

-- CreateIndex
CREATE INDEX "Lesson_topicId_idx" ON "Lesson"("topicId");

-- CreateIndex
CREATE INDEX "LearningProgress_userId_idx" ON "LearningProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LearningProgress_userId_topicId_key" ON "LearningProgress"("userId", "topicId");

-- CreateIndex
CREATE INDEX "Note_userId_idx" ON "Note"("userId");

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE INDEX "ProjectTask_projectId_idx" ON "ProjectTask"("projectId");

-- CreateIndex
CREATE INDEX "Todo_userId_status_idx" ON "Todo"("userId", "status");

-- CreateIndex
CREATE INDEX "Todo_userId_dueDate_idx" ON "Todo"("userId", "dueDate");

-- CreateIndex
CREATE INDEX "Todo_userId_category_idx" ON "Todo"("userId", "category");

-- CreateIndex
CREATE INDEX "StudySession_userId_startTime_idx" ON "StudySession"("userId", "startTime");

-- CreateIndex
CREATE INDEX "Habit_userId_idx" ON "Habit"("userId");

-- CreateIndex
CREATE INDEX "HabitLog_habitId_idx" ON "HabitLog"("habitId");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");

-- CreateIndex
CREATE INDEX "Mood_userId_date_idx" ON "Mood"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Mood_userId_date_key" ON "Mood"("userId", "date");

-- CreateIndex
CREATE INDEX "Job_company_role_idx" ON "Job"("company", "role");

-- CreateIndex
CREATE INDEX "Job_isDemoData_idx" ON "Job"("isDemoData");

-- CreateIndex
CREATE INDEX "JobApplication_userId_status_idx" ON "JobApplication"("userId", "status");

-- CreateIndex
CREATE INDEX "JobApplication_userId_followUpDate_idx" ON "JobApplication"("userId", "followUpDate");

-- CreateIndex
CREATE INDEX "Interview_applicationId_idx" ON "Interview"("applicationId");

-- CreateIndex
CREATE INDEX "AIConversation_userId_idx" ON "AIConversation"("userId");

-- CreateIndex
CREATE INDEX "AIMessage_conversationId_idx" ON "AIMessage"("conversationId");

-- CreateIndex
CREATE INDEX "Resume_userId_idx" ON "Resume"("userId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapDay" ADD CONSTRAINT "RoadmapDay_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pattern" ADD CONSTRAINT "Pattern_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Problem" ADD CONSTRAINT "Problem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemPattern" ADD CONSTRAINT "ProblemPattern_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemPattern" ADD CONSTRAINT "ProblemPattern_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "Pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAttempt" ADD CONSTRAINT "ProblemAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemAttempt" ADD CONSTRAINT "ProblemAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Revision" ADD CONSTRAINT "Revision_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningProgress" ADD CONSTRAINT "LearningProgress_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTask" ADD CONSTRAINT "ProjectTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Todo" ADD CONSTRAINT "Todo_roadmapDayId_fkey" FOREIGN KEY ("roadmapDayId") REFERENCES "RoadmapDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Habit" ADD CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mood" ADD CONSTRAINT "Mood_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIConversation" ADD CONSTRAINT "AIConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIMessage" ADD CONSTRAINT "AIMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AIConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
