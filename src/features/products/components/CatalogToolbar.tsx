'use client';

import { useState } from 'react';
import { LayoutGrid, LayoutList, Rows3, Search, SlidersHorizontal, X } from 'lucide-react';
import { CategoryFilter } from '@/features/products/components/CategoryFilter';
import { Checkbox } from '@/shared/components/Checkbox';
import { IconButton } from '@/shared/components/IconButton';
import { Select } from '@/shared/components/Select';
import { useT } from '@/shared/hooks/useT';
import type {
  CatalogFilterState,
  CatalogLayout,
  CatalogSort,
} from '@/features/products/lib/catalog-filters';
import type { ProductCategory } from '@/shared/types';

const LAYOUT_ICONS: Record<CatalogLayout, typeof LayoutGrid> = {
  grid: LayoutGrid,
  compact: Rows3,
  list: LayoutList,
};

interface CatalogToolbarProps {
  filters: CatalogFilterState;
  resultCount: number;
  onChange: (next: CatalogFilterState) => void;
  onReset: () => void;
}

export function CatalogToolbar({
  filters,
  resultCount,
  onChange,
  onReset,
}: CatalogToolbarProps) {
  const t = useT();
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const sortOptions: { value: CatalogSort; label: string }[] = [
    { value: 'featured', label: t('catalog.sort.featured') },
    { value: 'price-asc', label: t('catalog.sort.priceAsc') },
    { value: 'price-desc', label: t('catalog.sort.priceDesc') },
    { value: 'name', label: t('catalog.sort.name') },
    { value: 'rating', label: t('catalog.sort.rating') },
  ];

  const layoutOptions: { value: CatalogLayout; label: string }[] = [
    { value: 'grid', label: t('catalog.layout.grid') },
    { value: 'compact', label: t('catalog.layout.compact') },
    { value: 'list', label: t('catalog.layout.list') },
  ];

  const hasActiveFilters =
    Boolean(filters.query.trim()) ||
    Boolean(filters.category) ||
    filters.inStockOnly ||
    Boolean(filters.minPrice.trim()) ||
    Boolean(filters.maxPrice.trim()) ||
    filters.sort !== 'featured';

  function patch(partial: Partial<CatalogFilterState>) {
    onChange({ ...filters, ...partial });
  }

  function setCategory(category: ProductCategory | undefined) {
    patch({ category });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t('catalog.searchAria')}</span>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-subtle"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder={t('catalog.searchPlaceholder')}
            className="input-glass input-glass-lg w-full pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
            autoComplete="off"
          />
          {filters.query ? (
            <button
              type="button"
              onClick={() => patch({ query: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted-subtle hover:bg-[var(--color-overlay-hover)] hover:text-primary"
              aria-label={t('catalog.clearSearch')}
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <div className="min-w-0 flex-1 basis-[10rem] sm:max-w-[14rem] sm:flex-none">
            <Select
              value={filters.sort}
              onChange={(sort) => patch({ sort })}
              options={sortOptions}
              aria-label={t('catalog.sortAria')}
              className="w-full"
            />
          </div>

          <IconButton
            label={advancedOpen ? t('catalog.hideFilters') : t('catalog.showFilters')}
            onClick={() => setAdvancedOpen((o) => !o)}
            className={advancedOpen ? 'bg-[var(--color-overlay-pressed)]' : ''}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </IconButton>

          <div
            className="ml-auto inline-flex rounded-full border border-subtle p-0.5 sm:ml-0"
            role="group"
            aria-label={t('catalog.layoutAria')}
          >
            {layoutOptions.map(({ value, label }) => {
              const active = filters.layout === value;
              const Icon = LAYOUT_ICONS[value];
              return (
                <IconButton
                  key={value}
                  label={label}
                  showTooltip
                  size="sm"
                  onClick={() => patch({ layout: value })}
                  className={`!rounded-full ${
                    active
                      ? 'bg-[var(--color-accent-fill)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-fill)]'
                      : ''
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} aria-hidden />
                </IconButton>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter selected={filters.category} onChange={setCategory} />
        <p className="shrink-0 text-xs text-muted-subtle sm:text-sm">
          {t('catalog.resultCount', { n: resultCount })}
          {hasActiveFilters ? t('catalog.resultMatched') : ''}
        </p>
      </div>

      {advancedOpen ? (
        <div className="flex flex-col gap-3 rounded-container border border-subtle bg-[var(--color-overlay-hover)]/40 p-3 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 sm:p-4">
          <Checkbox
            checked={filters.inStockOnly}
            onChange={(inStockOnly) => patch({ inStockOnly })}
            label={t('catalog.inStockOnly')}
            className="sm:mb-1"
          />

          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted sm:w-28">
            {t('catalog.minPrice')}
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={filters.minPrice}
              onChange={(e) => patch({ minPrice: e.target.value })}
              placeholder="0"
              className="input-glass w-full"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1 text-xs font-medium text-muted sm:w-28">
            {t('catalog.maxPrice')}
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={filters.maxPrice}
              onChange={(e) => patch({ maxPrice: e.target.value })}
              placeholder={t('catalog.maxPriceAny')}
              className="input-glass w-full"
            />
          </label>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="btn-ghost btn-sm self-start sm:mb-0.5 sm:ml-auto"
            >
              {t('catalog.clearFilters')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
