import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import type { UserRole } from '@/shared/auth/roles';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    merchantId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      merchantId?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    merchantId?: string | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { ensureDbConnection } = await import('@/server/db/connection');
        const { authService } = await import('@/server/features/auth/auth.service');

        await ensureDbConnection();

        try {
          const user = await authService.validateCredentials(
            String(credentials.email),
            String(credentials.password)
          );

          if (!user) return null;

          return {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            merchantId: user.merchantId ?? null,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.merchantId = user.merchantId ?? null;
      }

      if (trigger === 'update' && token.id) {
        const { ensureDbConnection } = await import('@/server/db/connection');
        const { userRepository } = await import('@/server/features/auth/user.repository');
        await ensureDbConnection();
        const freshUser = await userRepository.findById(token.id);
        if (freshUser) {
          token.role = freshUser.role;
          token.merchantId = freshUser.merchantId ?? null;
          token.name = freshUser.name;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.merchantId = token.merchantId ?? null;
      return session;
    },
  },
  trustHost: true,
});
