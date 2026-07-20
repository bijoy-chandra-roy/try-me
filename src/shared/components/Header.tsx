'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { Tooltip } from '@/shared/components/Tooltip';
import { Button } from '@/shared/components/Button';
import { ROLE_LABELS, getDashboardPath, isUserRole } from '@/shared/auth/roles';
import { usePermissions } from '@/shared/hooks/useAuth';
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

export function Header() {
  const { data: session, status } = useSession();
  const rawRole = session?.user?.role;
  const role = rawRole && isUserRole(rawRole) ? rawRole : undefined;
  const permissions = usePermissions();
  const isAuthenticated = status === 'authenticated';
  const { itemCount } = useCart();
  const canCart = permissions.includes('manage_cart');

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

  return (
    <header className="glass-header sticky top-0 z-sticky">
      <div className="relative mx-auto flex max-w-content items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-2">
          <Link href="/">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-primary">
              TryMe
            </h1>
          </Link>
          <Tooltip content="AI-powered virtual try-on for every product">
            <span className="chip-category cursor-default">Virtual Try-On</span>
          </Tooltip>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated && canCart && (
            <Link href="/cart" className="relative">
              <Button variant="secondary" size="sm">
                Cart
                {itemCount > 0 && (
                  <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent-fill)] px-1.5 text-xs text-[var(--color-on-accent)]">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
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
                <span className="hidden chip-category sm:inline-block cursor-default">
                  {ROLE_LABELS[role]}
                </span>
              </Tooltip>
              <Link href={getDashboardPath(role)}>
                <Button size="sm">Dashboard</Button>
              </Link>
              <Link href="/dashboard/settings/profile" className="hidden sm:block">
                <Button variant="secondary" size="sm">
                  Settings
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                Sign out
              </Button>
            </>
          ) : isAuthenticated ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign out
            </Button>
          ) : status !== 'loading' ? (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">Register</Button>
              </Link>
            </>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
