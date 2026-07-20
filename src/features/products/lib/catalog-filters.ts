import type { Product, ProductCategory } from '@/shared/types';

export type CatalogLayout = 'grid' | 'compact' | 'list';
export type CatalogSort = 'featured' | 'price-asc' | 'price-desc' | 'name' | 'rating';

export interface CatalogFilterState {
  query: string;
  category?: ProductCategory;
  inStockOnly: boolean;
  minPrice: string;
  maxPrice: string;
  sort: CatalogSort;
  layout: CatalogLayout;
}

export const DEFAULT_CATALOG_FILTERS: CatalogFilterState = {
  query: '',
  category: undefined,
  inStockOnly: false,
  minPrice: '',
  maxPrice: '',
  sort: 'featured',
  layout: 'grid',
};

const LAYOUT_STORAGE_KEY = 'tryme-catalog-layout';

export function readStoredLayout(): CatalogLayout {
  if (typeof window === 'undefined') return 'grid';
  const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
  if (saved === 'grid' || saved === 'compact' || saved === 'list') return saved;
  return 'grid';
}

export function storeLayout(layout: CatalogLayout) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LAYOUT_STORAGE_KEY, layout);
}

function parsePrice(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilterState
): Product[] {
  const query = filters.query.trim().toLowerCase();
  const min = parsePrice(filters.minPrice);
  const max = parsePrice(filters.maxPrice);

  let result = products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;

    if (filters.inStockOnly && (!product.inStock || product.stockQuantity <= 0)) {
      return false;
    }

    if (min !== null && product.price < min) return false;
    if (max !== null && product.price > max) return false;

    if (query) {
      const haystack = `${product.name} ${product.description} ${product.category}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });

  switch (filters.sort) {
    case 'price-asc':
      result = [...result].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      result = [...result].sort((a, b) => b.price - a.price);
      break;
    case 'name':
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rating':
      result = [...result].sort(
        (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0)
      );
      break;
    default:
      break;
  }

  return result;
}

export function catalogGridClass(layout: CatalogLayout): string {
  switch (layout) {
    case 'compact':
      return 'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4';
    case 'list':
      return 'flex flex-col gap-3 sm:gap-4';
    case 'grid':
    default:
      return 'grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3';
  }
}
