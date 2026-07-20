'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { GlassButton } from '@/shared/components/GlassButton';
import { GlassCard } from '@/shared/components/GlassCard';
import { fetchOrder, updateOrderStatus } from '@/features/orders/api/orders.api';
import { createReview } from '@/features/reviews/api/reviews.api';
import { useAuth, usePermission } from '@/shared/hooks/useAuth';
import { ApiError } from '@/shared/lib/api-client';
import type { Order } from '@/shared/types';

export default function OrderDetailPage() {
  const params = useParams();
  const id = String(params.id);
  const { user } = useAuth();
  const canFulfill = usePermission('fulfill_orders');
  const canViewAll = usePermission('view_all_orders');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  async function load() {
    setLoading(true);
    try {
      setOrder(await fetchOrder(id));
      setError('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = order?.userId === user?.id;
  const canCancel =
    isOwner && (order?.status === 'pending' || order?.status === 'confirmed');
  const canAdvance = canFulfill || canViewAll;

  async function cancel() {
    try {
      const updated = await updateOrderStatus(id, { status: 'cancelled' });
      setOrder(updated);
      setMessage('Order cancelled');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Cancel failed');
    }
  }

  async function advance() {
    try {
      const updated = await updateOrderStatus(id, { advance: true });
      setOrder(updated);
      setMessage('Status updated');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Update failed');
    }
  }

  async function markPaid() {
    try {
      const updated = await updateOrderStatus(id, { paymentStatus: 'paid' });
      setOrder(updated);
      setMessage('Marked as paid');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Update failed');
    }
  }

  async function submitReview(productId: string) {
    try {
      await createReview(productId, { rating, comment, orderId: id });
      setReviewing(null);
      setComment('');
      setMessage('Review submitted');
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Review failed');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-olive-600 border-t-transparent" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <p className="text-red-600">{error || 'Order not found'}</p>
        <Link href="/" className="mt-4 inline-block">
          <GlassButton>Home</GlassButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-olive-700 dark:text-sand-100">
            Order {order.orderNumber}
          </h1>
          <p className="mt-1 text-sm text-sand-600 dark:text-sand-300">
            Placed {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="chip-category capitalize">{order.status}</span>
      </div>

      {message && (
        <p className="mt-4 text-sm text-olive-600 dark:text-sand-300">{message}</p>
      )}

      <GlassCard className="mt-6 space-y-4 p-6">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.size}`}
            className="flex gap-4 border-b border-sand-200/50 pb-4 last:border-0 dark:border-sand-700/40"
          >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-sand-600 dark:text-sand-300">
                {item.size ? `Size ${item.size} · ` : ''}
                Qty {item.quantity} · ${item.price.toFixed(2)}
              </p>
              <p className="text-xs capitalize text-olive-600">Item: {item.merchantStatus}</p>
              {order.status === 'delivered' && isOwner && (
                <div className="mt-2">
                  {reviewing === item.productId ? (
                    <div className="space-y-2 rounded-xl bg-sand-100/50 p-3 dark:bg-sand-900/30">
                      <label className="block text-sm">
                        Rating
                        <select
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="input-glass ml-2 rounded-lg px-2 py-1"
                        >
                          {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Your review"
                        className="input-glass w-full rounded-xl px-3 py-2 text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <GlassButton
                          className="text-sm"
                          onClick={() => submitReview(item.productId)}
                        >
                          Submit
                        </GlassButton>
                        <GlassButton className="text-sm" onClick={() => setReviewing(null)}>
                          Cancel
                        </GlassButton>
                      </div>
                    </div>
                  ) : (
                    <GlassButton
                      className="text-sm"
                      onClick={() => setReviewing(item.productId)}
                    >
                      Write review
                    </GlassButton>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </GlassCard>

      <GlassCard className="mt-4 space-y-2 p-6 text-sm">
        <h2 className="font-serif text-lg font-semibold">Shipping</h2>
        <p>
          {order.shippingAddress.fullName} · {order.shippingAddress.phone}
        </p>
        <p>
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ''}
        </p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
          {order.shippingAddress.postalCode}, {order.shippingAddress.country}
        </p>
        <p className="pt-2">
          Payment: {order.paymentMethod.toUpperCase()} · {order.paymentStatus} · Total $
          {order.total.toFixed(2)}
        </p>
      </GlassCard>

      <div className="mt-6 flex flex-wrap gap-2">
        {canCancel && (
          <GlassButton onClick={cancel}>Cancel order</GlassButton>
        )}
        {canAdvance && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <GlassButton onClick={advance}>Advance status</GlassButton>
        )}
        {(canFulfill || canViewAll) && order.paymentStatus === 'pending' && (
          <GlassButton onClick={markPaid}>Mark COD paid</GlassButton>
        )}
        <Link href="/">
          <GlassButton>Continue shopping</GlassButton>
        </Link>
      </div>
    </div>
  );
}
