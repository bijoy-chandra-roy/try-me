'use client';

import type { ProductCategory } from '@/shared/types';
import { CATEGORY_ICONS } from '@/features/products/components/CategoryIcons';

const CATEGORIES: {
  value: ProductCategory | undefined;
  label: string;
  iconKey: keyof typeof CATEGORY_ICONS;
}[] = [
  { value: undefined, label: 'All', iconKey: 'all' },
  { value: 'tops', label: 'Tops', iconKey: 'tops' },
  { value: 'bottoms', label: 'Bottoms', iconKey: 'bottoms' },
  { value: 'dresses', label: 'Dresses', iconKey: 'dresses' },
  { value: 'outerwear', label: 'Outerwear', iconKey: 'outerwear' },
  { value: 'accessories', label: 'Accessories', iconKey: 'accessories' },
];

interface CategoryFilterProps {
  selected?: ProductCategory;
  onChange: (category: ProductCategory | undefined) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label="Filter by category"
    >
      {CATEGORIES.map(({ value, label, iconKey }) => {
        const isActive = selected === value;
        const Icon = CATEGORY_ICONS[iconKey];
        return (
          <button
            key={label}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className={`filter-chip inline-flex shrink-0 items-center gap-1.5 !px-3 !py-2 ${
              isActive ? 'filter-chip-active' : 'filter-chip-inactive'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
