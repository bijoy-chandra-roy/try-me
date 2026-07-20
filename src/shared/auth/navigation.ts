import type { Permission } from './permissions';
import { hasPermission } from './permissions';
import type { UserRole } from './roles';
import type { NavIconKey } from '@/shared/ui/nav-icons';

export interface DashboardNavItem {
  href: string;
  label: string;
  icon: NavIconKey;
  permission?: Permission;
  hash?: string;
  /** When true, active if pathname equals or starts with href */
  matchPrefix?: boolean;
}

export interface SettingsNavItem {
  href: string;
  label: string;
  icon: NavIconKey;
  /** Extra role gate beyond manage_own_profile */
  roles?: UserRole[];
  permission?: Permission;
}

export const DASHBOARD_NAV: Record<UserRole, DashboardNavItem[]> = {
  customer: [
    { href: '/dashboard/customer', label: 'Overview', icon: 'overview' },
    {
      href: '/dashboard/customer',
      label: 'Orders',
      icon: 'orders',
      permission: 'view_own_orders',
      hash: 'orders',
    },
    {
      href: '/dashboard/customer',
      label: 'Addresses',
      icon: 'addresses',
      permission: 'manage_cart',
      hash: 'addresses',
    },
    {
      href: '/dashboard/customer',
      label: 'Try-on History',
      icon: 'history',
      permission: 'view_own_try_on_history',
      hash: 'history',
    },
  ],
  merchant: [
    { href: '/dashboard/merchant', label: 'Products', icon: 'products', permission: 'manage_products' },
    {
      href: '/dashboard/merchant',
      label: 'Orders',
      icon: 'orders',
      permission: 'fulfill_orders',
      hash: 'orders',
    },
    {
      href: '/dashboard/merchant',
      label: 'Analytics',
      icon: 'analytics',
      permission: 'manage_products',
      hash: 'analytics',
    },
    {
      href: '/dashboard/merchant',
      label: 'Store',
      icon: 'store',
      permission: 'manage_merchants',
      hash: 'store',
    },
  ],
  support: [
    {
      href: '/dashboard/support',
      label: 'Orders',
      icon: 'orders',
      permission: 'view_all_orders',
      hash: 'orders',
    },
    { href: '/dashboard/support', label: 'User Lookup', icon: 'userLookup', permission: 'view_users' },
    {
      href: '/dashboard/support',
      label: 'System Health',
      icon: 'health',
      permission: 'view_system_health',
      hash: 'health',
    },
  ],
  admin: [
    {
      href: '/dashboard/admin',
      label: 'Overview',
      icon: 'overview',
      permission: 'view_system_health',
    },
    {
      href: '/dashboard/admin',
      label: 'Orders',
      icon: 'orders',
      permission: 'view_all_orders',
      hash: 'orders',
    },
    { href: '/dashboard/admin', label: 'Users', icon: 'users', permission: 'manage_users', hash: 'users' },
    {
      href: '/dashboard/admin',
      label: 'Merchants',
      icon: 'merchants',
      permission: 'manage_merchants',
      hash: 'merchants',
    },
  ],
  super_admin: [
    {
      href: '/dashboard/super-admin',
      label: 'Overview',
      icon: 'overview',
      permission: 'view_system_health',
    },
    {
      href: '/dashboard/super-admin',
      label: 'Orders',
      icon: 'orders',
      permission: 'view_all_orders',
      hash: 'orders',
    },
    {
      href: '/dashboard/super-admin',
      label: 'Feature Flags',
      icon: 'flags',
      permission: 'manage_system',
      hash: 'flags',
    },
    {
      href: '/dashboard/super-admin',
      label: 'Users & Roles',
      icon: 'roles',
      permission: 'assign_roles',
      hash: 'roles',
    },
    {
      href: '/dashboard/super-admin',
      label: 'Merchants',
      icon: 'merchants',
      permission: 'manage_merchants',
      hash: 'merchants',
    },
  ],
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  { href: '/settings/profile', label: 'Profile', icon: 'profile', permission: 'manage_own_profile' },
  { href: '/settings/account', label: 'Account', icon: 'account', permission: 'manage_own_profile' },
  {
    href: '/settings/appearance',
    label: 'Appearance',
    icon: 'appearance',
    permission: 'manage_own_profile',
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
