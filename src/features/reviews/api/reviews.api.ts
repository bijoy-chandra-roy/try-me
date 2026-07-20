import { apiClient } from '@/shared/lib/api-client';
import type { Review } from '@/shared/types';

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  return apiClient<Review[]>(`/products/${productId}/reviews`);
}

export async function createReview(
  productId: string,
  input: { rating: number; comment?: string; orderId?: string }
): Promise<Review> {
  return apiClient<Review>(`/products/${productId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export async function deleteReview(id: string): Promise<void> {
  await apiClient<{ deleted: boolean }>(`/reviews/${id}`, { method: 'DELETE' });
}
