import { apiClient } from '@/shared/lib/api-client';
import type { Product, ProductCategory } from '@/shared/types';

export async function fetchProducts(category?: ProductCategory): Promise<Product[]> {
  const params = category ? `?category=${category}` : '';
  return apiClient<Product[]>(`/products${params}`);
}

export async function fetchProductById(id: string): Promise<Product> {
  return apiClient<Product>(`/products/${id}`);
}
