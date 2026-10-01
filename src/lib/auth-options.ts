import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'developer@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password.');
        }

        const email = credentials.email.toLowerCase().trim();

        // 1. Look up user in PostgreSQL
        let user = await prisma.user.findUnique({
          where: { email },
        });

        // 2. Special fallback for default demo candidate if DB wasn't seeded yet
        if (!user && (email === 'nikhitha.dev@example.com' || email === 'developer@example.com')) {
          const defaultHash = await bcrypt.hash('password123', 10);
          user = await prisma.user.create({
            data: {
              name: 'Nikhitha',
              email: 'nikhitha.dev@example.com',
              passwordHash: defaultHash,
              targetRole: 'SDE-1',
              targetCompanies: ['Amazon', 'Microsoft', 'Google', 'Uber'],
              skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'C++', 'Python'],
              dailyStudyTarget: 5.0,
              goalTitle: 'Become Amazon SDE-1 interview ready',
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
          });
        }

        if (!user || !user.passwordHash) {
          throw new Error('Invalid email or password.');
        }

        // 3. Verify password hash using bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user.id,
          name: user.name || 'Nikhitha',
          email: user.email,
          image: user.image || null,
        };
      },
    }),
  ],
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.sub || (token as any).id;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    'devtrack-super-secret-key-change-in-production-min-32-chars',
};
