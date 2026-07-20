'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/shared/components/Link';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import { cartSubtotal } from '@/features/cart/api/cart.api';
import { useCart, setCartStore } from '@/features/cart/hooks/useCart';
import {
  createAddress,
  fetchAddresses,
  type AddressInput,
} from '@/features/addresses/api/addresses.api';
import { checkout } from '@/features/orders/api/orders.api';
import { ApiError } from '@/shared/lib/api-client';
import { CartLineSkeleton, Skeleton } from '@/shared/components/Skeleton';
import { useT } from '@/shared/hooks/useT';
import type { Address } from '@/shared/types';
import type { MessageKey } from '@/shared/i18n';

const emptyFormBase: Omit<AddressInput, 'label'> = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
  isDefault: true,
};

const FIELD_KEYS: { key: keyof AddressInput; labelKey: MessageKey }[] = [
  { key: 'label', labelKey: 'checkout.fields.label' },
  { key: 'fullName', labelKey: 'checkout.fields.fullName' },
  { key: 'phone', labelKey: 'checkout.fields.phone' },
  { key: 'line1', labelKey: 'checkout.fields.line1' },
  { key: 'line2', labelKey: 'checkout.fields.line2' },
  { key: 'city', labelKey: 'checkout.fields.city' },
  { key: 'state', labelKey: 'checkout.fields.state' },
  { key: 'postalCode', labelKey: 'checkout.fields.postalCode' },
  { key: 'country', labelKey: 'checkout.fields.country' },
];

export default function CheckoutPage() {
  const t = useT();
  const router = useRouter();
  const { items, loading: cartLoading, refresh } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [form, setForm] = useState<AddressInput>({
    ...emptyFormBase,
    label: t('addresses.defaultLabel'),
  });
  const [useNew, setUseNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void refresh();
    fetchAddresses()
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) {
          setSelectedId(def._id);
          setUseNew(false);
        } else {
          setUseNew(true);
        }
      })
      .catch(() => setUseNew(true))
      .finally(() => setLoading(false));
  }, [refresh]);

  const subtotal = cartSubtotal(items);
  const pageLoading = loading || cartLoading;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;
    setSubmitting(true);
    setError('');
    try {
      let addressId = selectedId;
      if (useNew || !addressId) {
        const created = await createAddress({ ...form, isDefault: addresses.length === 0 });
        addressId = created._id;
        setAddresses((prev) => [...prev, created]);
      }
      const order = await checkout({ addressId });
      setCartStore({ _id: '', userId: '', items: [] });
      router.push(`/orders/${order._id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('checkout.failed'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!pageLoading && items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-serif text-3xl font-semibold">{t('checkout.emptyTitle')}</h1>
        <Link href="/cart" className="mt-6 inline-block">
          <Button>{t('checkout.backToCart')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-serif text-3xl font-semibold text-primary">
        {t('checkout.title')}
      </h1>
      <p className="mt-1 text-sm text-muted">
        {t('checkout.subtitle')}
        {pageLoading ? (
          <span className="ml-1 inline-block align-middle">
            <Skeleton className="inline-block h-4 w-16" />
          </span>
        ) : (
          <> {t('checkout.total', { amount: subtotal.toFixed(2) })}</>
        )}
      </p>

      {pageLoading ? (
        <div className="mt-8 space-y-6">
          <div className="glass-card space-y-3 p-6">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="glass-card space-y-3 p-6">
            <Skeleton className="h-6 w-28" />
            <CartLineSkeleton rows={2} />
          </div>
        </div>
      ) : (
        <form onSubmit={placeOrder} className="mt-8 space-y-6">
          <GlassCard className="space-y-4 p-6">
            <h2 className="font-serif text-xl font-semibold">{t('checkout.shippingTitle')}</h2>

            {addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <label
                    key={a._id}
                    className={`flex cursor-pointer gap-3 rounded-element border px-3 py-3 ${
                      !useNew && selectedId === a._id
                        ? 'border-[var(--color-accent-fill)] bg-[var(--color-overlay-pressed)]'
                        : 'border-transparent bg-[var(--color-overlay-hover)]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={!useNew && selectedId === a._id}
                      onChange={() => {
                        setUseNew(false);
                        setSelectedId(a._id);
                      }}
                    />
                    <span className="text-sm">
                      <strong>{a.label}</strong> — {a.fullName}, {a.line1}, {a.city}, {a.state}{' '}
                      {a.postalCode}
                    </span>
                  </label>
                ))}
                <label className="flex cursor-pointer gap-3 rounded-xl px-3 py-2 text-sm">
                  <input
                    type="radio"
                    name="address"
                    checked={useNew}
                    onChange={() => setUseNew(true)}
                  />
                  {t('checkout.useNewAddress')}
                </label>
              </div>
            )}

            {(useNew || addresses.length === 0) && (
              <div className="grid gap-3 sm:grid-cols-2">
                {FIELD_KEYS.map(({ key, labelKey }) => (
                  <div key={key} className={key === 'line1' || key === 'line2' ? 'sm:col-span-2' : ''}>
                    <label className="mb-1 block text-sm">{t(labelKey)}</label>
                    <input
                      required={key !== 'line2' && key !== 'label'}
                      value={String(form[key] ?? '')}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-glass w-full rounded-xl px-3 py-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="font-serif text-xl font-semibold">{t('checkout.paymentTitle')}</h2>
            <p className="mt-2 text-sm text-muted">
              {t('checkout.paymentBody')}
            </p>
            <ul className="mt-4 space-y-1 text-sm">
              {items.map((item) => (
                <li key={`${item.productId}-${item.size}`} className="flex justify-between">
                  <span>
                    {item.name}
                    {item.size ? ` (${item.size})` : ''} × {item.quantity}
                  </span>
                  <span className="tabular-nums">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 flex justify-between text-lg font-semibold">
              <span>{t('checkout.totalLabel')}</span>
              <span className="tabular-nums">${subtotal.toFixed(2)}</span>
            </p>
          </GlassCard>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex gap-3">
            <Link href="/cart">
              <Button type="button" variant="ghost">
                {t('common.back')}
              </Button>
            </Link>
            <Button type="submit" disabled={submitting}>
              {submitting ? t('checkout.placing') : t('checkout.placeOrder')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
