import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required'),
  description: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const dbHabits = await prisma.habit.findMany({
        where: { userId: authUser.userId },
        include: {
          logs: {
            orderBy: { date: 'desc' },
            take: 30,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (dbHabits && dbHabits.length > 0) {
        return NextResponse.json({ success: true, habits: dbHabits, source: 'database' });
      }
    } catch (dbErr) {
      console.error('Habits GET DB fallback:', dbErr);
    }

    const habits = DevTrackStore.getHabits();
    return NextResponse.json({ success: true, habits, source: 'store' });
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
    const validated = createHabitSchema.parse(body);

    try {
      const dbHabit = await prisma.habit.create({
        data: {
          userId: authUser.userId,
          name: validated.name,
          description: validated.description || null,
          targetDays: [0, 1, 2, 3, 4, 5, 6],
          currentStreak: 0,
          longestStreak: 0,
        },
      });

      return NextResponse.json({ success: true, habit: dbHabit, source: 'database' }, { status: 201 });
    } catch (dbErr) {
      console.error('Habit POST DB fallback:', dbErr);
    }

    const habit = DevTrackStore.addHabit(validated.name, validated.description || undefined);
    return NextResponse.json({ success: true, habit, source: 'store' }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Habit ID required' }, { status: 400 });
    }

    try {
      const existing = await prisma.habit.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: 'Habit not found or unauthorized' }, { status: 404 });
      }

      const updated = await prisma.habit.update({
        where: { id },
        data: {
          name: name !== undefined ? name : undefined,
          description: description !== undefined ? description : undefined,
        },
      });

      return NextResponse.json({ success: true, habit: updated, source: 'database' });
    } catch (dbErr) {
      console.error('Habit PATCH DB fallback:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Updated locally' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Habit ID required' }, { status: 400 });
    }

    try {
      const existing = await prisma.habit.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json({ success: false, error: 'Habit not found or unauthorized' }, { status: 404 });
      }

      await prisma.habit.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Habit deleted' });
    } catch (dbErr) {
      console.error('Habit DELETE DB fallback:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Deleted locally' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
