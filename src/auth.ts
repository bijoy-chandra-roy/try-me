import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import type { UserRole } from '@/shared/auth/roles';

declare module 'next-auth' {
  interface User {
    role: UserRole;
    merchantId?: string | null;
    status?: 'active' | 'inactive';
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      merchantId?: string | null;
      status?: 'active' | 'inactive';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    merchantId?: string | null;
    status?: 'active' | 'inactive';
    roleSyncedAt?: number;
  }
}

const ROLE_SYNC_INTERVAL_MS = 15_000;

async function syncUserFromDatabase(token: {
  id?: string;
  role?: UserRole;
  merchantId?: string | null;
  name?: string | null;
  status?: 'active' | 'inactive';
  roleSyncedAt?: number;
}) {
  if (!token.id) return;

  const now = Date.now();
  if (token.roleSyncedAt && now - token.roleSyncedAt < ROLE_SYNC_INTERVAL_MS) {
    return;
  }

  const { ensureDbConnection } = await import('@/server/db/connection');
  const { userRepository } = await import('@/server/features/auth/user.repository');
  await ensureDbConnection();

  const freshUser = await userRepository.findById(token.id);
  if (!freshUser) return;

  token.role = freshUser.role;
  token.merchantId = freshUser.merchantId ?? null;
  token.name = freshUser.name;
  token.status = freshUser.status;
  token.roleSyncedAt = now;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
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
            status: user.status,
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
    async signIn({ user, account }) {
      if (account?.provider !== 'google') {
        return true;
      }

      if (!user.email) {
        return false;
      }

      const { ensureDbConnection } = await import('@/server/db/connection');
      const { authService } = await import('@/server/features/auth/auth.service');

      await ensureDbConnection();

      try {
        const dbUser = await authService.findOrCreateOAuthUser({
          email: user.email,
          name: user.name || user.email,
        });

        if (!dbUser) {
          return false;
        }

        user.id = dbUser._id;
        user.role = dbUser.role;
        user.merchantId = dbUser.merchantId ?? null;
        user.status = dbUser.status;
        return true;
      } catch {
        return false;
      }
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.merchantId = user.merchantId ?? null;
        token.status = user.status ?? 'active';
        token.roleSyncedAt = 0;
      }

      if (token.id) {
        if (trigger === 'update') {
          token.roleSyncedAt = 0;
        }
        await syncUserFromDatabase(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.merchantId = token.merchantId ?? null;
      session.user.status = token.status ?? 'active';
      if (token.name) session.user.name = token.name;
      return session;
    },
  },
  trustHost: true,
});
