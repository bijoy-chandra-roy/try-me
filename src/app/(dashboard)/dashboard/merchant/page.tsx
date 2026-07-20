'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { RoleGate } from '@/shared/components/RoleGate';
import { Select } from '@/shared/components/Select';
import { Checkbox } from '@/shared/components/Checkbox';
import { useAuth } from '@/shared/hooks/useAuth';
import { apiClient } from '@/shared/lib/api-client';
import type { Merchant, Product, ProductCategory } from '@/shared/types';

interface MerchantStats {
  productCount: number;
  tryOnCount: number;
  inStockCount: number;
  products: Product[];
  perProduct: Record<string, number>;
}

const CATEGORIES: ProductCategory[] = ['tops', 'bottoms', 'dresses', 'outerwear', 'accessories'];

const emptyProduct = {
  name: '',
  description: '',
  price: 0,
  category: 'tops' as ProductCategory,
  imageUrl: '',
  sizes: ['S', 'M', 'L'],
  inStock: true,
};

export default function MerchantDashboardPage() {
  const { user, update } = useAuth();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [store, setStore] = useState<Merchant | null>(null);
  const [storeForm, setStoreForm] = useState({ name: '', description: '' });
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const needsOnboarding = !user?.merchantId && !store;

  async function loadStore() {
    try {
      const data = await apiClient<Merchant | null>('/merchants/me');
      setStore(data);
      if (data) {
        setStoreForm({ name: data.name, description: data.description });
      }
    } catch {
      setStore(null);
    }
  }

  async function loadStats() {
    setLoading(true);
    try {
      const data = await apiClient<MerchantStats>('/dashboard/merchant-stats');
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStore().then(() => loadStats());
  }, [user?.merchantId]);

  async function createStore(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const merchant = await apiClient<Merchant>('/merchants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeForm),
      });
      setStore(merchant);
      setMessage('Store created. Awaiting admin approval if required.');
      await update();
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create store');
    } finally {
      setSaving(false);
    }
  }

  async function updateStore(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await apiClient(`/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await apiClient('/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }
      setForm(emptyProduct);
      setEditingId(null);
      await loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this product?')) return;
    await apiClient(`/products/${id}`, { method: 'DELETE' });
    await loadStats();
  }

  function startEdit(product: Product) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      sizes: product.sizes,
      inStock: product.inStock,
    });
  }

  if (needsOnboarding) {
    return (
      <DashboardShell
        title="Merchant Dashboard"
        description="Set up your store before managing products"
      >
        <RoleGate permission="manage_merchants">
          <div id="store" className="scroll-mt-24">
          <GlassCard className="mx-auto max-w-lg p-8">
            <h2 className="font-serif text-xl font-semibold">Create your store</h2>
            <p className="mt-2 text-sm text-sand-600 dark:text-sand-300">
              You need a merchant profile before you can add products and view analytics.
            </p>
            <form onSubmit={createStore} className="mt-6 space-y-4">
              <input
                placeholder="Store name"
                value={storeForm.name}
                onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                required
                className="input-glass w-full rounded-lg px-3 py-2"
              />
              <textarea
                placeholder="Store description"
                value={storeForm.description}
                onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                rows={3}
                className="input-glass w-full rounded-lg px-3 py-2"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <GlassButton type="submit" disabled={saving}>
                {saving ? 'Creating...' : 'Create store'}
              </GlassButton>
            </form>
          </GlassCard>
          </div>
        </RoleGate>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title="Merchant Dashboard"
      description="Manage your product catalog and view try-on analytics"
    >
      {message && <p className="mb-4 text-sm text-success">{message}</p>}

      <RoleGate permission="manage_products">
        <div id="analytics" className="scroll-mt-24">
          {stats && (
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <StatCard label="Products" value={stats.productCount} />
              <StatCard label="Try-ons" value={stats.tryOnCount} />
              <StatCard label="In stock" value={stats.inStockCount} />
            </div>
          )}
        </div>
      </RoleGate>

      <RoleGate permission="manage_merchants">
        <div id="store" className="mb-8 scroll-mt-24">
        <GlassCard className="p-6">
          <h2 className="font-serif text-xl font-semibold">Store profile</h2>
          {store && (
            <p className="mt-1 text-sm text-muted-subtle">
              Status: <span className="chip-category">{store.status}</span>
            </p>
          )}
          <form onSubmit={updateStore} className="mt-4 space-y-3">
            <input
              placeholder="Store name"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
              required
              className="input-glass w-full rounded-lg px-3 py-2"
            />
            <textarea
              placeholder="Store description"
              value={storeForm.description}
              onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
              rows={2}
              className="input-glass w-full rounded-lg px-3 py-2"
            />
            <GlassButton type="submit" disabled={saving}>Save store profile</GlassButton>
          </form>
        </GlassCard>
        </div>
      </RoleGate>

      <RoleGate permission="manage_products">
        <div className="grid gap-6 lg:grid-cols-5">
          <GlassCard className="p-6 lg:col-span-2">
            <h2 className="font-serif text-xl font-semibold">
              {editingId ? 'Edit product' : 'Add product'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {(['name', 'description', 'imageUrl'] as const).map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-xs capitalize">{field}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    required={field !== 'description'}
                    className="input-glass w-full rounded-lg px-3 py-2"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs">Price</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="input-glass w-full rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs">Category</label>
                  <Select
                    value={form.category}
                    onChange={(category) => setForm({ ...form, category })}
                    options={CATEGORIES.map((c) => ({
                      value: c,
                      label: c.charAt(0).toUpperCase() + c.slice(1),
                    }))}
                    aria-label="Category"
                    className="w-full rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <Checkbox
                checked={form.inStock}
                onChange={(inStock) => setForm({ ...form, inStock })}
                label="In stock"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2">
                <GlassButton type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </GlassButton>
                {editingId && (
                  <GlassButton
                    type="button"
                    onClick={() => { setEditingId(null); setForm(emptyProduct); }}
                  >
                    Cancel
                  </GlassButton>
                )}
              </div>
            </form>
          </GlassCard>

          <div className="lg:col-span-3">
            <h2 className="mb-4 font-serif text-xl font-semibold">Your products</h2>
            {loading && <p className="text-sm text-muted-subtle">Loading...</p>}
            <div className="space-y-3">
              {stats?.products.map((product) => (
                <GlassCard key={product._id} className="flex items-center gap-4 p-4">
                  <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-subtle">
                      ${product.price.toFixed(2)} · {product.inStock ? 'In stock' : 'Out of stock'} ·{' '}
                      {stats.perProduct[product._id] ?? 0} try-ons
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <GlassButton onClick={() => startEdit(product)}>Edit</GlassButton>
                    <GlassButton onClick={() => handleDelete(product._id)}>Delete</GlassButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </RoleGate>
    </DashboardShell>
  );
}
