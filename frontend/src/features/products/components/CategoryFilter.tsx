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
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map(({ value, label }) => {
        const isActive = selected === value;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              isActive
                ? 'bg-olive-600 text-sand-50 shadow-sm'
                : 'bg-sand-200/60 text-sand-700 hover:bg-sand-300/60 dark:bg-olive-700/40 dark:text-sand-200 dark:hover:bg-olive-600/40'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
