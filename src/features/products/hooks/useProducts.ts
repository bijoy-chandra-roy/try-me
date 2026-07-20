'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchProducts } from '@/features/products/api/products.api';
import type { Product, ProductCategory } from '@/shared/types';

export function useProducts(
  initialCategory?: ProductCategory,
  initialProducts?: Product[]
) {
  const [products, setProducts] = useState<Product[]>(initialProducts ?? []);
  const [category, setCategory] = useState<ProductCategory | undefined>(initialCategory);
  const [loading, setLoading] = useState(initialProducts === undefined);
  const [error, setError] = useState<string | null>(null);
  const skipInitialFetch = useRef(initialProducts !== undefined);

  const loadProducts = useCallback(async (cat?: ProductCategory) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts(cat);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }
    void loadProducts(category);
  }, [category, loadProducts]);

  return { products, category, setCategory, loading, error, reload: loadProducts };
}
