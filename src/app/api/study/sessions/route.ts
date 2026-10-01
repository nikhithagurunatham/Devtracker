import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const createSessionSchema = z.object({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  durationMin: z.number().int().positive(),
  topic: z.string().min(1, 'Topic is required'),
  category: z.enum(['DSA', 'WEB_DEV', 'PROJECT', 'CS', 'JOB', 'PERSONAL', 'REVISION']).default('DSA'),
  productivity: z.number().int().min(1).max(5).default(4),
  notes: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const dbSessions = await prisma.studySession.findMany({
        where: { userId: authUser.userId },
        orderBy: { startTime: 'desc' },
      });

      if (dbSessions) {
        return NextResponse.json({ success: true, sessions: dbSessions, source: 'database' });
      }
    } catch (dbErr) {
      console.error('StudySession GET DB fallback:', dbErr);
    }

    const sessions = DevTrackStore.getStudySessions();
    return NextResponse.json({ success: true, sessions, source: 'store' });
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
    const validated = createSessionSchema.parse(body);

    try {
      const dbSession = await prisma.studySession.create({
        data: {
          userId: authUser.userId,
          startTime: validated.startTime ? new Date(validated.startTime) : new Date(),
          endTime: validated.endTime ? new Date(validated.endTime) : new Date(),
          durationMin: validated.durationMin,
          topic: validated.topic,
          category: validated.category,
          productivity: validated.productivity,
          notes: validated.notes || null,
        },
      });

      return NextResponse.json({ success: true, session: dbSession, source: 'database' }, { status: 201 });
    } catch (dbErr) {
      console.error('StudySession POST DB fallback:', dbErr);
    }

    const session = DevTrackStore.addStudySession(validated as any);
    return NextResponse.json({ success: true, session, source: 'store' }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
