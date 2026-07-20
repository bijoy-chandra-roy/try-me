'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/features/dashboard/components/DashboardShell';
import { StoreSettingsForm } from '@/features/dashboard/components/StoreSettingsForm';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { DataList, ListRow } from '@/shared/components/DataList';
import { Popover } from '@/shared/components/Popover';
import { RoleGate } from '@/shared/components/RoleGate';
import { Select } from '@/shared/components/Select';
import { Checkbox } from '@/shared/components/Checkbox';
import { ImageUrlField } from '@/shared/components/ImageUrlField';
import { TagListField } from '@/shared/components/TagListField';
import { CustomFieldsEditor } from '@/shared/components/CustomFieldsEditor';
import { OrdersPanel } from '@/features/orders/components/OrdersPanel';
import { useAuth } from '@/shared/hooks/useAuth';
import { useT } from '@/shared/hooks/useT';
import { apiClient } from '@/shared/lib/api-client';
import {
  DashboardContentSkeleton,
  ListSkeleton,
  StatCardsSkeleton,
} from '@/shared/components/Skeleton';
import type { Product, ProductCategory, ProductCustomField } from '@/shared/types';

interface MerchantStats {
  productCount: number;
  tryOnCount: number;
  inStockCount: number;
  lowStockCount: number;
  orderCount: number;
  unitsSold: number;
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
  sizes: [] as string[],
  customFields: [] as ProductCustomField[],
  stockQuantity: 10,
  inStock: true,
};

export default function MerchantDashboardPage() {
  const t = useT();
  const { user, isResolved } = useAuth();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const needsOnboarding = isResolved && !user?.merchantId;

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
    if (!isResolved) return;
    if (!user?.merchantId) {
      setLoading(false);
      return;
    }
    void loadStats();
  }, [user?.merchantId, isResolved]);

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
      sizes: product.sizes ?? [],
      customFields: product.customFields ?? [],
      stockQuantity: product.stockQuantity ?? (product.inStock ? 10 : 0),
      inStock: product.inStock,
    });
  }

  if (!isResolved) {
    return (
      <DashboardShell
        title={t('dashboard.merchant.title')}
        description={t('dashboard.merchant.description')}
      >
        <DashboardContentSkeleton />
      </DashboardShell>
    );
  }

  if (needsOnboarding) {
    return (
      <DashboardShell
        title={t('dashboard.merchant.title')}
        description={t('dashboard.merchant.onboardingDesc')}
      >
        <div id="store" className="scroll-mt-24">
          <StoreSettingsForm />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      title={t('dashboard.merchant.title')}
      description={t('dashboard.merchant.description')}
    >
      <RoleGate
        permission="manage_products"
        loadingFallback={
          <StatCardsSkeleton
            count={6}
            className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
          />
        }
      >
        <div id="analytics" className="scroll-mt-24">
          {stats ? (
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <StatCard label="Products" value={stats.productCount} />
              <StatCard label="Try-ons" value={stats.tryOnCount} />
              <StatCard label="In stock" value={stats.inStockCount} />
              <StatCard label="Low stock" value={stats.lowStockCount ?? 0} />
              <StatCard label="Orders" value={stats.orderCount ?? 0} />
              <StatCard label="Units sold" value={stats.unitsSold ?? 0} />
            </div>
          ) : (
            <StatCardsSkeleton
              count={6}
              className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
            />
          )}
        </div>
      </RoleGate>

      <RoleGate permission="fulfill_orders">
        <div className="mb-10">
          <OrdersPanel mode="merchant" allowAdvance allowMarkPaid />
        </div>
      </RoleGate>

      <RoleGate permission="manage_products">
        <div className="grid gap-6 lg:grid-cols-5">
          <GlassCard className="p-6 lg:col-span-2">
            <h2 className="font-serif text-xl font-semibold">
              {editingId ? 'Edit product' : 'Add product'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              {(['name', 'description'] as const).map((field) => (
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
              <ImageUrlField
                label="image"
                value={form.imageUrl}
                onChange={(imageUrl) => setForm({ ...form, imageUrl })}
                required
                disabled={saving}
              />
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
              <TagListField
                label="Sizes"
                hint="Optional. Leave empty if this product has no sizes."
                values={form.sizes}
                onChange={(sizes) => setForm({ ...form, sizes })}
                placeholder="e.g. S, M, L or 32"
                disabled={saving}
              />
              <CustomFieldsEditor
                fields={form.customFields}
                onChange={(customFields) => setForm({ ...form, customFields })}
                disabled={saving}
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs">Stock quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={form.stockQuantity}
                    onChange={(e) => {
                      const stockQuantity = Math.max(0, Number(e.target.value));
                      setForm({
                        ...form,
                        stockQuantity,
                        inStock: stockQuantity > 0,
                      });
                    }}
                    className="input-glass w-full rounded-lg px-3 py-2"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <Checkbox
                    checked={form.stockQuantity > 0}
                    onChange={(inStock) =>
                      setForm({
                        ...form,
                        stockQuantity: inStock ? Math.max(form.stockQuantity, 1) : 0,
                        inStock,
                      })
                    }
                    label="In stock"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-error">{error}</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => { setEditingId(null); setForm(emptyProduct); }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </GlassCard>

          <div className="lg:col-span-3">
            <h2 className="mb-4 font-serif text-xl font-semibold">Your products</h2>
            {loading ? (
              <ListSkeleton rows={4} />
            ) : (
            <DataList>
              {stats?.products.map((product) => (
                <ListRow key={product._id} dimmed={!product.inStock}>
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-12 w-12 rounded-inner object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{product.name}</p>
                      <p className="truncate text-sm text-muted-subtle">
                        ${product.price.toFixed(2)} · qty {product.stockQuantity ?? 0} ·{' '}
                        {product.inStock ? 'In stock' : 'Out of stock'} ·{' '}
                        {stats.perProduct[product._id] ?? 0} try-ons
                      </p>
                    </div>
                  </div>
                  <Popover
                    label={`Actions for ${product.name}`}
                    items={[
                      { label: 'Edit', onClick: () => startEdit(product) },
                      {
                        label: 'Delete',
                        onClick: () => handleDelete(product._id),
                        destructive: true,
                      },
                    ]}
                  />
                </ListRow>
              ))}
            </DataList>
            )}
          </div>
        </div>
      </RoleGate>

      <RoleGate permission="manage_merchants">
        <section id="store" className="mt-10 scroll-mt-24">
          <StoreSettingsForm />
        </section>
      </RoleGate>
    </DashboardShell>
  );
}
