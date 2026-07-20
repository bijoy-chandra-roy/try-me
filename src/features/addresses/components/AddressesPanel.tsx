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
import type { Address } from '@/shared/types';

const empty: AddressInput = {
  label: 'Home',
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

export function AddressesPanel() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState<AddressInput>(empty);
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
      setForm(empty);
      setMessage('Address saved');
      await load();
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Save failed');
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
      <h2 className="font-serif text-xl font-semibold">Shipping addresses</h2>
      {loading && <p className="text-sm">Loading…</p>}
      {addresses.map((a) => (
        <GlassCard key={a._id} className="flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="text-sm">
            <p className="font-medium">
              {a.label} {a.isDefault && <span className="chip-category ml-1">Default</span>}
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
                Set default
              </Button>
            )}
            <Button variant="destructive" size="sm" onClick={() => remove(a._id)}>
              Delete
            </Button>
          </div>
        </GlassCard>
      ))}

      <GlassCard className="p-5">
        <h3 className="font-medium">Add address</h3>
        <form onSubmit={onSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
          {(
            [
              ['label', 'Label'],
              ['fullName', 'Full name'],
              ['phone', 'Phone'],
              ['line1', 'Line 1'],
              ['line2', 'Line 2'],
              ['city', 'City'],
              ['state', 'State'],
              ['postalCode', 'Postal code'],
              ['country', 'Country'],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs">{label}</label>
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
            <Button type="submit">Save address</Button>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}
