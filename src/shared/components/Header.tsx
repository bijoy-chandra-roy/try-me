'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Tooltip } from '@/shared/components/Tooltip';
import { GlassButton } from '@/shared/components/GlassButton';
import { ROLE_LABELS, getDashboardPath, isUserRole } from '@/shared/auth/roles';

export function Header() {
  const { data: session, status } = useSession();
  const rawRole = session?.user?.role;
  const role = rawRole && isUserRole(rawRole) ? rawRole : undefined;
  const isAuthenticated = status === 'authenticated';

  return (
    <header className="glass-header sticky top-0 z-50">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-2">
          <Link href="/">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-olive-700 dark:text-sand-100">
              TryMe
            </h1>
          </Link>
          <Tooltip content="AI-powered virtual try-on for every product">
            <span className="chip-category cursor-default">Virtual Try-On</span>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && role ? (
            <>
              <span className="hidden chip-category sm:inline-block">{ROLE_LABELS[role]}</span>
              <Link href={getDashboardPath(role)}>
                <GlassButton className="text-sm">Dashboard</GlassButton>
              </Link>
              <GlassButton
                className="text-sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign out
              </GlassButton>
            </>
          ) : isAuthenticated ? (
            <GlassButton
              className="text-sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign out
            </GlassButton>
          ) : status !== 'loading' ? (
            <>
              <Link href="/login">
                <GlassButton className="text-sm">Sign in</GlassButton>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <GlassButton className="text-sm">Register</GlassButton>
              </Link>
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
