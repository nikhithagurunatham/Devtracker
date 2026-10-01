import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { requireAuthUser } from '@/lib/auth-helper';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to confirm account deletion'),
});

export async function DELETE(req: NextRequest) {
  try {
    const { authUser, errorResponse } = await requireAuthUser(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { password } = deleteAccountSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { id: true, passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid password. Cannot delete account.' }, { status: 403 });
    }

    // Cascade delete user and all user-owned records
    await prisma.user.delete({
      where: { id: authUser.userId },
    });

    return NextResponse.json({
      success: true,
      message: 'Account and all associated records permanently deleted.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}
