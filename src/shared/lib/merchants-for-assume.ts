import type { Merchant } from '@/shared/types';

/** Merchants selectable when a super admin assumes the merchant role. */
export function merchantsForAssumeRole(merchants: Merchant[]): Merchant[] {
  return merchants.filter((m) => m.status !== 'suspended');
}
