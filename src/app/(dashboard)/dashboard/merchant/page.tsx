'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { GlassButton } from '@/shared/components/GlassButton';
import { apiClient } from '@/shared/lib/api-client';
import type { Product, ProductCategory } from '@/shared/types';

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
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    loadStats();
  }, []);

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

  return (
    <DashboardShell
      title="Merchant Dashboard"
      description="Manage your product catalog and view try-on analytics"
    >
      {stats && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Products" value={stats.productCount} />
          <StatCard label="Try-ons" value={stats.tryOnCount} />
          <StatCard label="In stock" value={stats.inStockCount} />
        </div>
      )}

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
                  className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
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
                  className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                  className="w-full rounded-lg border border-sand-300/60 bg-white/50 px-3 py-2 text-sm dark:border-olive-500/40 dark:bg-olive-800/30"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.inStock}
                onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
              />
              In stock
            </label>
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
          {loading && <p className="text-sm text-sand-500">Loading...</p>}
          <div className="space-y-3">
            {stats?.products.map((product) => (
              <GlassCard key={product._id} className="flex items-center gap-4 p-4">
                <img src={product.imageUrl} alt={product.name} className="h-16 w-16 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-sand-500">
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
    </DashboardShell>
  );
}
