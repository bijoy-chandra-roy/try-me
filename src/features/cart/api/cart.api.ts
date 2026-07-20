import { apiClient } from '@/shared/lib/api-client';
import type { Cart, CartItem } from '@/shared/types';

export async function fetchCart(): Promise<Cart> {
  return apiClient<Cart>('/cart');
}

export async function addToCart(input: {
  productId: string;
  quantity?: number;
  size?: string;
  customSelections?: Record<string, string>;
}): Promise<Cart> {
  return apiClient<Cart>('/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function updateCartItem(
  productId: string,
  quantity: number,
  size?: string,
  customSelections?: Record<string, string>
): Promise<Cart> {
  return apiClient<Cart>('/cart', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId, quantity, size, customSelections }),
  });
}

export async function removeCartItem(
  productId: string,
  size?: string,
  customSelections?: Record<string, string>
): Promise<Cart> {
  const params = new URLSearchParams({ productId });
  if (size) params.set('size', size);
  if (customSelections && Object.keys(customSelections).length > 0) {
    params.set('customSelections', JSON.stringify(customSelections));
  }
  return apiClient<Cart>(`/cart?${params.toString()}`, { method: 'DELETE' });
}

export async function clearCart(): Promise<Cart> {
  return apiClient<Cart>('/cart?clear=true', { method: 'DELETE' });
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
