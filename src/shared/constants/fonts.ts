export type FontPairId = 'brand' | 'modern' | 'classic' | 'bengali';

export const FONT_PAIR_IDS: FontPairId[] = ['brand', 'modern', 'classic', 'bengali'];

export const DEFAULT_FONT_PAIR_ID: FontPairId = 'brand';

export type FontPair = {
  id: FontPairId;
  label: string;
  description: string;
  /** CSS font-family for body/UI */
  sans: string;
  /** CSS font-family for display/headings */
  serif: string;
  /** Suitable for Bengali script */
  supportsBengali?: boolean;
};

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'brand',
    label: 'Brand',
    description: 'Urbanist + Cormorant Garamond (default)',
    sans: 'var(--font-urbanist), ui-sans-serif, system-ui, sans-serif',
    serif: 'var(--font-cormorant), ui-serif, Georgia, serif',
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Clean geometric UI with soft display',
    sans: 'var(--font-urbanist), ui-sans-serif, system-ui, sans-serif',
    serif: 'var(--font-urbanist), ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'classic',
    label: 'Classic',
    description: 'Display-forward serif emphasis',
    sans: 'var(--font-cormorant), ui-serif, Georgia, serif',
    serif: 'var(--font-cormorant), ui-serif, Georgia, serif',
  },
  {
    id: 'bengali',
    label: 'Bengali-safe',
    description: 'Noto Sans Bengali for বাংলা + Latin UI',
    sans: 'var(--font-noto-bengali), var(--font-urbanist), ui-sans-serif, sans-serif',
    serif: 'var(--font-noto-bengali), var(--font-cormorant), ui-serif, serif',
    supportsBengali: true,
  },
];

export function getFontPair(id: FontPairId): FontPair {
  return FONT_PAIRS.find((p) => p.id === id) ?? FONT_PAIRS[0];
}

export function isFontPairId(value: unknown): value is FontPairId {
  return typeof value === 'string' && FONT_PAIR_IDS.includes(value as FontPairId);
}
