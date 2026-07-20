/** Editable color tokens for light/dark scheme science. */
export type ColorTokenKey =
  | 'backgroundBody'
  | 'backgroundSurface'
  | 'textPrimary'
  | 'textSecondary'
  | 'accentFill'
  | 'onAccent'
  | 'border'
  | 'borderEmphasized';

export type ColorTokens = Record<ColorTokenKey, string>;

export type ColorSchemeModeTokens = {
  light: ColorTokens;
  dark: ColorTokens;
};

export type ColorSchemeId = 'olive' | 'clay' | 'ocean' | 'charcoal' | 'custom';

export const COLOR_SCHEME_IDS: ColorSchemeId[] = [
  'olive',
  'clay',
  'ocean',
  'charcoal',
  'custom',
];

export const DEFAULT_COLOR_SCHEME_ID: ColorSchemeId = 'olive';

/** Maps ColorTokenKey → CSS custom property name. */
export const COLOR_TOKEN_CSS_VARS: Record<ColorTokenKey, string> = {
  backgroundBody: '--color-background-body',
  backgroundSurface: '--color-background-surface',
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  accentFill: '--color-accent-fill',
  onAccent: '--color-on-accent',
  border: '--color-border',
  borderEmphasized: '--color-border-emphasized',
};

export const COLOR_TOKEN_LABELS: Record<ColorTokenKey, string> = {
  backgroundBody: 'Page background',
  backgroundSurface: 'Surface',
  textPrimary: 'Primary text',
  textSecondary: 'Secondary text',
  accentFill: 'Accent',
  onAccent: 'On accent',
  border: 'Border',
  borderEmphasized: 'Emphasized border',
};

/** Olive — current brand default (matches globals.css :root / .dark). */
export const OLIVE_SCHEME: ColorSchemeModeTokens = {
  light: {
    backgroundBody: '#faf8f5',
    backgroundSurface: '#f3efe8',
    textPrimary: '#44473d',
    textSecondary: '#7d6a58',
    accentFill: '#565a4e',
    onAccent: '#faf8f5',
    border: 'rgba(212, 200, 184, 0.5)',
    borderEmphasized: '#d4c8b8',
  },
  dark: {
    backgroundBody: '#2a2c26',
    backgroundSurface: '#363932',
    textPrimary: '#f3efe8',
    textSecondary: '#d4c8b8',
    accentFill: '#6b705c',
    onAccent: '#faf8f5',
    border: 'rgba(133, 138, 117, 0.42)',
    borderEmphasized: '#6b705c',
  },
};

export const CLAY_SCHEME: ColorSchemeModeTokens = {
  light: {
    backgroundBody: '#faf6f2',
    backgroundSurface: '#f0e6dc',
    textPrimary: '#4a3428',
    textSecondary: '#8b6355',
    accentFill: '#a65d45',
    onAccent: '#faf6f2',
    border: 'rgba(196, 164, 132, 0.55)',
    borderEmphasized: '#c4a484',
  },
  dark: {
    backgroundBody: '#2c241f',
    backgroundSurface: '#3a3029',
    textPrimary: '#f5ebe3',
    textSecondary: '#d4b8a8',
    accentFill: '#c4785c',
    onAccent: '#2c241f',
    border: 'rgba(164, 120, 100, 0.45)',
    borderEmphasized: '#8b6355',
  },
};

export const OCEAN_SCHEME: ColorSchemeModeTokens = {
  light: {
    backgroundBody: '#f4f7f8',
    backgroundSurface: '#e8eef0',
    textPrimary: '#2c3a42',
    textSecondary: '#5a7380',
    accentFill: '#3d6b7a',
    onAccent: '#f4f7f8',
    border: 'rgba(160, 184, 196, 0.5)',
    borderEmphasized: '#a0b8c4',
  },
  dark: {
    backgroundBody: '#1e282c',
    backgroundSurface: '#2a363c',
    textPrimary: '#e8f0f2',
    textSecondary: '#a8c0c8',
    accentFill: '#5a9aaa',
    onAccent: '#1e282c',
    border: 'rgba(90, 120, 132, 0.45)',
    borderEmphasized: '#5a7380',
  },
};

export const CHARCOAL_SCHEME: ColorSchemeModeTokens = {
  light: {
    backgroundBody: '#f5f5f4',
    backgroundSurface: '#e7e5e4',
    textPrimary: '#1c1917',
    textSecondary: '#57534e',
    accentFill: '#44403c',
    onAccent: '#fafaf9',
    border: 'rgba(168, 162, 158, 0.5)',
    borderEmphasized: '#a8a29e',
  },
  dark: {
    backgroundBody: '#0c0a09',
    backgroundSurface: '#1c1917',
    textPrimary: '#fafaf9',
    textSecondary: '#a8a29e',
    accentFill: '#a8a29e',
    onAccent: '#0c0a09',
    border: 'rgba(87, 83, 78, 0.5)',
    borderEmphasized: '#57534e',
  },
};

export type ColorSchemePreset = {
  id: Exclude<ColorSchemeId, 'custom'>;
  label: string;
  description: string;
  tokens: ColorSchemeModeTokens;
};

export const COLOR_SCHEME_PRESETS: ColorSchemePreset[] = [
  {
    id: 'olive',
    label: 'Olive',
    description: 'Brand earth tones — sand, olive, clay',
    tokens: OLIVE_SCHEME,
  },
  {
    id: 'clay',
    label: 'Clay',
    description: 'Warm terracotta accent on sand surfaces',
    tokens: CLAY_SCHEME,
  },
  {
    id: 'ocean',
    label: 'Ocean',
    description: 'Cool teal accents on soft blue-grey',
    tokens: OCEAN_SCHEME,
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    description: 'Neutral stone greys, high contrast',
    tokens: CHARCOAL_SCHEME,
  },
];

export function getPresetTokens(id: ColorSchemeId): ColorSchemeModeTokens | null {
  if (id === 'custom') return null;
  return COLOR_SCHEME_PRESETS.find((p) => p.id === id)?.tokens ?? OLIVE_SCHEME;
}

export function isColorSchemeId(value: unknown): value is ColorSchemeId {
  return typeof value === 'string' && COLOR_SCHEME_IDS.includes(value as ColorSchemeId);
}
