export const USER_ROLES = [
  'customer',
  'merchant',
  'support',
  'admin',
  'super_admin',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

/** English labels for server/logs. UI should use `t(\`roles.${role}\`)` via useT(). */
export const ROLE_LABELS: Record<UserRole, string> = {
  customer: 'Customer',
  merchant: 'Merchant',
  support: 'Support Staff',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

export const DASHBOARD_PATHS: Record<UserRole, string> = {
  customer: '/dashboard/customer',
  merchant: '/dashboard/merchant',
  support: '/dashboard/support',
  admin: '/dashboard/admin',
  super_admin: '/dashboard/super-admin',
};

export function getDashboardPath(role: UserRole): string {
  return DASHBOARD_PATHS[role];
}

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function canAssignRole(assignerRole: UserRole, targetRole: UserRole): boolean {
  if (assignerRole === 'super_admin') return true;
  if (assignerRole === 'admin') {
    return targetRole !== 'super_admin';
  }
  return false;
}
