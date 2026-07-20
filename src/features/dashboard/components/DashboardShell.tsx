'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROLE_LABELS } from '@/shared/auth/roles';
import { GlassButton } from '@/shared/components/GlassButton';

const NAV_ITEMS: Record<string, { href: string; label: string }[]> = {
  customer: [{ href: '/dashboard/customer', label: 'Overview' }],
  merchant: [{ href: '/dashboard/merchant', label: 'Products' }],
  support: [{ href: '/dashboard/support', label: 'User Lookup' }],
  admin: [{ href: '/dashboard/admin', label: 'Admin Panel' }],
  super_admin: [{ href: '/dashboard/super-admin', label: 'System Control' }],
};

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

  const navItems = role ? (NAV_ITEMS[role] ?? []) : [];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl gap-6 px-6 py-8">
      <aside className="glass-card hidden w-56 shrink-0 flex-col rounded-2xl p-5 md:flex">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wider text-sand-500">Dashboard</p>
          <p className="mt-1 font-medium">{user?.name}</p>
          {role && (
            <span className="chip-category mt-2 inline-block">{ROLE_LABELS[role]}</span>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                pathname === item.href
                  ? 'bg-olive-600/10 font-medium text-olive-700 dark:text-sand-100'
                  : 'text-sand-600 hover:bg-sand-200/40 dark:text-sand-300 dark:hover:bg-olive-600/20'
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="mt-2 rounded-lg px-3 py-2 text-sm text-sand-600 hover:bg-sand-200/40 dark:text-sand-300 dark:hover:bg-olive-600/20"
          >
            Back to Catalog
          </Link>
        </nav>

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
            <p className="mt-2 text-sand-600 dark:text-sand-300">{description}</p>
          )}
        </header>
        {children}
      </div>
    </div>
  );
}
