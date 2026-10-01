import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';
import { requireAuthUser } from '@/lib/auth-helper';

export const dynamic = 'force-dynamic';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name cannot be empty').optional(),
  targetRole: z.string().optional(),
  targetCompanies: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  experienceYears: z.number().nonnegative().optional(),
  graduationYear: z.number().int().optional(),
  preferredLocations: z.array(z.string()).optional(),
  dailyStudyTarget: z.number().positive().max(24).optional(),
  goalTitle: z.string().optional(),
  preferences: z
    .object({
      theme: z.string().optional(),
      soundEnabled: z.boolean().optional(),
      notifications: z.boolean().optional(),
      notifyRevision: z.boolean().optional(),
      notifyInterview: z.boolean().optional(),
      notifyTaskDue: z.boolean().optional(),
      pomodoroWorkMin: z.number().int().positive().optional(),
      pomodoroBreakMin: z.number().int().positive().optional(),
    })
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { authUser, errorResponse } = await requireAuthUser(req);
    if (errorResponse) return errorResponse;

    const profile = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        targetRole: true,
        targetCompanies: true,
        skills: true,
        experienceYears: true,
        graduationYear: true,
        preferredLocations: true,
        dailyStudyTarget: true,
        goalTitle: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        updatedAt: true,
        preferences: true,
      },
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { authUser, errorResponse } = await requireAuthUser(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name.trim();
    if (validated.targetRole !== undefined) updateData.targetRole = validated.targetRole.trim();
    if (validated.targetCompanies !== undefined) updateData.targetCompanies = validated.targetCompanies;
    if (validated.skills !== undefined) updateData.skills = validated.skills;
    if (validated.experienceYears !== undefined) updateData.experienceYears = validated.experienceYears;
    if (validated.graduationYear !== undefined) updateData.graduationYear = validated.graduationYear;
    if (validated.preferredLocations !== undefined) updateData.preferredLocations = validated.preferredLocations;
    if (validated.dailyStudyTarget !== undefined) updateData.dailyStudyTarget = validated.dailyStudyTarget;
    if (validated.goalTitle !== undefined) updateData.goalTitle = validated.goalTitle.trim();

    if (validated.preferences) {
      updateData.preferences = {
        upsert: {
          create: validated.preferences,
          update: validated.preferences,
        },
      };
    }

    const updated = await prisma.user.update({
      where: { id: authUser.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        targetRole: true,
        targetCompanies: true,
        skills: true,
        experienceYears: true,
        graduationYear: true,
        preferredLocations: true,
        dailyStudyTarget: true,
        goalTitle: true,
        currentStreak: true,
        longestStreak: true,
        preferences: true,
      },
    });

    return NextResponse.json({ success: true, profile: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message || 'Failed to update profile' }, { status: 500 });
  }
}
