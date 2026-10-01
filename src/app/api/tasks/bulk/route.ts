import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { DevTrackStore } from '@/lib/storage';
import { getAuthUser } from '@/lib/auth-helper';

const bulkActionSchema = z.object({
  action: z.enum(['complete', 'delete', 'updatePriority', 'updateCategory', 'updateDueDate']),
  taskIds: z.array(z.string()).min(1, 'At least one task ID required'),
  value: z.any().optional(), // Priority, Category, or DueDate string
});

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { action, taskIds, value } = bulkActionSchema.parse(body);

    try {
      if (action === 'complete') {
        await prisma.todo.updateMany({
          where: { id: { in: taskIds }, userId: authUser.userId },
          data: { status: 'COMPLETED', completedAt: new Date() },
        });
      } else if (action === 'delete') {
        await prisma.todo.deleteMany({
          where: { id: { in: taskIds }, userId: authUser.userId },
        });
      } else if (action === 'updatePriority') {
        await prisma.todo.updateMany({
          where: { id: { in: taskIds }, userId: authUser.userId },
          data: { priority: value },
        });
      } else if (action === 'updateCategory') {
        await prisma.todo.updateMany({
          where: { id: { in: taskIds }, userId: authUser.userId },
          data: { category: value },
        });
      } else if (action === 'updateDueDate') {
        await prisma.todo.updateMany({
          where: { id: { in: taskIds }, userId: authUser.userId },
          data: { dueDate: value ? new Date(value) : null },
        });
      }
    } catch (e) {
      // Fallback in DevTrackStore
      if (action === 'complete') {
        DevTrackStore.bulkCompleteTasks(taskIds);
      } else if (action === 'delete') {
        DevTrackStore.bulkDeleteTasks(taskIds);
      } else if (action === 'updatePriority') {
        DevTrackStore.bulkUpdatePriority(taskIds, value);
      } else if (action === 'updateCategory') {
        DevTrackStore.bulkUpdateCategory(taskIds, value);
      } else if (action === 'updateDueDate') {
        DevTrackStore.bulkUpdateDueDate(taskIds, value);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk action "${action}" completed for ${taskIds.length} tasks`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
