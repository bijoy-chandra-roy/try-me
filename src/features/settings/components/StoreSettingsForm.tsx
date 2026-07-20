'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { apiClient } from '@/shared/lib/api-client';
import type { Merchant } from '@/shared/types';

export function StoreSettingsForm() {
  const { user, update } = useAuth();
  const [store, setStore] = useState<Merchant | null>(null);
  const [storeForm, setStoreForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const needsCreate = !user?.merchantId && !store;

  async function loadStore() {
    setLoading(true);
    try {
      const data = await apiClient<Merchant | null>('/merchants/me');
      setStore(data);
      if (data) {
        setStoreForm({ name: data.name, description: data.description });
      }
    } catch {
      setStore(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStore();
  }, [user?.merchantId]);

  async function createStore(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const merchant = await apiClient<Merchant>('/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm),
      });
      setStore(merchant);
      setMessage('Store created. Awaiting admin approval if required.');
      await update();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setSaving(false);
    }
  }

  async function updateStore(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const updated = await apiClient<Merchant>('/merchants/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm),
      });
      setStore(updated);
      setMessage('Store profile updated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-subtle">Loading store...</p>;
  }

  if (needsCreate) {
    return (
      <GlassCard className="max-w-form p-6">
        <h2 className="font-serif text-xl font-semibold">Create your store</h2>
        <p className="mt-2 text-sm text-muted">
          You need a store profile before you can add products and view analytics.
        </p>
        <form onSubmit={createStore} className="mt-6 space-y-4">
          <div>
            <label htmlFor="store-name" className="mb-1 block text-sm">
              Store name
            </label>
            <input
              id="store-name"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
              required
              className="input-glass w-full rounded-xl px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="store-description" className="mb-1 block text-sm">
              Description
            </label>
            <textarea
              id="store-description"
              value={storeForm.description}
              onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
              rows={3}
              className="input-glass w-full rounded-xl px-3 py-2"
            />
          </div>
          {error && <p className="text-sm text-error">{error}</p>}
          {message && <p className="text-sm text-success">{message}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create store'}
          </Button>
        </form>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="max-w-form p-6">
      <h2 className="font-serif text-xl font-semibold">Store details</h2>
      <p className="mt-1 text-sm text-muted">
        Public information shoppers see for your store.
      </p>
      {store && (
        <p className="mt-3 text-sm text-muted-subtle">
          Status: <span className="chip-category">{store.status}</span>
        </p>
      )}
      <form onSubmit={updateStore} className="mt-6 space-y-4">
        <div>
          <label htmlFor="store-name-edit" className="mb-1 block text-sm">
            Store name
          </label>
          <input
            id="store-name-edit"
            value={storeForm.name}
            onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
            required
            className="input-glass w-full rounded-xl px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="store-description-edit" className="mb-1 block text-sm">
            Description
          </label>
          <textarea
            id="store-description-edit"
            value={storeForm.description}
            onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
            rows={3}
            className="input-glass w-full rounded-xl px-3 py-2"
          />
        </div>
        {error && <p className="text-sm text-error">{error}</p>}
        {message && <p className="text-sm text-success">{message}</p>}
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save store'}
        </Button>
      </form>
    </GlassCard>
  );
}
