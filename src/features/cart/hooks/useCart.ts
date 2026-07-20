'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useSession } from 'next-auth/react';
import type { Cart } from '@/shared/types';
import { cartItemCount, fetchCart } from '@/features/cart/api/cart.api';

type Listener = () => void;

let cartSnapshot: Cart | null = null;
let cartError: string | null = null;
let cartLoading = false;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return cartSnapshot;
}

function getServerSnapshot() {
  return null;
}

export async function refreshCartStore(): Promise<Cart | null> {
  cartLoading = true;
  emit();
  try {
    cartSnapshot = await fetchCart();
    cartError = null;
    return cartSnapshot;
  } catch (error) {
    cartError = error instanceof Error ? error.message : 'Failed to load cart';
    cartSnapshot = null;
    return null;
  } finally {
    cartLoading = false;
    emit();
  }
}

export function setCartStore(cart: Cart | null) {
  cartSnapshot = cart;
  cartError = null;
  emit();
}

export function useCart() {
  const { status } = useSession();
  const cart = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [loading, setLoading] = useState(cartLoading);

  const refresh = useCallback(async () => {
    if (status !== 'authenticated') {
      setCartStore(null);
      return null;
    }
    setLoading(true);
    const result = await refreshCartStore();
    setLoading(false);
    return result;
  }, [status]);

  useEffect(() => {
    if (status === 'authenticated') {
      void refresh();
    } else if (status === 'unauthenticated') {
      setCartStore(null);
    }
  }, [status, refresh]);

  useEffect(() => {
    return subscribe(() => setLoading(cartLoading));
  }, []);

  return {
    cart,
    items: cart?.items ?? [],
    itemCount: cartItemCount(cart?.items ?? []),
    loading: loading || status === 'loading',
    error: cartError,
    refresh,
    setCart: setCartStore,
  };
}
