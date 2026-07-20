'use client';

import { useEffect, useRef, useState } from 'react';
import { submitTryOn } from '@/features/try-on/api/try-on.api';
import type { TryOnResult } from '@/shared/types';

/** Soft prompt: ask Wait / Cancel after this many ms while still loading. */
export const TRY_ON_SOFT_WAIT_MS = 90_000;

function isAbortError(err: unknown): boolean {
  return (
    (err instanceof DOMException && err.name === 'AbortError') ||
    (err instanceof Error && err.name === 'AbortError')
  );
}

export function useTryOn() {
  const [loading, setLoading] = useState(false);
  const [awaitingDecision, setAwaitingDecision] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const softTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (softTimerRef.current) clearTimeout(softTimerRef.current);
      abortRef.current?.abort();
    };
  }, []);

  function clearSoftTimer() {
    if (softTimerRef.current) {
      clearTimeout(softTimerRef.current);
      softTimerRef.current = null;
    }
  }

  async function tryOn(userImage: File, productId: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setAwaitingDecision(false);
    setError(null);
    setResult(null);

    clearSoftTimer();
    softTimerRef.current = setTimeout(() => {
      if (!controller.signal.aborted) {
        setAwaitingDecision(true);
      }
    }, TRY_ON_SOFT_WAIT_MS);

    try {
      const data = await submitTryOn(userImage, productId, controller.signal);
      setResult(data);
      return data;
    } catch (err) {
      if (isAbortError(err) || controller.signal.aborted) {
        setError('Try-on cancelled');
        return null;
      }
      const message = err instanceof Error ? err.message : 'Try-on failed';
      setError(message);
      throw err;
    } finally {
      clearSoftTimer();
      setAwaitingDecision(false);
      setLoading(false);
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }

  function continueWaiting() {
    setAwaitingDecision(false);
  }

  function cancelTryOn() {
    abortRef.current?.abort();
    clearSoftTimer();
    setAwaitingDecision(false);
  }

  function reset() {
    cancelTryOn();
    setResult(null);
    setError(null);
    setLoading(false);
  }

  return {
    tryOn,
    loading,
    awaitingDecision,
    error,
    result,
    reset,
    continueWaiting,
    cancelTryOn,
  };
}
