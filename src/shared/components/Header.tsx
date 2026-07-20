'use client';

import { useState } from 'react';
import Link from '@/shared/components/Link';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Settings,
  ShoppingCart,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Tooltip } from '@/shared/components/Tooltip';
import { IconButton } from '@/shared/components/IconButton';
import { IconLink } from '@/shared/components/IconLink';
import { Drawer } from '@/shared/components/Drawer';
import { DrawerNavItem } from '@/shared/components/DrawerNavItem';
import { ROLE_LABELS, getDashboardPath } from '@/shared/auth/roles';
import { useAuth } from '@/shared/hooks/useAuth';
import { useCart } from '@/features/cart/hooks/useCart';

const PERMISSION_SHORT_LABELS: Record<string, string> = {
  manage_products: 'Products',
  manage_users: 'Users',
  view_users: 'User lookup',
  view_system_health: 'System health',
  manage_system: 'System config',
  assign_roles: 'Role management',
  fulfill_orders: 'Orders',
  view_all_orders: 'All orders',
};

function AuthActionPlaceholder({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className="inline-flex h-10 w-10 shrink-0"
          aria-hidden
        />
      ))}
    </>
  );
}

export function Header() {
  const { role, permissions, isAuthenticated, isResolved } = useAuth();
  const { itemCount } = useCart();
  const canCart = permissions.includes('manage_cart');
  const [menuOpen, setMenuOpen] = useState(false);

  const staffPermissions = permissions.filter(
    (p) =>
      p !== 'browse_catalog' &&
      p !== 'try_on' &&
      p !== 'view_own_try_on_history' &&
      p !== 'manage_own_profile' &&
      p !== 'manage_cart' &&
      p !== 'place_orders' &&
      p !== 'view_own_orders' &&
      p !== 'manage_reviews'
  );

  const dashboardHref = role ? getDashboardPath(role) : '/dashboard';

  return (
    <header className="glass-header sticky top-0 z-sticky">
      <div className="relative mx-auto flex max-w-content items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <Link href="/" className="shrink-0">
            <h1 className="font-serif text-xl font-semibold tracking-tight text-primary sm:text-2xl">
              TryMe
            </h1>
          </Link>
          <Tooltip content="AI-powered virtual try-on for every product">
            <span className="chip-category hidden cursor-default sm:inline-flex sm:items-center">
              <Sparkles className="mr-1 h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
              Virtual Try-On
            </span>
          </Tooltip>
        </div>

        {/* Desktop / tablet icon actions */}
        <div className="hidden items-center gap-1 sm:flex">
          {!isResolved ? (
            <AuthActionPlaceholder count={3} />
          ) : (
            <>
              {isAuthenticated && canCart && (
                <IconLink href="/cart" label="Cart" badge={itemCount}>
                  <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
                </IconLink>
              )}
              {isAuthenticated && role ? (
                <>
                  <Tooltip
                    content={
                      staffPermissions.length > 0
                        ? `Access: ${staffPermissions.map((p) => PERMISSION_SHORT_LABELS[p] ?? p).join(', ')}`
                        : ROLE_LABELS[role]
                    }
                  >
                    <span className="chip-category mx-1 hidden cursor-default md:inline-block">
                      {ROLE_LABELS[role]}
                    </span>
                  </Tooltip>
                  <IconLink href={dashboardHref} label="Dashboard">
                    <LayoutDashboard className="h-5 w-5" strokeWidth={1.75} />
                  </IconLink>
                  <IconLink href="/settings/profile" label="Settings">
                    <Settings className="h-5 w-5" strokeWidth={1.75} />
                  </IconLink>
                  <IconButton label="Sign out" onClick={() => signOut({ callbackUrl: '/' })}>
                    <LogOut className="h-5 w-5" strokeWidth={1.75} />
                  </IconButton>
                </>
              ) : isAuthenticated ? (
                <IconButton label="Sign out" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="h-5 w-5" strokeWidth={1.75} />
                </IconButton>
              ) : (
                <>
                  <IconLink href="/login" label="Sign in">
                    <LogIn className="h-5 w-5" strokeWidth={1.75} />
                  </IconLink>
                  <IconLink href="/register" label="Register">
                    <UserPlus className="h-5 w-5" strokeWidth={1.75} />
                  </IconLink>
                </>
              )}
            </>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex items-center gap-1 sm:hidden">
          {isResolved && isAuthenticated && canCart && (
            <IconLink href="/cart" label="Cart" badge={itemCount}>
              <ShoppingCart className="h-5 w-5" strokeWidth={1.75} />
            </IconLink>
          )}
          <IconButton
            label="Open menu"
            onClick={() => setMenuOpen(true)}
            showTooltip={false}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </IconButton>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="right">
        <nav className="flex flex-col gap-1" aria-label="Site menu">
          {!isResolved ? (
            <p className="px-3 py-2 text-sm text-muted-subtle">Loading…</p>
          ) : isAuthenticated && role ? (
            <>
              {role && (
                <p className="mb-2 px-3 text-xs text-muted-subtle">{ROLE_LABELS[role]}</p>
              )}
              <DrawerNavItem
                href={dashboardHref}
                label="Dashboard"
                icon={LayoutDashboard}
                onClick={() => setMenuOpen(false)}
              />
              <DrawerNavItem
                href="/settings/profile"
                label="Settings"
                icon={Settings}
                onClick={() => setMenuOpen(false)}
              />
              {canCart && (
                <DrawerNavItem
                  href="/cart"
                  label="Cart"
                  icon={ShoppingCart}
                  badge={itemCount}
                  onClick={() => setMenuOpen(false)}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void signOut({ callbackUrl: '/' });
                }}
                className="mt-2 flex items-center gap-3 rounded-inner px-3 py-2.5 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
              >
                <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                Sign out
              </button>
            </>
          ) : isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                void signOut({ callbackUrl: '/' });
              }}
              className="flex items-center gap-3 rounded-inner px-3 py-2.5 text-sm text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary"
            >
              <LogOut className="h-5 w-5 shrink-0" strokeWidth={1.75} />
              Sign out
            </button>
          ) : (
            <>
              <DrawerNavItem
                href="/login"
                label="Sign in"
                icon={LogIn}
                onClick={() => setMenuOpen(false)}
              />
              <DrawerNavItem
                href="/register"
                label="Register"
                icon={UserPlus}
                onClick={() => setMenuOpen(false)}
              />
            </>
          )}
        </nav>
      </Drawer>
    </header>
  );
}
