import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { DevTrackStore } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth-helper';

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  category: z.enum(['DSA', 'WEB_DEV', 'PROJECT', 'CS', 'JOB', 'PERSONAL', 'REVISION']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  dueDate: z.string().optional().nullable(),
  dueTime: z.string().optional().nullable(),
  estimatedTime: z.number().int().optional().nullable(),
  actualTime: z.number().int().optional().nullable(),
  recurring: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  projectId: z.string().optional().nullable(),
  roadmapDayId: z.string().optional().nullable(),
});

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
      const task = await prisma.todo.findFirst({
        where: { id, userId: authUser.userId },
      });
      if (task) return NextResponse.json({ success: true, task });
    } catch (e) {
      // fallback
    }

    const task = DevTrackStore.getTaskById(id);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task });
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
    const validated = updateTaskSchema.parse(body);

    try {
      // Verify task belongs to authenticated user
      const existing = await prisma.todo.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Task not found or access denied' },
          { status: 404 }
        );
      }

      const updateData: any = {};
      if (validated.title !== undefined) updateData.title = validated.title;
      if (validated.description !== undefined) updateData.description = validated.description;
      if (validated.category !== undefined) updateData.category = validated.category;
      if (validated.priority !== undefined) updateData.priority = validated.priority;
      if (validated.status !== undefined) updateData.status = validated.status;
      if (validated.dueDate !== undefined) {
        updateData.dueDate = validated.dueDate ? new Date(validated.dueDate) : null;
      }
      if (validated.dueTime !== undefined) updateData.dueTime = validated.dueTime;
      if (validated.estimatedTime !== undefined) updateData.estimatedTime = validated.estimatedTime;
      if (validated.actualTime !== undefined) updateData.actualTime = validated.actualTime;
      if (validated.recurring !== undefined) updateData.recurring = validated.recurring;
      if (validated.tags !== undefined) updateData.tags = validated.tags;
      if (validated.projectId !== undefined) updateData.projectId = validated.projectId;
      if (validated.roadmapDayId !== undefined) updateData.roadmapDayId = validated.roadmapDayId;

      if (validated.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      } else if (validated.status) {
        updateData.completedAt = null;
      }

      const updated = await prisma.todo.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, task: updated });
    } catch (e) {
      // Fallback in DevTrackStore
      const updated = DevTrackStore.updateTask(id, validated as any);
      if (!updated) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, task: updated });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
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
      const existing = await prisma.todo.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Task not found or access denied' },
          { status: 404 }
        );
      }

      await prisma.todo.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Task deleted successfully' });
    } catch (e) {
      // Fallback
      const deleted = DevTrackStore.deleteTask(id);
      if (!deleted) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: 'Task deleted successfully' });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
