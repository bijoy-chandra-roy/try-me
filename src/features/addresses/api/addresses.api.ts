import { apiClient } from '@/shared/lib/api-client';
import type { Address, ShippingAddress } from '@/shared/types';

export type AddressInput = Omit<ShippingAddress, 'country'> & {
  label?: string;
  country?: string;
  isDefault?: boolean;
};

export async function fetchAddresses(): Promise<Address[]> {
  return apiClient<Address[]>('/addresses');
}

export async function createAddress(input: AddressInput): Promise<Address> {
  return apiClient<Address>('/addresses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<Address> {
  return apiClient<Address>(`/addresses/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient<{ deleted: boolean }>(`/addresses/${id}`, { method: 'DELETE' });
}
