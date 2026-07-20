'use client';

import type { ProductCategory } from '@/shared/types';
import { CATEGORY_ICONS } from '@/features/products/components/CategoryIcons';
import { useT } from '@/shared/hooks/useT';
import type { MessageKey } from '@/shared/i18n';

const CATEGORIES: {
  value: ProductCategory | undefined;
  labelKey: MessageKey;
  iconKey: keyof typeof CATEGORY_ICONS;
}[] = [
  { value: undefined, labelKey: 'catalog.category.all', iconKey: 'all' },
  { value: 'tops', labelKey: 'catalog.category.tops', iconKey: 'tops' },
  { value: 'bottoms', labelKey: 'catalog.category.bottoms', iconKey: 'bottoms' },
  { value: 'dresses', labelKey: 'catalog.category.dresses', iconKey: 'dresses' },
  { value: 'outerwear', labelKey: 'catalog.category.outerwear', iconKey: 'outerwear' },
  { value: 'accessories', labelKey: 'catalog.category.accessories', iconKey: 'accessories' },
];

interface CategoryFilterProps {
  selected?: ProductCategory;
  onChange: (category: ProductCategory | undefined) => void;
}

export function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  const t = useT();

  return (
    <div
      className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="group"
      aria-label={t('catalog.categoryAria')}
    >
      {CATEGORIES.map(({ value, labelKey, iconKey }) => {
        const isActive = selected === value;
        const Icon = CATEGORY_ICONS[iconKey];
        const label = t(labelKey);
        return (
          <button
            key={labelKey}
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
