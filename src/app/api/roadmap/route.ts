import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';
import { initialRoadmapDays } from '@/lib/sample-data';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
      let roadmap = await prisma.roadmap.findFirst({
        where: { userId: authUser.userId },
        include: { days: { orderBy: { dayNumber: 'asc' } } },
      });

      // If user doesn't have a roadmap in PostgreSQL yet, initialize it
      if (!roadmap) {
        roadmap = await prisma.roadmap.create({
          data: {
            userId: authUser.userId,
            title: '100-Day SDE-1 Preparation Roadmap',
            goal: 'Become Amazon SDE-1 interview ready',
            totalDays: 100,
            currentDayNumber: 1,
            endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
            days: {
              create: initialRoadmapDays.map((d: any) => ({
                dayNumber: d.dayNumber,
                phaseTitle: d.phaseTitle,
                theme: d.theme,
                dsaFocus: d.dsaFocus,
                webDevFocus: d.webDevFocus,
                csFocus: d.csFocus,
                lldFocus: d.lldFocus,
                hldFocus: d.hldFocus,
                genAiFocus: d.genAiFocus,
                projectsFocus: d.projectsFocus,
                appsFocus: d.appsFocus,
                revisionFocus: d.revisionFocus,
                targetHours: d.targetHours,
                isCompleted: false,
                notes: d.notes,
              })),
            },
          },
          include: { days: { orderBy: { dayNumber: 'asc' } } },
        });
      }

      if (roadmap) {
        const completedDays = roadmap.days.filter((d: any) => d.isCompleted).length;
        const totalDays = roadmap.days.length;
        const currentDay = roadmap.days.find((d: any) => !d.isCompleted)?.dayNumber || 1;
        const daysRemaining = totalDays - completedDays;
        const completionPercentage = Math.round((completedDays / totalDays) * 100);

        return NextResponse.json({
          success: true,
          roadmap: {
            id: roadmap.id,
            goal: roadmap.goal,
            currentDay,
            totalDays,
            completedDays,
            daysRemaining,
            completionPercentage,
            days: roadmap.days,
          },
          source: 'database',
        });
      }
    } catch (dbErr) {
      console.error('Roadmap DB fetch fallback:', dbErr);
    }

    // In-memory fallback
    const days = DevTrackStore.getRoadmapDays();
    const profile = DevTrackStore.getProfile();
    const currentDay = days.find((d) => !d.isCompleted)?.dayNumber || 1;
    const totalDays = days.length;
    const completedDays = days.filter((d) => d.isCompleted).length;
    const daysRemaining = totalDays - completedDays;
    const completionPercentage = Math.round((completedDays / totalDays) * 100);

    return NextResponse.json({
      success: true,
      roadmap: {
        goal: profile.goalTitle,
        currentDay,
        totalDays,
        completedDays,
        daysRemaining,
        completionPercentage,
        days,
      },
      source: 'store',
    });
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
    const { dayNumber, updates } = body;

    if (dayNumber === undefined || !updates) {
      return NextResponse.json({ success: false, error: 'dayNumber and updates required' }, { status: 400 });
    }

    try {
      const roadmap = await prisma.roadmap.findFirst({
        where: { userId: authUser.userId },
      });

      if (roadmap) {
        const dayRecord = await prisma.roadmapDay.findUnique({
          where: {
            roadmapId_dayNumber: {
              roadmapId: roadmap.id,
              dayNumber: Number(dayNumber),
            },
          },
        });

        if (dayRecord) {
          const updateData: any = {};
          if (updates.isCompleted !== undefined) {
            updateData.isCompleted = updates.isCompleted;
            updateData.completedAt = updates.isCompleted ? new Date() : null;
          }
          if (updates.theme !== undefined) updateData.theme = updates.theme;
          if (updates.dsaFocus !== undefined) updateData.dsaFocus = updates.dsaFocus;
          if (updates.webDevFocus !== undefined) updateData.webDevFocus = updates.webDevFocus;
          if (updates.csFocus !== undefined) updateData.csFocus = updates.csFocus;
          if (updates.projectsFocus !== undefined) updateData.projectsFocus = updates.projectsFocus;
          if (updates.notes !== undefined) updateData.notes = updates.notes;
          if (updates.targetHours !== undefined) updateData.targetHours = Number(updates.targetHours);

          const updatedDay = await prisma.roadmapDay.update({
            where: { id: dayRecord.id },
            data: updateData,
          });

          return NextResponse.json({ success: true, day: updatedDay, source: 'database' });
        }
      }
    } catch (dbErr) {
      console.error('Roadmap PATCH DB fallback:', dbErr);
    }

    // Storage fallback
    const updated = DevTrackStore.updateRoadmapDay(Number(dayNumber), updates);
    return NextResponse.json({ success: true, days: updated, source: 'store' });
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
    const { phaseTitle, theme, dsaFocus, webDevFocus, targetHours, notes } = body;

    if (!theme) {
      return NextResponse.json({ success: false, error: 'Theme is required' }, { status: 400 });
    }

    try {
      let roadmap = await prisma.roadmap.findFirst({
        where: { userId: authUser.userId },
        include: { days: { orderBy: { dayNumber: 'desc' }, take: 1 } },
      });

      if (!roadmap) {
        return NextResponse.json({ success: false, error: 'Roadmap not found' }, { status: 404 });
      }

      const nextDayNum = (roadmap.days[0]?.dayNumber || 100) + 1;

      const newDay = await prisma.roadmapDay.create({
        data: {
          roadmapId: roadmap.id,
          dayNumber: nextDayNum,
          phaseTitle: phaseTitle || 'Custom Milestones & Revision',
          theme,
          dsaFocus,
          webDevFocus,
          targetHours: Number(targetHours) || 5.0,
          notes,
          isCompleted: false,
        },
      });

      await prisma.roadmap.update({
        where: { id: roadmap.id },
        data: { totalDays: nextDayNum },
      });

      return NextResponse.json({ success: true, day: newDay, source: 'database' }, { status: 201 });
    } catch (dbErr) {
      console.error('Roadmap POST DB fallback:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Custom milestone logged' });
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
    const dayNumber = Number(searchParams.get('dayNumber'));

    if (!dayNumber) {
      return NextResponse.json({ success: false, error: 'dayNumber required' }, { status: 400 });
    }

    // Protect system curriculum (days 1 to 100)
    if (dayNumber <= 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'System curriculum days (1-100) cannot be deleted. You can mark them completed or edit your personal notes.',
        },
        { status: 403 }
      );
    }

    try {
      const roadmap = await prisma.roadmap.findFirst({
        where: { userId: authUser.userId },
      });

      if (roadmap) {
        await prisma.roadmapDay.delete({
          where: {
            roadmapId_dayNumber: {
              roadmapId: roadmap.id,
              dayNumber,
            },
          },
        });
        return NextResponse.json({ success: true, message: `Custom day ${dayNumber} deleted` });
      }
    } catch (dbErr) {
      console.error('Roadmap DELETE DB fallback:', dbErr);
    }

    return NextResponse.json({ success: true, message: 'Deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
