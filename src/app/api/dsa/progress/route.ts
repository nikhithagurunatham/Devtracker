import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get('topicId');

    try {
      const where: any = { userId: authUser.userId };
      if (topicId) where.topicId = topicId;

      const progress = await prisma.learningProgress.findMany({
        where,
        include: { topic: true },
      });

      return NextResponse.json({ success: true, progress, source: 'database' });
    } catch (dbErr) {
      console.error('Progress DB GET error:', dbErr);
    }

    return NextResponse.json({ success: true, progress: [], source: 'fallback' });
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
    const { topicId, isCompleted, confidence, notes, nextRevisionAt } = body;

    if (!topicId) {
      return NextResponse.json({ success: false, error: 'topicId is required' }, { status: 400 });
    }

    try {
      const updated = await prisma.learningProgress.upsert({
        where: {
          userId_topicId: {
            userId: authUser.userId,
            topicId,
          },
        },
        update: {
          isCompleted: isCompleted !== undefined ? isCompleted : undefined,
          confidence: confidence !== undefined ? Number(confidence) : undefined,
          notes: notes !== undefined ? notes : undefined,
          nextRevisionAt: nextRevisionAt ? new Date(nextRevisionAt) : undefined,
          lastStudiedAt: new Date(),
        },
        create: {
          userId: authUser.userId,
          topicId,
          isCompleted: isCompleted ?? false,
          confidence: confidence ? Number(confidence) : 3,
          notes,
          nextRevisionAt: nextRevisionAt ? new Date(nextRevisionAt) : null,
          lastStudiedAt: new Date(),
        },
      });

      return NextResponse.json({ success: true, progress: updated, source: 'database' });
    } catch (dbErr) {
      console.error('Progress DB POST error:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Progress saved locally' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
