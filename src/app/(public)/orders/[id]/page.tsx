'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from '@/shared/components/Link';
import { useParams } from 'next/navigation';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import { fetchOrder, updateOrderStatus } from '@/features/orders/api/orders.api';
import { createReview } from '@/features/reviews/api/reviews.api';
import { useAuth, usePermission } from '@/shared/hooks/useAuth';
import { ApiError } from '@/shared/lib/api-client';
import { OrderDetailSkeleton } from '@/shared/components/Skeleton';
import { useT } from '@/shared/hooks/useT';
import type { Order } from '@/shared/types';

export default function OrderDetailPage() {
  const t = useT();
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
      setError(err instanceof ApiError ? err.message : t('orders.detail.loadFailed'));
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
      setMessage(t('orders.detail.cancelled'));
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t('orders.detail.cancelFailed'));
    }
  }

  async function advance() {
    try {
      const updated = await updateOrderStatus(id, { advance: true });
      setOrder(updated);
      setMessage(t('orders.detail.statusUpdated'));
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t('orders.detail.updateFailed'));
    }
  }

  async function markPaid() {
    try {
      const updated = await updateOrderStatus(id, { paymentStatus: 'paid' });
      setOrder(updated);
      setMessage(t('orders.detail.markedPaid'));
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t('orders.detail.updateFailed'));
    }
  }

  async function submitReview(productId: string) {
    try {
      await createReview(productId, { rating, comment, orderId: id });
      setReviewing(null);
      setComment('');
      setMessage(t('orders.detail.reviewSubmitted'));
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t('orders.detail.reviewFailed'));
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {loading ? (
        <OrderDetailSkeleton />
      ) : error || !order ? (
        <div className="py-6 text-center">
          <p className="text-error">{error || t('orders.detail.notFound')}</p>
          <Link href="/" className="mt-4 inline-block">
            <Button>{t('common.home')}</Button>
          </Link>
        </div>
      ) : (
        <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-primary">
            {t('orders.detail.title', { orderNumber: order.orderNumber })}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {t('orders.detail.placed', {
              date: new Date(order.createdAt).toLocaleString(),
            })}
          </p>
        </div>
        <span className="chip-category capitalize">{order.status}</span>
      </div>

      {message && (
        <p className="mt-4 text-sm text-muted">{message}</p>
      )}

      <GlassCard className="mt-6 space-y-4 p-6">
        {order.items.map((item) => (
          <div
            key={`${item.productId}-${item.size}`}
            className="flex gap-4 border-b border-subtle pb-4 last:border-0"
          >
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg">
              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted">
                {t('orders.detail.itemMeta', {
                  size: item.size || '—',
                  n: item.quantity,
                  price: item.price.toFixed(2),
                })}
              </p>
              <p className="text-xs capitalize text-accent">
                {t('orders.detail.itemStatus', { status: item.merchantStatus })}
              </p>
              {order.status === 'delivered' && isOwner && (
                <div className="mt-2">
                  {reviewing === item.productId ? (
                    <div className="space-y-2 rounded-element bg-[var(--color-overlay-hover)] p-3">
                      <label className="block text-sm">
                        {t('orders.detail.rating')}
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
                        placeholder={t('orders.detail.reviewPlaceholder')}
                        className="input-glass w-full rounded-xl px-3 py-2 text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          className="text-sm"
                          onClick={() => submitReview(item.productId)}
                        >
                          {t('orders.detail.submitReview')}
                        </Button>
                        <Button className="text-sm" onClick={() => setReviewing(null)}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="text-sm"
                      onClick={() => setReviewing(item.productId)}
                    >
                      {t('orders.detail.writeReview')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </GlassCard>

      <GlassCard className="mt-4 space-y-2 p-6 text-sm">
        <h2 className="font-serif text-lg font-semibold">{t('orders.detail.shipping')}</h2>
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
          {t('orders.detail.paymentLine', {
            method: order.paymentMethod.toUpperCase(),
            status: order.paymentStatus,
            total: order.total.toFixed(2),
          })}
        </p>
      </GlassCard>

      <div className="mt-6 flex flex-wrap gap-2">
        {canCancel && (
          <Button onClick={cancel}>{t('orders.detail.cancelOrder')}</Button>
        )}
        {canAdvance && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <Button onClick={advance}>{t('orders.detail.advanceStatus')}</Button>
        )}
        {(canFulfill || canViewAll) && order.paymentStatus === 'pending' && (
          <Button onClick={markPaid}>{t('orders.detail.markCodPaid')}</Button>
        )}
        <Link href="/">
          <Button>{t('orders.detail.continueShopping')}</Button>
        </Link>
      </div>
        </>
      )}
    </div>
  );
}
