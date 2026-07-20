'use client';

import type { ProductCategory } from '@/shared/types';
import { Tooltip } from '@/shared/components/Tooltip';
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
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="Filter by category"
    >
      {CATEGORIES.map(({ value, label, iconKey }) => {
        const isActive = selected === value;
        const Icon = CATEGORY_ICONS[iconKey];
        return (
          <Tooltip key={label} content={label}>
            <button
              type="button"
              aria-label={label}
              aria-pressed={isActive}
              onClick={() => onChange(value)}
              className={`filter-chip inline-flex h-10 w-10 items-center justify-center !px-0 ${
                isActive ? 'filter-chip-active' : 'filter-chip-inactive'
              }`}
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              <span className="sr-only">{label}</span>
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
}
