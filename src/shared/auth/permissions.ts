import type { UserRole } from './roles';

export const PERMISSIONS = [
  'browse_catalog',
  'try_on',
  'view_own_try_on_history',
  'view_all_try_on_history',
  'manage_own_profile',
  'view_users',
  'manage_products',
  'manage_merchants',
  'manage_users',
  'assign_roles',
  'view_system_health',
  'manage_system',
  'manage_cart',
  'place_orders',
  'view_own_orders',
  'fulfill_orders',
  'view_all_orders',
  'manage_reviews',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  customer: [
    'browse_catalog',
    'try_on',
    'view_own_try_on_history',
    'manage_own_profile',
    'manage_cart',
    'place_orders',
    'view_own_orders',
    'manage_reviews',
  ],
  merchant: [
    'browse_catalog',
    'try_on',
    'view_own_try_on_history',
    'manage_own_profile',
    'manage_products',
    'manage_merchants',
    'manage_cart',
    'place_orders',
    'view_own_orders',
    'fulfill_orders',
    'manage_reviews',
  ],
  support: [
    'browse_catalog',
    'try_on',
    'view_own_try_on_history',
    'view_all_try_on_history',
    'manage_own_profile',
    'view_users',
    'view_system_health',
    'manage_cart',
    'place_orders',
    'view_own_orders',
    'view_all_orders',
    'manage_reviews',
  ],
  admin: [
    'browse_catalog',
    'try_on',
    'view_own_try_on_history',
    'view_all_try_on_history',
    'manage_own_profile',
    'view_users',
    'manage_products',
    'manage_merchants',
    'manage_users',
    'assign_roles',
    'view_system_health',
    'manage_cart',
    'place_orders',
    'view_own_orders',
    'fulfill_orders',
    'view_all_orders',
    'manage_reviews',
  ],
  super_admin: [...PERMISSIONS],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function getPermissionsForRole(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role];
}

export const DASHBOARD_ROLE_ACCESS: Record<string, UserRole[]> = {
  '/dashboard/customer': ['customer'],
  '/dashboard/merchant': ['merchant'],
  '/dashboard/support': ['support'],
  '/dashboard/admin': ['admin'],
  '/dashboard/super-admin': ['super_admin'],
  '/dashboard/settings': ['customer', 'merchant', 'support', 'admin', 'super_admin'],
};

export function canAccessDashboardPath(role: UserRole, pathname: string): boolean {
  // Longer paths first so /dashboard/settings wins over /dashboard
  const entries = Object.entries(DASHBOARD_ROLE_ACCESS).sort(
    ([a], [b]) => b.length - a.length
  );
  for (const [path, roles] of entries) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return roles.includes(role);
    }
  }
  return pathname === '/dashboard';
}
