'use client';

/**
 * Responsive contract:
 *   > 768px   expandable SideNav | content (height hugs nav content)
 *   <= 768px  hamburger drawer; global Header remains
 */

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  ChevronsLeft,
  ChevronsRight,
  Home,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { ROLE_LABELS } from '@/shared/auth/roles';
import { getDashboardNavItems } from '@/shared/auth/navigation';
import { IconButton } from '@/shared/components/IconButton';
import { IconLink } from '@/shared/components/IconLink';
import { Drawer } from '@/shared/components/Drawer';
import { DrawerNavItem } from '@/shared/components/DrawerNavItem';
import { getNavIcon } from '@/shared/ui/nav-icons';

const COLLAPSE_KEY = 'dashboard-nav-collapsed';

function useDashboardNavActive() {
  const pathname = usePathname();
  const [hash, setHash] = useState('');

  useEffect(() => {
    function sync() {
      setHash(window.location.hash);
    }
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, [pathname]);

  return function isActive(item: { href: string; hash?: string; matchPrefix?: boolean }) {
    if (item.matchPrefix) {
      return pathname === item.href || pathname.startsWith(`${item.href}/`);
    }
    if (pathname !== item.href) return false;
    if (!item.hash) return !hash || hash === '#';
    return hash === `#${item.hash}`;
  };
}

function useCollapsedNav() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  return { collapsed, toggle };
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
  const { user, role } = useAuth();
  const navItems = role ? getDashboardNavItems(role) : [];
  const isActive = useDashboardNavActive();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggle } = useCollapsedNav();

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-content items-start gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
      {/* Desktop sidenav — height follows content, not page height */}
      <aside
        className={`glass-card sticky top-24 hidden shrink-0 flex-col md:flex ${
          collapsed ? 'w-14 items-center gap-1 p-2' : 'w-[var(--layout-sidenav-width)] gap-1 p-4'
        }`}
      >
        <div
          className={`mb-3 flex w-full items-center ${
            collapsed ? 'flex-col gap-2' : 'justify-between gap-2'
          }`}
        >
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-subtle">Dashboard</p>
              <p className="mt-0.5 truncate font-medium text-primary">{user?.name}</p>
              {role && (
                <span className="chip-category mt-1.5 inline-block">{ROLE_LABELS[role]}</span>
              )}
            </div>
          )}
          {collapsed && (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-overlay-hover)] text-xs font-semibold text-primary"
              title={user?.name ?? 'Account'}
            >
              {(user?.name ?? '?').slice(0, 1).toUpperCase()}
            </span>
          )}
          <IconButton
            label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            tooltipSide="right"
            size="sm"
            onClick={toggle}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
            )}
          </IconButton>
        </div>

        <nav
          className={`flex flex-col gap-1 ${collapsed ? 'items-center' : ''}`}
          aria-label="Dashboard"
        >
          {navItems.map((item) => {
            const href = item.hash ? `${item.href}#${item.hash}` : item.href;
            const Icon = getNavIcon(item.icon);
            const active = isActive(item);

            if (collapsed) {
              return (
                <IconLink
                  key={`${item.href}-${item.label}`}
                  href={href}
                  label={item.label}
                  active={active}
                  tooltipSide="right"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </IconLink>
              );
            }

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-inner px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--color-overlay-pressed)] font-medium text-primary'
                    : 'text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

          {collapsed ? (
            <IconLink href="/" label="Back to Catalog" tooltipSide="right" className="mt-2">
              <Home className="h-5 w-5" strokeWidth={1.75} />
            </IconLink>
          ) : (
            <Link
              href="/"
              className="mt-2 flex items-center gap-3 rounded-inner px-3 py-2 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
            >
              <Home className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span>Back to Catalog</span>
            </Link>
          )}
        </nav>

        <div className={`mt-3 border-t border-subtle pt-3 ${collapsed ? '' : 'w-full'}`}>
          {collapsed ? (
            <IconButton
              label="Sign out"
              tooltipSide="right"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
          ) : (
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex w-full items-center gap-3 rounded-inner px-3 py-2 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
            >
              <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="mb-6 flex items-start justify-between gap-3 sm:mb-8">
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">{title}</h1>
            {description && (
              <p className="mt-1 text-sm text-muted sm:mt-2 sm:text-base">{description}</p>
            )}
            {role && (
              <p className="mt-2 text-xs text-muted-subtle md:hidden">
                {user?.name} · {ROLE_LABELS[role]}
              </p>
            )}
          </div>
          <IconButton
            label="Open dashboard menu"
            className="shrink-0 md:hidden"
            showTooltip={false}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>
        </header>

        {children}
      </div>

      <Drawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Dashboard"
        side="left"
      >
        <div className="mb-4">
          <p className="font-medium text-primary">{user?.name}</p>
          {role && (
            <span className="chip-category mt-2 inline-block">{ROLE_LABELS[role]}</span>
          )}
        </div>
        <nav className="flex flex-col gap-1" aria-label="Dashboard">
          {navItems.map((item) => {
            const href = item.hash ? `${item.href}#${item.hash}` : item.href;
            return (
              <DrawerNavItem
                key={`${item.href}-${item.label}`}
                href={href}
                label={item.label}
                icon={getNavIcon(item.icon)}
                active={isActive(item)}
                onClick={() => setMobileOpen(false)}
              />
            );
          })}
          <DrawerNavItem
            href="/"
            label="Back to Catalog"
            icon={Home}
            onClick={() => setMobileOpen(false)}
          />
        </nav>
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            void signOut({ callbackUrl: '/' });
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-inner px-3 py-2.5 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          Sign out
        </button>
      </Drawer>
    </div>
  );
}
