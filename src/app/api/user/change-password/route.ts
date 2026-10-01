import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { requireAuthUser } from '@/lib/auth-helper';

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Za-z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'New passwords do not match',
    path: ['confirmNewPassword'],
  });

export async function POST(req: NextRequest) {
  try {
    const { authUser, errorResponse } = await requireAuthUser(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const validated = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: 'User account not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(validated.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      return NextResponse.json({ success: false, error: 'Incorrect current password' }, { status: 400 });
    }

    // Hash and save new password
    const newHash = await bcrypt.hash(validated.newPassword, 10);
    await prisma.user.update({
      where: { id: authUser.userId },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}
