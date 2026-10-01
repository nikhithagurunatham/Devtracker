import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const moodSchema = z.object({
  score: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5).optional().nullable(),
  stress: z.number().int().min(1).max(5).optional().nullable(),
  sleepHours: z.number().positive().optional().nullable(),
  note: z.string().optional().nullable(),
  date: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      const moods = DevTrackStore.getMoodLogs();
      return NextResponse.json({
        success: true,
        moods,
        correlationInsight: 'Log your mood daily to see your productivity correlation.',
        source: 'store',
      });
    }

    try {
      const dbMoods = await prisma.mood.findMany({
        where: { userId: authUser.userId },
        orderBy: { date: 'desc' },
        take: 30,
      });

      const dbSessions = await prisma.studySession.findMany({
        where: { userId: authUser.userId },
      });

      // Compute descriptive correlation
      const studyHoursByDate: Record<string, number> = {};
      dbSessions.forEach((s: any) => {
        const d = s.startTime.toISOString().split('T')[0];
        studyHoursByDate[d] = (studyHoursByDate[d] || 0) + s.durationMin / 60;
      });

      const highStudyMoods: number[] = [];
      const regularStudyMoods: number[] = [];

      dbMoods.forEach((m: any) => {
        const dStr = m.date.toISOString().split('T')[0];
        const hours = studyHoursByDate[dStr] || 0;
        if (hours >= 4) {
          highStudyMoods.push(m.score);
        } else {
          regularStudyMoods.push(m.score);
        }
      });

      let correlationInsight = 'Log your daily mood and study sessions to unlock personal productivity trends.';
      if (dbMoods.length >= 3) {
        const avgHigh = highStudyMoods.length
          ? (highStudyMoods.reduce((a, b) => a + b, 0) / highStudyMoods.length).toFixed(1)
          : null;
        const avgReg = regularStudyMoods.length
          ? (regularStudyMoods.reduce((a, b) => a + b, 0) / regularStudyMoods.length).toFixed(1)
          : null;

        if (avgHigh && avgReg) {
          correlationInsight = `On days you studied ≥4 hours, your average mood was ${avgHigh}/5 vs ${avgReg}/5 on lighter days.`;
        } else {
          correlationInsight = `Recorded ${dbMoods.length} entries. Keep logging daily to identify energy peaks!`;
        }
      }

      return NextResponse.json({
        success: true,
        moods: dbMoods.map((m: any) => ({
          id: m.id,
          date: m.date.toISOString().split('T')[0],
          score: m.score,
          energy: m.energy,
          stress: m.stress,
          sleepHours: m.sleepHours,
          note: m.note,
        })),
        correlationInsight,
        source: 'database',
      });
    } catch (dbErr) {
      console.error('Mood GET DB fallback:', dbErr);
    }

    const moods = DevTrackStore.getMoodLogs();
    return NextResponse.json({
      success: true,
      moods,
      correlationInsight: 'Log your mood daily to see your productivity correlation.',
      source: 'store',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    const body = await req.json();
    const validated = moodSchema.parse(body);

    if (!authUser) {
      const entry = DevTrackStore.logMood(validated as any);
      return NextResponse.json({ success: true, mood: entry, source: 'store' }, { status: 201 });
    }

    const logDate = validated.date ? new Date(validated.date) : new Date();
    // Normalize to date-only
    logDate.setUTCHours(0, 0, 0, 0);

    try {
      const dbMood = await prisma.mood.upsert({
        where: {
          userId_date: {
            userId: authUser.userId,
            date: logDate,
          },
        },
        update: {
          score: validated.score,
          energy: validated.energy || undefined,
          stress: validated.stress || undefined,
          sleepHours: validated.sleepHours || undefined,
          note: validated.note || undefined,
        },
        create: {
          userId: authUser.userId,
          date: logDate,
          score: validated.score,
          energy: validated.energy || null,
          stress: validated.stress || null,
          sleepHours: validated.sleepHours || null,
          note: validated.note || null,
        },
      });

      return NextResponse.json({ success: true, mood: dbMood, source: 'database' }, { status: 201 });
    } catch (dbErr) {
      console.error('Mood POST DB fallback:', dbErr);
    }

    const entry = DevTrackStore.logMood(validated as any);
    return NextResponse.json({ success: true, mood: entry, source: 'store' }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
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
    const dateStr = searchParams.get('date');

    try {
      if (id) {
        await prisma.mood.deleteMany({
          where: { id, userId: authUser.userId },
        });
      } else if (dateStr) {
        const d = new Date(dateStr);
        d.setUTCHours(0, 0, 0, 0);
        await prisma.mood.deleteMany({
          where: { date: d, userId: authUser.userId },
        });
      }
      return NextResponse.json({ success: true, message: 'Mood entry deleted' });
    } catch (dbErr) {
      console.error('Mood DELETE DB fallback:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
