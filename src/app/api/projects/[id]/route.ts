import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;

    try {
      const project = await prisma.project.findFirst({
        where: { id, userId: authUser.userId },
        include: { tasks: true },
      });
      if (project) {
        return NextResponse.json({ success: true, project, source: 'database' });
      }
    } catch (dbErr) {
      console.error('Project GET [id] fallback:', dbErr);
    }

    const project = DevTrackStore.getProjectById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project, source: 'store' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    const body = await req.json();

    try {
      const existing = await prisma.project.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Project not found or unauthorized' },
          { status: 404 }
        );
      }

      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.description !== undefined) updateData.description = body.description;
      if (body.techStack !== undefined) updateData.techStack = body.techStack;
      if (body.githubUrl !== undefined) updateData.githubUrl = body.githubUrl;
      if (body.liveUrl !== undefined) updateData.liveUrl = body.liveUrl;
      if (body.progress !== undefined) updateData.progress = Number(body.progress);
      if (body.documentation !== undefined) updateData.documentation = body.documentation;
      if (body.resumeBullet !== undefined) updateData.resumeBullet = body.resumeBullet;
      if (body.deadline !== undefined) {
        updateData.deadline = body.deadline ? new Date(body.deadline) : null;
      }

      const updated = await prisma.project.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, project: updated, source: 'database' });
    } catch (dbErr) {
      console.error('Project PATCH fallback:', dbErr);
    }

    const updated = DevTrackStore.updateProject(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project: updated, source: 'store' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;

    try {
      const existing = await prisma.project.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Project not found or unauthorized' },
          { status: 404 }
        );
      }

      await prisma.project.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Project deleted successfully' });
    } catch (dbErr) {
      console.error('Project DELETE fallback:', dbErr);
    }

    const deleted = DevTrackStore.deleteProject(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Project deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
