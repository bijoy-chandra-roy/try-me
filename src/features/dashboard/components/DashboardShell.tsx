'use client';

/**
 * Responsive contract:
 *   > 768px   nav 256 | content
 *   <= 768px  nav → MobileNav drawer; global Header remains
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROLE_LABELS } from '@/shared/auth/roles';
import { getDashboardNavItems, ROLE_CAPABILITIES } from '@/shared/auth/navigation';
import { Button } from '@/shared/components/Button';
import { IconButton } from '@/shared/components/IconButton';

function NavLinks({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const navItems = role ? getDashboardNavItems(role) : [];
  const capabilities = role ? ROLE_CAPABILITIES[role] : [];

  return (
    <>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-muted-subtle">Dashboard</p>
        <p className="mt-1 font-medium text-primary">{user?.name}</p>
        {role && (
          <span className="chip-category mt-2 inline-block">{ROLE_LABELS[role]}</span>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const href = item.hash ? `${item.href}#${item.hash}` : item.href;
          const onSettings = pathname.startsWith('/dashboard/settings');
          let isActive = false;
          if (item.matchPrefix) {
            isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          } else if (!onSettings) {
            isActive =
              pathname === item.href &&
              (typeof window !== 'undefined'
                ? !item.hash || window.location.hash === `#${item.hash}`
                : !item.hash);
          }

          return (
            <Link
              key={`${item.href}-${item.label}`}
              href={href}
              onClick={onNavigate}
              className={`rounded-inner px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-[var(--color-overlay-pressed)] font-medium text-primary'
                  : 'text-muted hover:bg-[var(--color-overlay-hover)]'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-2 rounded-inner px-3 py-2 text-sm text-muted hover:bg-[var(--color-overlay-hover)]"
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

      <Button
        variant="ghost"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-4 w-full"
      >
        Sign out
      </Button>
    </>
  );
}

export function DashboardShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-content items-start gap-6 px-6 py-8">
      {/* SideNav — desktop */}
      <aside
        className="glass-card sticky top-24 hidden w-[var(--layout-sidenav-width)] shrink-0 flex-col p-5 md:flex"
        style={{ width: 'var(--layout-sidenav-width)' }}
      >
        <NavLinks />
      </aside>

      {/* Mobile nav trigger */}
      <div className="fixed bottom-6 right-6 z-sticky md:hidden">
        <IconButton
          label={mobileOpen ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMobileOpen((o) => !o)}
          className="h-12 w-12 bg-[var(--color-accent-fill)] text-[var(--color-on-accent)] shadow-med"
        >
          {mobileOpen ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </IconButton>
      </div>

      {/* MobileNav drawer */}
      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Dismiss navigation"
            className="fixed inset-0 z-overlay bg-[var(--color-overlay)] md:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="glass-card fixed bottom-0 left-0 top-16 z-overlay flex w-[min(100%,var(--layout-sidenav-width))] flex-col overflow-y-auto p-5 md:hidden">
            <NavLinks onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      <div className="min-w-0 flex-1">
        <header className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-primary">{title}</h1>
          {description && <p className="mt-2 text-muted">{description}</p>}
        </header>
        {children}
      </div>
    </div>
  );
}
