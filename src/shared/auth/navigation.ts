import type { Permission } from './permissions';
import { hasPermission } from './permissions';
import type { UserRole } from './roles';

export interface DashboardNavItem {
  href: string;
  label: string;
  permission?: Permission;
  hash?: string;
  /** When true, active if pathname equals or starts with href */
  matchPrefix?: boolean;
}

export interface SettingsNavItem {
  href: string;
  label: string;
  /** Extra role gate beyond manage_own_profile */
  roles?: UserRole[];
  permission?: Permission;
}

export const DASHBOARD_NAV: Record<UserRole, DashboardNavItem[]> = {
  customer: [
    { href: '/dashboard/customer', label: 'Overview' },
    { href: '/dashboard/customer', label: 'Orders', permission: 'view_own_orders', hash: 'orders' },
    { href: '/dashboard/customer', label: 'Addresses', permission: 'manage_cart', hash: 'addresses' },
    { href: '/dashboard/customer', label: 'Try-on History', permission: 'view_own_try_on_history', hash: 'history' },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      permission: 'manage_own_profile',
      matchPrefix: true,
    },
  ],
  merchant: [
    { href: '/dashboard/merchant', label: 'Products', permission: 'manage_products' },
    { href: '/dashboard/merchant', label: 'Orders', permission: 'fulfill_orders', hash: 'orders' },
    { href: '/dashboard/merchant', label: 'Analytics', permission: 'manage_products', hash: 'analytics' },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      permission: 'manage_own_profile',
      matchPrefix: true,
    },
  ],
  support: [
    { href: '/dashboard/support', label: 'Orders', permission: 'view_all_orders', hash: 'orders' },
    { href: '/dashboard/support', label: 'User Lookup', permission: 'view_users' },
    { href: '/dashboard/support', label: 'System Health', permission: 'view_system_health', hash: 'health' },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      permission: 'manage_own_profile',
      matchPrefix: true,
    },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview', permission: 'view_system_health' },
    { href: '/dashboard/admin', label: 'Orders', permission: 'view_all_orders', hash: 'orders' },
    { href: '/dashboard/admin', label: 'Users', permission: 'manage_users', hash: 'users' },
    { href: '/dashboard/admin', label: 'Merchants', permission: 'manage_merchants', hash: 'merchants' },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      permission: 'manage_own_profile',
      matchPrefix: true,
    },
  ],
  super_admin: [
    { href: '/dashboard/super-admin', label: 'Overview', permission: 'view_system_health' },
    { href: '/dashboard/super-admin', label: 'Orders', permission: 'view_all_orders', hash: 'orders' },
    { href: '/dashboard/super-admin', label: 'Feature Flags', permission: 'manage_system', hash: 'flags' },
    { href: '/dashboard/super-admin', label: 'Users & Roles', permission: 'assign_roles', hash: 'roles' },
    { href: '/dashboard/super-admin', label: 'Merchants', permission: 'manage_merchants', hash: 'merchants' },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      permission: 'manage_own_profile',
      matchPrefix: true,
    },
  ],
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  { href: '/dashboard/settings/profile', label: 'Profile', permission: 'manage_own_profile' },
  { href: '/dashboard/settings/account', label: 'Account', permission: 'manage_own_profile' },
  {
    href: '/dashboard/settings/store',
    label: 'Store',
    roles: ['merchant'],
    permission: 'manage_merchants',
  },
];

export function getDashboardNavItems(role: UserRole): DashboardNavItem[] {
  return DASHBOARD_NAV[role].filter(
    (item) => !item.permission || hasPermission(role, item.permission)
  );
}

export function getSettingsNavItems(role: UserRole): SettingsNavItem[] {
  return SETTINGS_NAV.filter((item) => {
    if (item.roles && !item.roles.includes(role)) return false;
    if (item.permission && !hasPermission(role, item.permission)) return false;
    return true;
  });
}

export const ROLE_CAPABILITIES: Record<UserRole, string[]> = {
  customer: [
    'Browse catalog',
    'Add to cart & checkout (COD)',
    'Virtual try-on',
    'Manage orders & addresses',
    'Write product reviews',
  ],
  merchant: [
    'Manage product catalog & stock',
    'Fulfill store orders',
    'View try-on & sales analytics',
    'Manage store profile',
  ],
  support: [
    'Search users',
    'Look up and update orders',
    'View try-on history',
    'Monitor system health',
  ],
  admin: [
    'Manage users & merchants',
    'Oversee all orders',
    'Assign roles (except super admin)',
    'Platform analytics',
  ],
  super_admin: [
    'Full role assignment',
    'System configuration',
    'All admin & order capabilities',
  ],
};
