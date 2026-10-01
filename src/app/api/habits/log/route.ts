import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { habitId, date } = body;

    if (!habitId || !date) {
      return NextResponse.json({ success: false, error: 'habitId and date (YYYY-MM-DD) are required' }, { status: 400 });
    }

    try {
      const habit = await prisma.habit.findFirst({
        where: { id: habitId, userId: authUser.userId },
      });

      if (habit) {
        const logDate = new Date(date);
        const existingLog = await prisma.habitLog.findUnique({
          where: {
            habitId_date: {
              habitId,
              date: logDate,
            },
          },
        });

        if (existingLog) {
          // Toggle or undo completion
          await prisma.habitLog.delete({
            where: { id: existingLog.id },
          });
        } else {
          // Mark complete
          await prisma.habitLog.create({
            data: {
              habitId,
              date: logDate,
              completed: true,
            },
          });
        }

        // Calculate real streak from logs
        const allLogs = await prisma.habitLog.findMany({
          where: { habitId },
          orderBy: { date: 'desc' },
        });

        let currentStreak = 0;
        let checkDate = new Date();
        // Normalize checkDate to date only
        checkDate.setHours(0, 0, 0, 0);

        const logDatesSet = new Set(
          allLogs.map((l: any) => l.date.toISOString().split('T')[0])
        );

        const todayStr = checkDate.toISOString().split('T')[0];
        checkDate.setDate(checkDate.getDate() - 1);
        const yesterdayStr = checkDate.toISOString().split('T')[0];

        // If today is logged, streak starts counting from today
        // If today is not logged yet, streak can continue if yesterday was logged
        let ptr = new Date();
        ptr.setHours(0, 0, 0, 0);
        if (!logDatesSet.has(todayStr) && logDatesSet.has(yesterdayStr)) {
          ptr.setDate(ptr.getDate() - 1);
        }

        while (true) {
          const s = ptr.toISOString().split('T')[0];
          if (logDatesSet.has(s)) {
            currentStreak++;
            ptr.setDate(ptr.getDate() - 1);
          } else {
            break;
          }
        }

        const longestStreak = Math.max(habit.longestStreak, currentStreak);

        const updatedHabit = await prisma.habit.update({
          where: { id: habitId },
          data: {
            currentStreak,
            longestStreak,
          },
          include: { logs: true },
        });

        return NextResponse.json({ success: true, habit: updatedHabit, source: 'database' });
      }
    } catch (dbErr) {
      console.error('HabitLog POST DB fallback:', dbErr);
    }

    const updated = DevTrackStore.toggleHabit(habitId, date);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, habit: updated, source: 'store' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
