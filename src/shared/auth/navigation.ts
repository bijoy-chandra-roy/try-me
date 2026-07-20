import type { Permission } from './permissions';
import { hasPermission } from './permissions';
import type { UserRole } from './roles';

export interface DashboardNavItem {
  href: string;
  label: string;
  permission?: Permission;
  hash?: string;
}

export const DASHBOARD_NAV: Record<UserRole, DashboardNavItem[]> = {
  customer: [
    { href: '/dashboard/customer', label: 'Overview' },
    { href: '/dashboard/customer', label: 'Try-on History', permission: 'view_own_try_on_history', hash: 'history' },
    { href: '/dashboard/customer', label: 'Profile', permission: 'manage_own_profile', hash: 'profile' },
  ],
  merchant: [
    { href: '/dashboard/merchant', label: 'Products', permission: 'manage_products' },
    { href: '/dashboard/merchant', label: 'Store Profile', permission: 'manage_merchants', hash: 'store' },
    { href: '/dashboard/merchant', label: 'Analytics', permission: 'manage_products', hash: 'analytics' },
  ],
  support: [
    { href: '/dashboard/support', label: 'User Lookup', permission: 'view_users' },
    { href: '/dashboard/support', label: 'System Health', permission: 'view_system_health', hash: 'health' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', permission: 'view_system_health' },
    { href: '/dashboard/admin', label: 'Users', permission: 'manage_users', hash: 'users' },
    { href: '/dashboard/admin', label: 'Merchants', permission: 'manage_merchants', hash: 'merchants' },
  ],
  super_admin: [
    { href: '/dashboard/super-admin', label: 'Overview', permission: 'view_system_health' },
    { href: '/dashboard/super-admin', label: 'Feature Flags', permission: 'manage_system', hash: 'flags' },
    { href: '/dashboard/super-admin', label: 'Users & Roles', permission: 'assign_roles', hash: 'roles' },
    { href: '/dashboard/super-admin', label: 'Merchants', permission: 'manage_merchants', hash: 'merchants' },
  ],
};

export function getDashboardNavItems(role: UserRole): DashboardNavItem[] {
  return DASHBOARD_NAV[role].filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  );
}

export const ROLE_CAPABILITIES: Record<UserRole, string[]> = {
  customer: ['Browse catalog', 'Virtual try-on', 'Save try-on history', 'Manage profile'],
  merchant: ['Manage product catalog', 'View try-on analytics', 'Manage store profile'],
  support: ['Search users', 'View try-on history', 'Monitor system health'],
  admin: ['Manage users & merchants', 'Assign roles (except super admin)', 'Platform analytics'],
  super_admin: ['Full role assignment', 'System configuration', 'All admin capabilities'],
};
