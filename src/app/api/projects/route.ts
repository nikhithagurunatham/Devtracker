import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  techStack: z.array(z.string()).default([]),
  githubUrl: z.string().optional().nullable(),
  liveUrl: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  progress: z.number().int().min(0).max(100).default(0),
  documentation: z.string().optional().nullable(),
  resumeBullet: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const dbProjects = await prisma.project.findMany({
        where: { userId: authUser.userId },
        include: { tasks: true },
        orderBy: { updatedAt: 'desc' },
      });

      if (dbProjects) {
        return NextResponse.json({ success: true, projects: dbProjects, source: 'database' });
      }
    } catch (dbErr) {
      console.error('Projects GET DB fallback:', dbErr);
    }

    const projects = DevTrackStore.getProjects();
    return NextResponse.json({ success: true, projects, source: 'store' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const validated = createProjectSchema.parse(body);

    try {
      const dbProject = await prisma.project.create({
        data: {
          userId: authUser.userId,
          name: validated.name,
          description: validated.description,
          techStack: validated.techStack,
          githubUrl: validated.githubUrl || null,
          liveUrl: validated.liveUrl || null,
          startDate: validated.startDate ? new Date(validated.startDate) : new Date(),
          deadline: validated.deadline ? new Date(validated.deadline) : null,
          progress: validated.progress,
          documentation: validated.documentation || null,
          resumeBullet: validated.resumeBullet || null,
        },
      });

      return NextResponse.json({ success: true, project: dbProject, source: 'database' }, { status: 201 });
    } catch (dbErr) {
      console.error('Projects POST DB fallback:', dbErr);
    }

    const project = DevTrackStore.addProject(validated as any);
    return NextResponse.json({ success: true, project, source: 'store' }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
