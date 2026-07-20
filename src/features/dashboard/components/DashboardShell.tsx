'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROLE_LABELS } from '@/shared/auth/roles';
import { getDashboardNavItems } from '@/shared/auth/navigation';
import { ROLE_CAPABILITIES } from '@/shared/auth/navigation';
import { GlassButton } from '@/shared/components/GlassButton';

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const navItems = role ? getDashboardNavItems(role) : [];
  const capabilities = role ? ROLE_CAPABILITIES[role] : [];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-start gap-6 px-6 py-8">
      <aside className="glass-card sticky top-24 hidden w-60 shrink-0 flex-col rounded-2xl p-5 md:flex">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-muted-subtle">Dashboard</p>
          <p className="mt-1 font-medium">{user?.name}</p>
          {role && (
            <span className="chip-category mt-2 inline-block">{ROLE_LABELS[role]}</span>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const href = item.hash ? `${item.href}#${item.hash}` : item.href;
            const isActive =
              pathname === item.href &&
              (typeof window !== 'undefined'
                ? !item.hash || window.location.hash === `#${item.hash}`
                : !item.hash);

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-olive-600/10 font-medium text-olive-700 dark:text-sand-100'
                    : 'text-sand-600 hover:bg-sand-200/40 dark:text-sand-300 dark:hover:bg-olive-600/20'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/"
            className="mt-2 rounded-lg px-3 py-2 text-sm text-sand-600 hover:bg-sand-200/40 dark:text-sand-300 dark:hover:bg-olive-600/20"
          >
            Back to Catalog
          </Link>
        </nav>

        {capabilities.length > 0 && (
          <div className="mt-4 border-t border-subtle pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-subtle">Your access</p>
            <ul className="mt-2 space-y-1">
              {capabilities.map((cap) => (
                <li key={cap} className="text-xs text-muted">
                  {cap}
                </li>
              ))}
            </ul>
          </div>
        )}

        <GlassButton
          onClick={() => signOut({ callbackUrl: '/' })}
          className="mt-4 w-full text-sm"
        >
          Sign out
        </GlassButton>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-olive-700 dark:text-sand-100">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-muted">{description}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
