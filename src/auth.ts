import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { isUserRole, type UserRole } from '@/shared/auth/roles';
import { getSiteUrl } from '@/shared/lib/site-url';

// Keep Auth.js aligned with the single site URL env when AUTH_URL is unset.
if (!process.env.AUTH_URL) {
  process.env.AUTH_URL = getSiteUrl();
}

export type AssumeRoleUpdate = {
  assumeRole?: UserRole | null;
  merchantId?: string | null;
};

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
      realRole: UserRole;
      actingAsRole?: UserRole | null;
      merchantId?: string | null;
      status?: 'active' | 'inactive';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    realRole?: UserRole;
    actingAsRole?: UserRole | null;
    actingAsMerchantId?: string | null;
    merchantId?: string | null;
    status?: 'active' | 'inactive';
    roleSyncedAt?: number;
  }
}

const ROLE_SYNC_INTERVAL_MS = 15_000;

type SyncableToken = {
  id?: string;
  role?: UserRole;
  realRole?: UserRole;
  actingAsRole?: UserRole | null;
  actingAsMerchantId?: string | null;
  merchantId?: string | null;
  name?: string | null;
  status?: 'active' | 'inactive';
  roleSyncedAt?: number;
};

function clearAssumeOverlay(token: SyncableToken) {
  token.actingAsRole = null;
  token.actingAsMerchantId = null;
  if (token.realRole) {
    token.role = token.realRole;
  }
}

function applyEffectiveRole(token: SyncableToken) {
  if (
    token.realRole === 'super_admin' &&
    token.actingAsRole &&
    isUserRole(token.actingAsRole) &&
    token.actingAsRole !== 'super_admin'
  ) {
    token.role = token.actingAsRole;
    return;
  }
  clearAssumeOverlay(token);
}

function applyAssumeUpdate(token: SyncableToken, update: AssumeRoleUpdate) {
  if (token.realRole !== 'super_admin') {
    clearAssumeOverlay(token);
    return;
  }

  if (!('assumeRole' in update)) {
    return;
  }

  const nextRole = update.assumeRole;

  if (nextRole == null || nextRole === 'super_admin') {
    clearAssumeOverlay(token);
    return;
  }

  if (!isUserRole(nextRole)) {
    return;
  }

  if (nextRole === 'merchant') {
    const merchantId = update.merchantId;
    if (!merchantId || typeof merchantId !== 'string') {
      return;
    }
    token.actingAsRole = 'merchant';
    token.actingAsMerchantId = merchantId;
    token.role = 'merchant';
    return;
  }

  token.actingAsRole = nextRole;
  token.actingAsMerchantId = null;
  token.role = nextRole;
}

async function syncUserFromDatabase(token: SyncableToken, options?: { force?: boolean }) {
  if (!token.id) return;

  const now = Date.now();
  const needsRoleBootstrap = !token.realRole;
  const force = options?.force === true;
  if (
    !force &&
    !needsRoleBootstrap &&
    token.roleSyncedAt &&
    now - token.roleSyncedAt < ROLE_SYNC_INTERVAL_MS
  ) {
    return;
  }

  const { ensureDbConnection } = await import('@/server/db/connection');
  const { userRepository } = await import('@/server/features/auth/user.repository');
  await ensureDbConnection();

  const freshUser = await userRepository.findById(token.id);
  token.roleSyncedAt = now;

  if (!freshUser || freshUser.status === 'inactive') {
    token.status = 'inactive';
    return;
  }

  token.realRole = freshUser.role;
  token.merchantId = freshUser.merchantId ?? null;
  token.name = freshUser.name;
  token.status = freshUser.status;
  applyEffectiveRole(token);
}

async function safeSyncUserFromDatabase(
  token: SyncableToken,
  options?: { force?: boolean }
) {
  try {
    await syncUserFromDatabase(token, options);
  } catch {
    // Keep existing JWT fields so assume/update is not wiped by a transient DB error.
  }
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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!;
        token.role = user.role;
        token.realRole = user.role;
        token.merchantId = user.merchantId ?? null;
        token.status = user.status ?? 'active';
        token.actingAsRole = null;
        token.actingAsMerchantId = null;
        token.roleSyncedAt = 0;
      }

      if (token.id) {
        const assumePayload =
          trigger === 'update' &&
          session &&
          typeof session === 'object' &&
          'assumeRole' in (session as AssumeRoleUpdate)
            ? (session as AssumeRoleUpdate)
            : null;

        if (trigger === 'update' && !assumePayload) {
          // Bare refresh (SSE / visibility): force DB sync.
          await safeSyncUserFromDatabase(token, { force: true });
        } else if (assumePayload) {
          // Assume path: sync opportunistically; never throw away the JWT.
          // Prefer known realRole so overlay can apply even if sync is skipped.
          if (!token.realRole) {
            await safeSyncUserFromDatabase(token, { force: true });
          } else {
            await safeSyncUserFromDatabase(token, { force: false });
          }
          applyAssumeUpdate(token, assumePayload);
        } else {
          await safeSyncUserFromDatabase(token);
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.realRole = token.realRole ?? token.role;
      session.user.actingAsRole = token.actingAsRole ?? null;
      session.user.status = token.status ?? 'active';
      if (token.name) session.user.name = token.name;

      const assumingMerchant =
        token.actingAsRole === 'merchant' && Boolean(token.actingAsMerchantId);
      session.user.merchantId = assumingMerchant
        ? token.actingAsMerchantId
        : (token.merchantId ?? null);

      return session;
    },
  },
  trustHost: true,
});
