import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({
        success: true,
        results: {
          tasks: [],
          projects: [],
          dsa: [],
          webdev: [],
          jobs: [],
          notes: [],
        },
      });
    }

    try {
      const [todos, projects, dsaProblems, dsaTopics, webLessons, jobs, notes] =
        await Promise.all([
          // 1. User tasks
          prisma.todo.findMany({
            where: {
              userId: authUser.userId,
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 6,
            select: {
              id: true,
              title: true,
              category: true,
              priority: true,
              status: true,
              dueDate: true,
            },
          }),
          // 2. User projects
          prisma.project.findMany({
            where: {
              userId: authUser.userId,
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: {
              id: true,
              name: true,
              description: true,
              techStack: true,
              progress: true,
            },
          }),
          // 3. DSA Problems & Topics
          prisma.problem.findMany({
            where: {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { platform: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 6,
            include: { topic: { select: { id: true, name: true } } },
          }),
          prisma.topic.findMany({
            where: {
              category: 'DSA',
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 4,
            select: { id: true, name: true, progressionLevel: true },
          }),
          // 4. Web Dev Lessons & Topics
          prisma.topic.findMany({
            where: {
              category: 'WEB_DEV',
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: { id: true, name: true, progressionLevel: true },
          }),
          // 5. ATS Job Applications
          prisma.jobApplication.findMany({
            where: {
              userId: authUser.userId,
              OR: [
                { company: { contains: query, mode: 'insensitive' } },
                { role: { contains: query, mode: 'insensitive' } },
                { notes: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: {
              id: true,
              company: true,
              role: true,
              status: true,
              applicationDate: true,
            },
          }),
          // 6. Notes
          prisma.note.findMany({
            where: {
              userId: authUser.userId,
              OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { content: { contains: query, mode: 'insensitive' } },
              ],
            },
            take: 5,
            select: {
              id: true,
              title: true,
              content: true,
              tags: true,
            },
          }),
        ]);

      // Combine DSA topics + problems
      const dsaCombined = [
        ...dsaTopics.map((t: any) => ({
          id: t.id,
          title: t.name,
          subtitle: `DSA Topic (${t.progressionLevel})`,
          type: 'topic',
        })),
        ...dsaProblems.map((p: any) => ({
          id: p.id,
          title: p.name,
          subtitle: `${p.topic?.name || 'DSA'} • ${p.difficulty}`,
          type: 'problem',
        })),
      ];

      return NextResponse.json({
        success: true,
        results: {
          tasks: todos.map((t: any) => ({
            id: t.id,
            title: t.title,
            subtitle: `${t.category} • ${t.priority} • ${t.status}`,
          })),
          projects: projects.map((p: any) => ({
            id: p.id,
            title: p.name,
            subtitle: `${p.techStack.slice(0, 3).join(', ')} • ${p.progress}%`,
          })),
          dsa: dsaCombined,
          webdev: webLessons.map((l: any) => ({
            id: l.id,
            title: l.name,
            subtitle: `Web Dev Module`,
          })),
          jobs: jobs.map((j: any) => ({
            id: j.id,
            title: `${j.company} — ${j.role}`,
            subtitle: `Status: ${j.status}`,
          })),
          notes: notes.map((n: any) => ({
            id: n.id,
            title: n.title,
            subtitle: n.tags.join(', ') || 'Personal Note',
          })),
        },
      });
    } catch (dbErr) {
      console.error('Search DB error, using storage fallback:', dbErr);

      // Fallback search across DevTrackStore
      const qLower = query.toLowerCase();
      const allTasks = DevTrackStore.getTasks();
      const matchedTasks = allTasks
        .filter((t) => t.title.toLowerCase().includes(qLower))
        .slice(0, 6)
        .map((t) => ({
          id: t.id,
          title: t.title,
          subtitle: `${t.category} • ${t.priority}`,
        }));

      const allProblems = DevTrackStore.getProblems();
      const matchedProblems = allProblems
        .filter((p) => p.name.toLowerCase().includes(qLower))
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `${p.difficulty} • ${p.platform}`,
          type: 'problem',
        }));

      const allJobs = DevTrackStore.getJobApplications();
      const matchedJobs = allJobs
        .filter(
          (j) =>
            j.company.toLowerCase().includes(qLower) ||
            j.role.toLowerCase().includes(qLower)
        )
        .slice(0, 5)
        .map((j) => ({
          id: j.id,
          title: `${j.company} — ${j.role}`,
          subtitle: `Status: ${j.status}`,
        }));

      return NextResponse.json({
        success: true,
        results: {
          tasks: matchedTasks,
          projects: [],
          dsa: matchedProblems,
          webdev: [],
          jobs: matchedJobs,
          notes: [],
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
