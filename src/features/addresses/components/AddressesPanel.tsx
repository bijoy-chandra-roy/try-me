'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import {
  createAddress,
  deleteAddress,
  fetchAddresses,
  updateAddress,
  type AddressInput,
} from '@/features/addresses/api/addresses.api';
import { ApiError } from '@/shared/lib/api-client';
import { ListSkeleton } from '@/shared/components/Skeleton';
import { useT } from '@/shared/hooks/useT';
import type { Address } from '@/shared/types';
import type { MessageKey } from '@/shared/i18n';

const FIELD_KEYS: { key: keyof AddressInput; labelKey: MessageKey }[] = [
  { key: 'label', labelKey: 'addresses.fields.label' },
  { key: 'fullName', labelKey: 'addresses.fields.fullName' },
  { key: 'phone', labelKey: 'addresses.fields.phone' },
  { key: 'line1', labelKey: 'addresses.fields.line1' },
  { key: 'line2', labelKey: 'addresses.fields.line2' },
  { key: 'city', labelKey: 'addresses.fields.city' },
  { key: 'state', labelKey: 'addresses.fields.state' },
  { key: 'postalCode', labelKey: 'addresses.fields.postalCode' },
  { key: 'country', labelKey: 'addresses.fields.country' },
];

function emptyForm(defaultLabel: string): AddressInput {
  return {
    label: defaultLabel,
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    isDefault: false,
  };
}

export function AddressesPanel() {
  const t = useT();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressInput>(() => emptyForm(t('addresses.defaultLabel')));
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    setLoading(true);
    try {
      setAddresses(await fetchAddresses());
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      await createAddress(form);
      setForm(emptyForm(t('addresses.defaultLabel')));
      setMessage(t('addresses.saved'));
      await load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : t('addresses.saveFailed'));
    }
  }

  async function makeDefault(id: string) {
    await updateAddress(id, { isDefault: true });
    await load();
  }

  async function remove(id: string) {
    await deleteAddress(id);
    await load();
  }

  return (
    <div id="addresses" className="scroll-mt-24 space-y-4">
      <h2 className="font-serif text-xl font-semibold">{t('addresses.title')}</h2>
      {loading ? (
        <ListSkeleton rows={2} />
      ) : (
        addresses.map((a) => (
        <GlassCard key={a._id} className="flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="text-sm">
            <p className="font-medium">
              {a.label}{' '}
              {a.isDefault && (
                <span className="chip-category ml-1">{t('addresses.default')}</span>
              )}
            </p>
            <p>
              {a.fullName} · {a.phone}
            </p>
            <p>
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ''}
            </p>
            <p>
              {a.city}, {a.state} {a.postalCode}, {a.country}
            </p>
          </div>
          <div className="flex gap-2">
            {!a.isDefault && (
              <Button variant="secondary" size="sm" onClick={() => makeDefault(a._id)}>
                {t('addresses.setDefault')}
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => remove(a._id)}>
              {t('addresses.delete')}
            </Button>
          </div>
        </GlassCard>
        ))
      )}

      <GlassCard className="p-5">
        <h3 className="font-medium">{t('addresses.addTitle')}</h3>
        <form onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
          {FIELD_KEYS.map(({ key, labelKey }) => (
            <div key={key}>
              <label className="mb-1 block text-xs">{t(labelKey)}</label>
              <input
                required={key !== 'line2' && key !== 'label'}
                value={String(form[key] ?? '')}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-glass w-full rounded-xl px-3 py-2 text-sm"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            {message && <p className="mb-2 text-sm text-success">{message}</p>}
            <Button type="submit">{t('addresses.save')}</Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
