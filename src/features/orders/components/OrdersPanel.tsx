'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from '@/shared/components/Link';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import { fetchOrders, updateOrderStatus } from '@/features/orders/api/orders.api';
import { ApiError } from '@/shared/lib/api-client';
import { ListSkeleton } from '@/shared/components/Skeleton';
import { useT } from '@/shared/hooks/useT';
import type { Order } from '@/shared/types';

interface OrdersPanelProps {
  mode: 'own' | 'merchant' | 'all';
  showSearch?: boolean;
  allowAdvance?: boolean;
  allowCancel?: boolean;
  allowMarkPaid?: boolean;
}

export function OrdersPanel({
  mode,
  showSearch = false,
  allowAdvance = false,
  allowCancel = false,
  allowMarkPaid = false,
}: OrdersPanelProps) {
  const t = useT();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params =
        showSearch && (orderNumber || email)
          ? { orderNumber: orderNumber || undefined, email: email || undefined }
          : undefined;
      setOrders(await fetchOrders(params));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('orders.loadFailed'));
      setOrders([]);
    } finally {
      setLoading(false);
    }
    // t is unstable (new fn each render); locale changes don't need a reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSearch, orderNumber, email]);

  useEffect(() => {
    void load();
  }, [load]);

  async function advance(id: string) {
    setBusyId(id);
    try {
      const updated = await updateOrderStatus(id, { advance: true });
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('orders.updateFailed'));
    } finally {
      setBusyId(null);
    }
  }

  async function cancel(id: string) {
    setBusyId(id);
    try {
      const updated = await updateOrderStatus(id, { status: 'cancelled' });
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('orders.cancelFailed'));
    } finally {
      setBusyId(null);
    }
  }

  async function markPaid(id: string) {
    setBusyId(id);
    try {
      const updated = await updateOrderStatus(id, { paymentStatus: 'paid' });
      setOrders((prev) => prev.map((o) => (o._id === id ? updated : o)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('orders.updateFailed'));
    } finally {
      setBusyId(null);
    }
  }

  const titleKey =
    mode === 'merchant'
      ? 'orders.title.merchant'
      : mode === 'all'
        ? 'orders.title.all'
        : 'orders.title.own';

  return (
    <div id="orders" className="scroll-mt-24 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold">{t(titleKey)}</h2>
        <Button variant="secondary" size="sm" onClick={() => void load()}>
          {t('common.refresh')}
        </Button>
      </div>

      {showSearch && (
        <div className="flex flex-wrap gap-2">
          <input
            placeholder={t('orders.searchOrderNumber')}
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="input-glass rounded-xl px-3 py-2 text-sm"
          />
          <input
            placeholder={t('orders.searchEmail')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-glass rounded-xl px-3 py-2 text-sm"
          />
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            {t('common.search')}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-error">{error}</p>}

      {loading ? (
        <ListSkeleton rows={3} />
      ) : orders.length === 0 ? (
        <GlassCard className="p-6 text-sm text-muted">
          {t('orders.empty')}
        </GlassCard>
      ) : (
        orders.map((order) => (
          <GlassCard key={order._id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/orders/${order._id}`}
                  className="font-serif text-lg font-semibold hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <p className="text-sm text-muted">
                  {t('orders.meta', {
                    date: new Date(order.createdAt).toLocaleString(),
                    n: order.items.length,
                    total: order.total.toFixed(2),
                  })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="chip-category capitalize">{order.status}</span>
                <span className="chip-size capitalize">{order.paymentStatus}</span>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {order.items.map((item) => (
                <li key={`${order._id}-${item.productId}-${item.size}`}>
                  {item.name}
                  {item.size ? ` (${item.size})` : ''} × {item.quantity}
                  {mode === 'merchant' || mode === 'all' ? (
                    <span className="ml-2 capitalize text-accent">· {item.merchantStatus}</span>
                  ) : null}
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/orders/${order._id}`}>
                <Button variant="secondary" size="sm">
                  {t('orders.view')}
                </Button>
              </Link>
              {allowAdvance &&
                order.status !== 'delivered' &&
                order.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    disabled={busyId === order._id}
                    onClick={() => advance(order._id)}
                  >
                    {t('orders.advance')}
                  </Button>
                )}
              {allowCancel &&
                (order.status === 'pending' || order.status === 'confirmed') && (
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busyId === order._id}
                    onClick={() => cancel(order._id)}
                  >
                    {t('orders.cancel')}
                  </Button>
                )}
              {allowMarkPaid && order.paymentStatus === 'pending' && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={busyId === order._id}
                  onClick={() => markPaid(order._id)}
                >
                  {t('orders.markPaid')}
                </Button>
              )}
            </div>
          </GlassCard>
        ))
      )}
    </div>
  );
}
