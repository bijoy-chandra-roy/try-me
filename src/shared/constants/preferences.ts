import type { ColorSchemeId, ColorSchemeModeTokens } from './color-schemes';
import { DEFAULT_COLOR_SCHEME_ID, OLIVE_SCHEME } from './color-schemes';
import type { FontPairId } from './fonts';
import { DEFAULT_FONT_PAIR_ID } from './fonts';
import type { LocaleCode } from './locales';
import { DEFAULT_LOCALE } from './locales';
import { DEFAULT_REDUCE_MOTION } from './motion';

/**
 * When true, preference changes update the live DOM immediately.
 * When false, writes still persist to Mongo/localStorage but visual
 * application waits until the next full page load.
 */
export const APPLY_PREFERENCES_INSTANTLY = true;

/** localStorage key for the cached preferences blob. */
export const PREFERENCES_STORAGE_KEY = 'tryme-preferences';

/**
 * Session flag: set on login; cleared after prefs hydrate into LS on a later load.
 * Ensures post-login navigation keeps defaults until the user refreshes.
 */
export const PREFERENCES_PENDING_HYDRATE_KEY = 'tryme-prefs-pending-hydrate';

/** Onboarding tour progress (device-local, not Mongo). */
export const ONBOARDING_STORAGE_KEY = 'tryme-onboarding-step';

/** Dashboard sidenav collapse (device-local). */
export const DASHBOARD_NAV_COLLAPSE_KEY = 'dashboard-nav-collapsed';

/** 3D glass-card tilt / mouse elasticity — off by default. */
export const DEFAULT_CARD_TILT = false;

export type ThemeMode = 'light' | 'dark' | 'system';

export const THEME_OPTIONS: { value: ThemeMode; label: string; description: string }[] = [
  {
    value: 'light',
    label: 'Light',
    description: 'Bright background and dark text',
  },
  {
    value: 'dark',
    label: 'Dark',
    description: 'Dim background and light text',
  },
  {
    value: 'system',
    label: 'System',
    description: 'Match your device preference',
  },
];

export type UserPreferences = {
  theme: ThemeMode;
  colorSchemeId: ColorSchemeId;
  customScheme: ColorSchemeModeTokens | null;
  fontPairId: FontPairId;
  locale: LocaleCode;
  reduceMotion: boolean;
  /** 3D perspective tilt on glass cards (mouse elasticity). */
  cardTilt: boolean;
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  colorSchemeId: DEFAULT_COLOR_SCHEME_ID,
  customScheme: null,
  fontPairId: DEFAULT_FONT_PAIR_ID,
  locale: DEFAULT_LOCALE,
  reduceMotion: DEFAULT_REDUCE_MOTION,
  cardTilt: DEFAULT_CARD_TILT,
};

/** Empty custom scheme seed (clone of olive) for the custom editor. */
export function createEmptyCustomScheme(): ColorSchemeModeTokens {
  return structuredClone(OLIVE_SCHEME);
}

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}
