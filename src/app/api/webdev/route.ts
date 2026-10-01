import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to fetch from PostgreSQL
    try {
      const dbTopics = await prisma.topic.findMany({
        where: { category: 'WEB_DEV' },
        include: {
          learningProgress: {
            where: { userId: authUser.userId },
          },
          lessons: {
            orderBy: { orderIndex: 'asc' },
          },
        },
      });

      if (dbTopics && dbTopics.length > 0) {
        return NextResponse.json({ success: true, topics: dbTopics, source: 'database' });
      }
    } catch (dbErr) {
      console.error('WebDev DB GET fallback:', dbErr);
    }

    // Fallback store
    const topics = DevTrackStore.getWebDevTopics();
    return NextResponse.json({ success: true, topics, source: 'store' });
  } catch (error: any) {
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
    const { id, isCompleted, confidence, notes, nextRevisionAt, ...otherUpdates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Topic ID is required' }, { status: 400 });
    }

    try {
      // Upsert learning progress for this user & topic
      await prisma.learningProgress.upsert({
        where: {
          userId_topicId: {
            userId: authUser.userId,
            topicId: id,
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
          topicId: id,
          isCompleted: isCompleted ?? false,
          confidence: confidence ? Number(confidence) : 3,
          notes,
          nextRevisionAt: nextRevisionAt ? new Date(nextRevisionAt) : null,
          lastStudiedAt: new Date(),
        },
      });
    } catch (dbErr) {
      console.error('WebDev PATCH DB fallback:', dbErr);
    }

    DevTrackStore.updateWebDevTopic(id, { isCompleted, confidence, notes, ...otherUpdates });
    return NextResponse.json({ success: true });
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
    const { name, description, theory } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Module name is required' }, { status: 400 });
    }

    const slug = 'custom_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now();

    try {
      const newTopic = await prisma.topic.create({
        data: {
          category: 'WEB_DEV',
          name,
          slug,
          description: description || 'Custom Web Development Module',
          theory: theory || '',
          progressionLevel: 'INTERMEDIATE',
        },
      });
      return NextResponse.json({ success: true, topic: newTopic }, { status: 201 });
    } catch (dbErr) {
      console.error('WebDev POST DB fallback:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Custom topic added' }, { status: 201 });
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
      return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
    }

    // System modules protect
    const systemSlugs = ['html_css', 'javascript_es6', 'react_deep_dive', 'node_express', 'mongodb_sql', 'auth_security', 'nextjs_typescript', 'testing_cicd'];

    try {
      const topic = await prisma.topic.findUnique({ where: { id } });
      if (topic && systemSlugs.includes(topic.slug)) {
        return NextResponse.json(
          { success: false, error: 'System curriculum modules cannot be deleted. You can mark them completed.' },
          { status: 403 }
        );
      }

      if (topic) {
        await prisma.topic.delete({ where: { id } });
        return NextResponse.json({ success: true, message: 'Custom module deleted' });
      }
    } catch (dbErr) {
      console.error('WebDev DELETE DB fallback:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
