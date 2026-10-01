import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import prisma from '@/lib/db';

export interface AuthContext {
  userId: string;
  email: string;
  name: string;
  role?: string;
}

/**
 * Resolves the authenticated user context from:
 * 1. NextAuth JWT session cookie (standard browser sessions)
 * 2. x-user-id header (for API testing / mobile clients)
 * 3. Verified in PostgreSQL database
 */
export async function getAuthUser(req: NextRequest): Promise<AuthContext | null> {
  try {
    const secret =
      process.env.NEXTAUTH_SECRET ||
      'devtrack-super-secret-key-change-in-production-min-32-chars';

    // 1. Check NextAuth JWT token from cookie
    const token = await getToken({ req, secret });
    if (token) {
      const candidateId = (token.sub || (token as any).id) as string;
      const candidateEmail = token.email as string;

      if (candidateId) {
        const user = await prisma.user.findUnique({
          where: { id: candidateId },
          select: { id: true, email: true, name: true, role: true },
        });

        if (user) {
          return {
            userId: user.id,
            email: user.email,
            name: user.name || 'Developer',
            role: user.role,
          };
        }
      } else if (candidateEmail) {
        const user = await prisma.user.findUnique({
          where: { email: candidateEmail.toLowerCase().trim() },
          select: { id: true, email: true, name: true, role: true },
        });

        if (user) {
          return {
            userId: user.id,
            email: user.email,
            name: user.name || 'Developer',
            role: user.role,
          };
        }
      }
    }

    // 2. Check x-user-id header (e.g. CLI tools or automated tests)
    const headerUserId = req.headers.get('x-user-id');
    if (headerUserId && headerUserId.trim()) {
      const user = await prisma.user.findUnique({
        where: { id: headerUserId.trim() },
        select: { id: true, email: true, name: true, role: true },
      });
      if (user) {
        return {
          userId: user.id,
          email: user.email,
          name: user.name || 'Developer',
          role: user.role,
        };
      }
    }
  } catch (error) {
    console.error('Failed to resolve authenticated user:', error);
  }

  return null;
}

/**
 * Enforces ownership and authentication on protected API endpoints.
 * Returns either the verified AuthContext or an HTTP 401 Unauthorized response.
 */
export async function requireAuthUser(
  req: NextRequest
): Promise<
  | { authUser: AuthContext; errorResponse: null }
  | { authUser: null; errorResponse: NextResponse }
> {
  const authUser = await getAuthUser(req);
  if (!authUser) {
    return {
      authUser: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Please sign in to access this resource.',
        },
        { status: 401 }
      ),
    };
  }
  return { authUser, errorResponse: null };
}
