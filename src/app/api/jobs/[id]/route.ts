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
      const app = await prisma.jobApplication.findFirst({
        where: { id, userId: authUser.userId },
        include: { interviews: true },
      });
      if (app) {
        return NextResponse.json({ success: true, application: app, source: 'database' });
      }
    } catch (dbErr) {
      console.error('Job GET [id] fallback:', dbErr);
    }

    const app = DevTrackStore.getJobApplicationById(id);
    if (!app) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, application: app, source: 'store' });
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
      const existing = await prisma.jobApplication.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Job application not found or unauthorized' },
          { status: 404 }
        );
      }

      const updateData: any = {};
      if (body.company !== undefined) updateData.company = body.company;
      if (body.role !== undefined) updateData.role = body.role;
      if (body.location !== undefined) updateData.location = body.location;
      if (body.jobUrl !== undefined) updateData.jobUrl = body.jobUrl;
      if (body.source !== undefined) updateData.source = body.source;
      if (body.referralName !== undefined) updateData.referralName = body.referralName;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.recruiter !== undefined) updateData.recruiter = body.recruiter;
      if (body.salary !== undefined) updateData.salary = body.salary;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.jobDescription !== undefined) updateData.jobDescription = body.jobDescription;
      if (body.offerStatus !== undefined) updateData.offerStatus = body.offerStatus;
      if (body.followUpDate !== undefined) {
        updateData.followUpDate = body.followUpDate ? new Date(body.followUpDate) : null;
      }
      if (body.oaDate !== undefined) {
        updateData.oaDate = body.oaDate ? new Date(body.oaDate) : null;
      }
      if (body.interviewDate !== undefined) {
        updateData.interviewDate = body.interviewDate ? new Date(body.interviewDate) : null;
      }

      const updated = await prisma.jobApplication.update({
        where: { id },
        data: updateData,
      });

      return NextResponse.json({ success: true, application: updated, source: 'database' });
    } catch (dbErr) {
      console.error('Job PATCH fallback:', dbErr);
    }

    const updated = DevTrackStore.updateJobApplication(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, application: updated, source: 'store' });
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
      const existing = await prisma.jobApplication.findFirst({
        where: { id, userId: authUser.userId },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Job application not found or unauthorized' },
          { status: 404 }
        );
      }

      await prisma.jobApplication.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Job application deleted successfully' });
    } catch (dbErr) {
      console.error('Job DELETE fallback:', dbErr);
    }

    const deleted = DevTrackStore.deleteJobApplication(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Job application not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Application deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
