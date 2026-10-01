import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { initialRoadmapDays } from '@/lib/sample-data';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
    targetRole: z.string().optional().default('SDE-1'),
    targetCompanies: z.array(z.string()).optional().default(['Amazon', 'Microsoft', 'Google', 'Uber']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // 1. Check duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 2. Hash password with bcrypt
    const passwordHash = await bcrypt.hash(validated.password, 10);

    // 3. Create user in PostgreSQL
    const user = await prisma.user.create({
      data: {
        name: validated.name.trim(),
        email: validated.email,
        passwordHash,
        targetRole: validated.targetRole,
        targetCompanies: validated.targetCompanies,
        skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'C++', 'Python'],
        dailyStudyTarget: 5.0,
        goalTitle: `Become ${validated.targetRole} interview ready`,
        currentStreak: 0,
        longestStreak: 0,
        preferences: {
          create: {
            theme: 'dark',
            soundEnabled: true,
            notifications: true,
            pomodoroWorkMin: 25,
            pomodoroBreakMin: 5,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 4. Initialize user's personal 100-day roadmap in PostgreSQL
    try {
      await prisma.roadmap.create({
        data: {
          userId: user.id,
          title: `100-Day ${validated.targetRole} Preparation Roadmap`,
          goal: `Become ${validated.targetRole} interview ready`,
          totalDays: 100,
          currentDayNumber: 1,
          endDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
          days: {
            create: initialRoadmapDays.map((d) => ({
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
      });
    } catch (roadmapErr) {
      console.error('Non-critical: Roadmap initialization warning:', roadmapErr);
    }

    // Never return password hash
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! You can now sign in.',
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
