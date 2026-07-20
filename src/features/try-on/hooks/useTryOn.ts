'use client';

import { useState } from 'react';
import { submitTryOn } from '@/features/try-on/api/try-on.api';
import type { TryOnResult } from '@/shared/types';

export function useTryOn() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TryOnResult | null>(null);

  async function tryOn(userImage: File, productId: string) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await submitTryOn(userImage, productId);
      setResult(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Try-on failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResult(null);
    setError(null);
  }

  return { tryOn, loading, error, result, reset };
}
