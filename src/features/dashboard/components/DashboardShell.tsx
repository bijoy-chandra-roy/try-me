'use client';

/**
 * Responsive contract:
 *   > 768px   expandable SideNav | content (height hugs nav content)
 *   <= 768px  hamburger drawer; global Header remains
 */

import Link from '@/shared/components/Link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronsLeft,
  ChevronsRight,
  Home,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useT } from '@/shared/hooks/useT';
import type { UserRole } from '@/shared/auth/roles';
import { getDashboardNavItems } from '@/shared/auth/navigation';
import { IconButton } from '@/shared/components/IconButton';
import { IconLink } from '@/shared/components/IconLink';
import { Drawer } from '@/shared/components/Drawer';
import { DrawerNavItem } from '@/shared/components/DrawerNavItem';
import { RoleStatusChip } from '@/shared/components/RoleStatusChip';
import { getNavIcon } from '@/shared/ui/nav-icons';
import {
  confirmSignOut,
  signOutAndClearPreferences,
} from '@/shared/lib/auth-actions';
import { DASHBOARD_NAV_COLLAPSE_KEY } from '@/shared/constants';
import type { MessageKey } from '@/shared/i18n';

const COLLAPSE_KEY = DASHBOARD_NAV_COLLAPSE_KEY;

function roleLabelKey(role: UserRole): MessageKey {
  return `roles.${role}` as MessageKey;
}

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
  const { user, role, isResolved, realRole } = useAuth();
  const t = useT();
  const navItems = role && isResolved ? getDashboardNavItems(role) : [];
  const isActive = useDashboardNavActive();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { collapsed, toggle } = useCollapsedNav();

  function handleSignOut() {
    if (!confirmSignOut(t('settings.account.signOutConfirm'))) return;
    void signOutAndClearPreferences('/');
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-content items-start gap-4 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8">
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
              <p className="text-xs uppercase tracking-wider text-muted-subtle">
                {t('dashboard.label')}
              </p>
              {isResolved ? (
                <>
                  <p className="mt-0.5 truncate font-medium text-primary">{user?.name}</p>
                  {role && (
                    <div className="mt-1.5">
                      {realRole === 'super_admin' ? (
                        <RoleStatusChip />
                      ) : (
                        <span className="chip-category inline-block">
                          {t(roleLabelKey(role))}
                        </span>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="mt-1.5 h-10 w-28 animate-pulse rounded-inner bg-[var(--color-overlay-hover)]" />
              )}
            </div>
          )}
          {collapsed && isResolved && (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-overlay-hover)] text-xs font-semibold text-primary"
              title={user?.name ?? t('dashboard.account')}
            >
              {(user?.name ?? '?').slice(0, 1).toUpperCase()}
            </span>
          )}
          {collapsed && !isResolved && (
            <span className="h-8 w-8 animate-pulse rounded-full bg-[var(--color-overlay-hover)]" />
          )}
          <IconButton
            label={collapsed ? t('dashboard.expandSidebar') : t('dashboard.collapseSidebar')}
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
          aria-label={t('dashboard.label')}
        >
          {!isResolved &&
            Array.from({ length: 4 }, (_, i) => (
              <span
                key={i}
                className={`animate-pulse rounded-inner bg-[var(--color-overlay-hover)] ${
                  collapsed ? 'h-10 w-10' : 'h-9 w-full'
                }`}
                aria-hidden
              />
            ))}
          {navItems.map((item) => {
            const href = item.hash ? `${item.href}#${item.hash}` : item.href;
            const Icon = getNavIcon(item.icon);
            const active = isActive(item);
            const label = t(item.labelKey);

            if (collapsed) {
              return (
                <IconLink
                  key={`${item.href}-${item.labelKey}`}
                  href={href}
                  label={label}
                  active={active}
                  tooltipSide="right"
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </IconLink>
              );
            }

            return (
              <Link
                key={`${item.href}-${item.labelKey}`}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-inner px-3 py-2 text-sm transition-colors ${
                  active
                    ? 'bg-[var(--color-overlay-pressed)] font-medium text-primary'
                    : 'text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}

          {collapsed ? (
            <IconLink
              href="/"
              label={t('dashboard.backToCatalog')}
              tooltipSide="right"
              className="mt-2"
            >
              <Home className="h-5 w-5" strokeWidth={1.75} />
            </IconLink>
          ) : (
            <Link
              href="/"
              className="mt-2 flex items-center gap-3 rounded-inner px-3 py-2 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
            >
              <Home className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              <span>{t('dashboard.backToCatalog')}</span>
            </Link>
          )}
        </nav>

        <div className={`mt-3 border-t border-subtle pt-3 ${collapsed ? '' : 'w-full'}`}>
          {collapsed ? (
            <IconButton
              label={t('nav.signOut')}
              tooltipSide="right"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" strokeWidth={1.75} />
            </IconButton>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-inner px-3 py-2 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
            >
              <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              {t('nav.signOut')}
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
            {isResolved && role && (
              <p className="mt-2 text-xs text-muted-subtle md:hidden">
                {user?.name} · {t(roleLabelKey(role))}
              </p>
            )}
          </div>
          <IconButton
            label={t('dashboard.openMenu')}
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
        title={t('dashboard.label')}
        side="left"
      >
        <div className="mb-4">
          {isResolved ? (
            <>
              <p className="font-medium text-primary">{user?.name}</p>
              {role && (
                <div className="mt-2">
                  {realRole === 'super_admin' ? (
                    <RoleStatusChip />
                  ) : (
                    <span className="chip-category inline-block">
                      {t(roleLabelKey(role))}
                    </span>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="h-10 w-32 animate-pulse rounded-inner bg-[var(--color-overlay-hover)]" />
          )}
        </div>
        <nav className="flex flex-col gap-1" aria-label={t('dashboard.label')}>
          {navItems.map((item) => {
            const href = item.hash ? `${item.href}#${item.hash}` : item.href;
            return (
              <DrawerNavItem
                key={`${item.href}-${item.labelKey}`}
                href={href}
                label={t(item.labelKey)}
                icon={getNavIcon(item.icon)}
                active={isActive(item)}
                onClick={() => setMobileOpen(false)}
              />
            );
          })}
          <DrawerNavItem
            href="/"
            label={t('dashboard.backToCatalog')}
            icon={Home}
            onClick={() => setMobileOpen(false)}
          />
        </nav>
        <button
          type="button"
          onClick={() => {
            setMobileOpen(false);
            handleSignOut();
          }}
          className="mt-4 flex w-full items-center gap-3 rounded-inner px-3 py-2.5 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
        >
          <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
          {t('nav.signOut')}
        </button>
      </Drawer>
    </div>
  );
}
