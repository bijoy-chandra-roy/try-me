import { apiClient } from '@/shared/lib/api-client';
import type { Order, OrderStatus, PaymentStatus, ShippingAddress } from '@/shared/types';

export async function checkout(input: {
  addressId?: string;
  shippingAddress?: ShippingAddress;
}): Promise<Order> {
  return apiClient<Order>('/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function fetchOrders(params?: {
  orderNumber?: string;
  email?: string;
  userId?: string;
}): Promise<Order[]> {
  const search = new URLSearchParams();
  if (params?.orderNumber) search.set('orderNumber', params.orderNumber);
  if (params?.email) search.set('email', params.email);
  if (params?.userId) search.set('userId', params.userId);
  const qs = search.toString();
  return apiClient<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
}

export async function fetchOrder(id: string): Promise<Order> {
  return apiClient<Order>(`/orders/${id}`);
}

export async function updateOrderStatus(
  id: string,
  input: {
    status?: OrderStatus;
    paymentStatus?: PaymentStatus;
    advance?: boolean;
  }
): Promise<Order> {
  return apiClient<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}
