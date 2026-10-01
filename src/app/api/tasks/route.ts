import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { DevTrackStore } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic';

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  category: z.enum(['DSA', 'WEB_DEV', 'PROJECT', 'CS', 'JOB', 'PERSONAL', 'REVISION']).default('DSA'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('TODO'),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  estimatedTime: z.number().int().positive().optional(),
  recurring: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  projectId: z.string().optional().nullable(),
  roadmapDayId: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get('filter'); // 'today', 'tomorrow', 'week', 'upcoming', 'overdue', 'completed', 'all'
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');

    const todayStr = new Date().toISOString().split('T')[0];
    const tomDate = new Date();
    tomDate.setDate(tomDate.getDate() + 1);
    const tomorrowStr = tomDate.toISOString().split('T')[0];

    const nextWeekDate = new Date();
    nextWeekDate.setDate(nextWeekDate.getDate() + 7);
    const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

    // Attempt Prisma query with user isolation
    try {
      const where: any = { userId: authUser.userId };
      if (category && category !== 'ALL') where.category = category;
      if (priority && priority !== 'ALL') where.priority = priority;

      if (filter === 'today') {
        where.status = { not: 'COMPLETED' };
        where.OR = [{ dueDate: null }, { dueDate: new Date(todayStr) }];
      } else if (filter === 'tomorrow') {
        where.status = { not: 'COMPLETED' };
        where.dueDate = new Date(tomorrowStr);
      } else if (filter === 'week') {
        where.status = { not: 'COMPLETED' };
        where.dueDate = { gte: new Date(todayStr), lte: new Date(nextWeekStr) };
      } else if (filter === 'upcoming') {
        where.status = { not: 'COMPLETED' };
        where.dueDate = { gt: new Date(todayStr) };
      } else if (filter === 'overdue') {
        where.status = { not: 'COMPLETED' };
        where.dueDate = { lt: new Date(todayStr) };
      } else if (filter === 'completed') {
        where.status = 'COMPLETED';
      }

      const tasks = await prisma.todo.findMany({
        where,
        orderBy: [{ dueDate: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
      });

      if (tasks && tasks.length >= 0) {
        return NextResponse.json({ success: true, tasks, source: 'database' });
      }
    } catch (dbErr) {
      // Prisma DB connection may not be established yet; fall through to memory/store
    }

    // In-memory / storage fallback with same filter logic
    let tasks = DevTrackStore.getTasks();
    if (category && category !== 'ALL') tasks = tasks.filter((t) => t.category === category);
    if (priority && priority !== 'ALL') tasks = tasks.filter((t) => t.priority === priority);

    if (filter === 'today') {
      tasks = tasks.filter((t) => t.status !== 'COMPLETED' && (!t.dueDate || t.dueDate === todayStr));
    } else if (filter === 'tomorrow') {
      tasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate === tomorrowStr);
    } else if (filter === 'week') {
      tasks = tasks.filter(
        (t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate >= todayStr && t.dueDate <= nextWeekStr
      );
    } else if (filter === 'upcoming') {
      tasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate > todayStr);
    } else if (filter === 'overdue') {
      tasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && t.dueDate < todayStr);
    } else if (filter === 'completed') {
      tasks = tasks.filter((t) => t.status === 'COMPLETED');
    }

    return NextResponse.json({ success: true, tasks, source: 'store' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const validated = createTaskSchema.parse(body);

    try {
      const dbTask = await prisma.todo.create({
        data: {
          userId: authUser.userId,
          title: validated.title,
          description: validated.description,
          category: validated.category,
          priority: validated.priority,
          status: validated.status,
          dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
          dueTime: validated.dueTime,
          estimatedTime: validated.estimatedTime,
          recurring: validated.recurring,
          tags: validated.tags,
          projectId: validated.projectId || undefined,
          roadmapDayId: validated.roadmapDayId || undefined,
          completedAt: validated.status === 'COMPLETED' ? new Date() : undefined,
        },
      });
      return NextResponse.json({ success: true, task: dbTask, source: 'database' }, { status: 201 });
    } catch (dbErr) {
      // Fallback to DevTrackStore
      const newTask = DevTrackStore.addTask({
        title: validated.title,
        description: validated.description,
        category: validated.category,
        priority: validated.priority,
        status: validated.status,
        dueDate: validated.dueDate,
        dueTime: validated.dueTime,
        estimatedTime: validated.estimatedTime,
        recurring: validated.recurring as any,
        tags: validated.tags,
        projectId: validated.projectId || undefined,
        roadmapDayId: validated.roadmapDayId || undefined,
      });

      return NextResponse.json({ success: true, task: newTask, source: 'store' }, { status: 201 });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create task' },
      { status: 500 }
    );
  }
}
