'use client';

import type { ProductCategory } from '@/shared/types';

const CATEGORIES: { value: ProductCategory | undefined; label: string }[] = [
  { value: undefined, label: 'All' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'accessories', label: 'Accessories' },
];

interface CategoryFilterProps {
  selected?: ProductCategory;
  onChange: (category: ProductCategory | undefined) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
      {CATEGORIES.map(({ value, label }) => {
        const isActive = selected === value;
        return (
          <button
            key={label}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(value)}
            className={`filter-chip ${isActive ? 'filter-chip-active' : 'filter-chip-inactive'}`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
