'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import {
  cartSubtotal,
  clearCart,
  removeCartItem,
  updateCartItem,
} from '@/features/cart/api/cart.api';
import { useCart, setCartStore } from '@/features/cart/hooks/useCart';
import { ApiError } from '@/shared/lib/api-client';

export default function CartPage() {
  const { items, loading, refresh } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const subtotal = cartSubtotal(items);

  async function changeQty(
    productId: string,
    quantity: number,
    size?: string,
    customSelections?: Record<string, string>
  ) {
    setBusy(true);
    setError('');
    try {
      const cart = await updateCartItem(productId, quantity, size, customSelections);
      setCartStore(cart);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  }

  async function remove(
    productId: string,
    size?: string,
    customSelections?: Record<string, string>
  ) {
    setBusy(true);
    setError('');
    try {
      const cart = await removeCartItem(productId, size, customSelections);
      setCartStore(cart);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Remove failed');
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    setBusy(true);
    try {
      const cart = await clearCart();
      setCartStore(cart);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-form px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold text-primary">Shopping cart</h1>
      <p className="mt-1 text-sm text-muted">
        Review items before checkout. Payment is cash on delivery.
      </p>

      {loading && (
        <div className="flex justify-center py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-accent-fill)] border-t-transparent" />
        </div>
      )}

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      {!loading && items.length === 0 && (
        <GlassCard className="mt-8 p-8 text-center" elastic={false}>
          <p className="text-muted">Your cart is empty.</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>Browse catalog</Button>
          </Link>
        </GlassCard>
      )}

      {!loading && items.length > 0 && (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <GlassCard
              key={`${item.productId}-${item.size ?? ''}-${JSON.stringify(item.customSelections ?? {})}`}
              className="flex gap-4 p-4"
              elastic={false}
            >
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-inner">
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-serif text-lg font-semibold">{item.name}</h2>
                {item.size && <p className="text-sm text-muted">Size: {item.size}</p>}
                <p className="mt-1 font-medium tabular-nums">${item.price.toFixed(2)}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy || item.quantity <= 1}
                    onClick={() =>
                      changeQty(item.productId, item.quantity - 1, item.size, item.customSelections)
                    }
                  >
                    −
                  </Button>
                  <span className="tabular-nums">{item.quantity}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={() =>
                      changeQty(item.productId, item.quantity + 1, item.size, item.customSelections)
                    }
                  >
                    +
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={() => remove(item.productId, item.size, item.customSelections)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
              <p className="shrink-0 font-semibold tabular-nums">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </GlassCard>
          ))}

          <GlassCard className="flex flex-wrap items-center justify-between gap-4 p-6" elastic={false}>
            <div>
              <p className="text-sm text-muted">Subtotal</p>
              <p className="text-2xl font-semibold tabular-nums">${subtotal.toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={busy} onClick={handleClear}>
                Clear cart
              </Button>
              <Link href="/checkout">
                <Button disabled={busy}>Checkout</Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
