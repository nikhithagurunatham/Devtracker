import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/db';

const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resetSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    // In production: dispatch secure reset token via email service
    // Always return success message to prevent user email enumeration
    return NextResponse.json({
      success: true,
      message:
        'If an account exists with this email, password reset instructions have been dispatched.',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.errors[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Password reset request failed' },
      { status: 500 }
    );
  }
}
