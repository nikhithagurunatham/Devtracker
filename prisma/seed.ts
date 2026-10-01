import { PrismaClient } from '@prisma/client';
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
} from '../src/lib/sample-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DevTrack AI Database Seed...');

  // 1. Create or update Default User
  const user = await prisma.user.upsert({
    where: { email: initialUserProfile.email },
    update: {},
    create: {
      id: initialUserProfile.id,
      name: initialUserProfile.name,
      email: initialUserProfile.email,
      targetRole: initialUserProfile.targetRole,
      targetCompanies: initialUserProfile.targetCompanies,
      skills: initialUserProfile.skills,
      experienceYears: initialUserProfile.experienceYears,
      graduationYear: initialUserProfile.graduationYear,
      preferredLocations: initialUserProfile.preferredLocations,
      dailyStudyTarget: initialUserProfile.dailyStudyTarget,
      goalTitle: initialUserProfile.goalTitle,
      currentStreak: initialUserProfile.currentStreak,
      longestStreak: initialUserProfile.longestStreak,
      preferences: {
        create: {
          theme: 'dark',
          soundEnabled: true,
          notifications: true,
          pomodoroWorkMin: 25,
          pomodoroBreakMin: 5,
        },
      },
    },
  });

  console.log(`✅ User seeded: ${user.name} (${user.email})`);

  // 2. Roadmap
  const roadmap = await prisma.roadmap.create({
    data: {
      userId: user.id,
      title: '100-Day Amazon SDE-1 Preparation Roadmap',
      goal: 'Become Amazon SDE-1 interview ready',
      totalDays: 100,
      currentDayNumber: 23,
      endDate: new Date(Date.now() + 77 * 24 * 60 * 60 * 1000),
      days: {
        create: initialRoadmapDays.map((d) => ({
          dayNumber: d.dayNumber,
          phaseTitle: d.phaseTitle,
          theme: d.theme,
          dsaFocus: d.dsaFocus,
          webDevFocus: d.webDevFocus,
          csFocus: d.csFocus,
          lldFocus: d.lldFocus,
          hldFocus: d.hldFocus,
          genAiFocus: d.genAiFocus,
          projectsFocus: d.projectsFocus,
          appsFocus: d.appsFocus,
          revisionFocus: d.revisionFocus,
          targetHours: d.targetHours,
          isCompleted: d.isCompleted,
          completedAt: d.completedAt ? new Date(d.completedAt) : undefined,
          notes: d.notes,
        })),
      },
    },
  });
  console.log(`✅ Roadmap seeded with ${initialRoadmapDays.length} milestone days`);

  // 3. DSA Topics & Patterns
  for (const t of initialDSATopics) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        id: t.id,
        name: t.name,
        slug: t.slug,
        category: t.category,
        progressionLevel: t.progressionLevel,
        description: t.description,
        theory: t.theory,
        templates: t.templates,
      },
    });

    // Associated patterns
    const patterns = initialDSAPatterns.filter((p) => p.topicId === t.id);
    for (const pat of patterns) {
      await prisma.pattern.upsert({
        where: { id: pat.id },
        update: {},
        create: {
          id: pat.id,
          topicId: topic.id,
          name: pat.name,
          description: pat.description,
          keyTriggers: pat.keyTriggers,
        },
      });
    }
  }
  console.log(`✅ DSA Topics & Patterns seeded`);

  // 4. Tasks (Full CRUD seed)
  for (const t of initialTasks) {
    await prisma.todo.create({
      data: {
        id: t.id,
        userId: user.id,
        title: t.title,
        description: t.description,
        category: t.category,
        priority: t.priority,
        status: t.status,
        dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        dueTime: t.dueTime,
        estimatedTime: t.estimatedTime,
        actualTime: t.actualTime,
        tags: t.tags,
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
      },
    });
  }
  console.log(`✅ Initial tasks seeded`);

  // 5. Job Applications
  for (const j of initialJobApplications) {
    await prisma.jobApplication.create({
      data: {
        id: j.id,
        userId: user.id,
        company: j.company,
        role: j.role,
        location: j.location,
        jobUrl: j.jobUrl,
        applicationDate: new Date(j.applicationDate),
        source: j.source,
        referralName: j.referralName,
        status: j.status,
        recruiter: j.recruiter,
        salary: j.salary,
        notes: j.notes,
        followUpDate: j.followUpDate ? new Date(j.followUpDate) : undefined,
        oaDate: j.oaDate ? new Date(j.oaDate) : undefined,
        interviewDate: j.interviewDate ? new Date(j.interviewDate) : undefined,
      },
    });
  }
  console.log(`✅ ATS Job Applications seeded`);

  console.log('🚀 DevTrack AI database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
