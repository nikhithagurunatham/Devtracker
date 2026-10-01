import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { getAuthUser } from '@/lib/auth-helper';
import { DevTrackStore } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const createApplicationSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  location: z.string().default('Bangalore'),
  jobUrl: z.string().optional().nullable(),
  applicationDate: z.string().optional(),
  source: z.string().default('LinkedIn'),
  referralName: z.string().optional().nullable(),
  status: z.enum([
    'WISHLIST',
    'APPLIED',
    'REFERRED',
    'OA',
    'INTERVIEW',
    'TECHNICAL_ROUND',
    'HR_ROUND',
    'OFFER',
    'REJECTED',
    'WITHDRAWN',
  ]).default('APPLIED'),
  recruiter: z.string().optional().nullable(),
  salary: z.string().optional().nullable(),
  jobDescription: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  followUpDate: z.string().optional().nullable(),
  oaDate: z.string().optional().nullable(),
  interviewDate: z.string().optional().nullable(),
  offerStatus: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    try {
      const where: any = { userId: authUser.userId };
      if (status) where.status = status;

      const dbApplications = await prisma.jobApplication.findMany({
        where,
        include: { interviews: true },
        orderBy: { applicationDate: 'desc' },
      });

      if (dbApplications) {
        return NextResponse.json({ success: true, applications: dbApplications, source: 'database' });
      }
    } catch (dbErr) {
      console.error('Jobs GET DB fallback:', dbErr);
    }

    let applications = DevTrackStore.getJobApplications();
    if (status) {
      applications = applications.filter((a) => a.status === status);
    }

    return NextResponse.json({ success: true, applications, source: 'store' });
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
    const validated = createApplicationSchema.parse(body);

    try {
      const dbApp = await prisma.jobApplication.create({
        data: {
          userId: authUser.userId,
          company: validated.company,
          role: validated.role,
          location: validated.location,
          jobUrl: validated.jobUrl || null,
          applicationDate: validated.applicationDate ? new Date(validated.applicationDate) : new Date(),
          source: validated.source,
          referralName: validated.referralName || null,
          status: validated.status as any,
          recruiter: validated.recruiter || null,
          salary: validated.salary || null,
          jobDescription: validated.jobDescription || null,
          notes: validated.notes || null,
          followUpDate: validated.followUpDate ? new Date(validated.followUpDate) : null,
          oaDate: validated.oaDate ? new Date(validated.oaDate) : null,
          interviewDate: validated.interviewDate ? new Date(validated.interviewDate) : null,
          offerStatus: validated.offerStatus || null,
        },
      });

      return NextResponse.json({ success: true, application: dbApp, source: 'database' }, { status: 201 });
    } catch (dbErr) {
      console.error('Jobs POST DB fallback:', dbErr);
    }

    const app = DevTrackStore.addJobApplication(validated as any);
    return NextResponse.json({ success: true, application: app, source: 'store' }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
