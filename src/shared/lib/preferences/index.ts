import {
  APPLY_PREFERENCES_INSTANTLY,
  COLOR_SCHEME_PRESETS,
  COLOR_TOKEN_CSS_VARS,
  DEFAULT_PREFERENCES,
  getFontPair,
  getPresetTokens,
  isColorSchemeId,
  isFontPairId,
  isLocaleCode,
  isThemeMode,
  ONBOARDING_STORAGE_KEY,
  PREFERENCES_PENDING_HYDRATE_KEY,
  PREFERENCES_STORAGE_KEY,
  type ColorSchemeModeTokens,
  type ColorTokens,
  type ThemeMode,
  type UserPreferences,
} from '@/shared/constants';
import { isSafeCssColor } from '@/shared/lib/validate-css-color';

export function resolveTheme(theme: ThemeMode): 'light' | 'dark' {
  if (theme === 'system') {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function isColorTokens(value: unknown): value is ColorTokens {
  if (!value || typeof value !== 'object') return false;
  const t = value as Record<string, unknown>;
  return Object.keys(COLOR_TOKEN_CSS_VARS).every(
    (k) => typeof t[k] === 'string' && isSafeCssColor(String(t[k]))
  );
}

function isCustomScheme(value: unknown): value is ColorSchemeModeTokens {
  if (!value || typeof value !== 'object') return false;
  const s = value as Record<string, unknown>;
  return isColorTokens(s.light) && isColorTokens(s.dark);
}

/** Normalize partial/unknown prefs into a complete UserPreferences object. */
export function normalizePreferences(input: unknown): UserPreferences {
  const raw = (input && typeof input === 'object' ? input : {}) as Partial<UserPreferences>;
  return {
    theme: isThemeMode(raw.theme) ? raw.theme : DEFAULT_PREFERENCES.theme,
    colorSchemeId: isColorSchemeId(raw.colorSchemeId)
      ? raw.colorSchemeId
      : DEFAULT_PREFERENCES.colorSchemeId,
    customScheme: isCustomScheme(raw.customScheme) ? raw.customScheme : null,
    fontPairId: isFontPairId(raw.fontPairId) ? raw.fontPairId : DEFAULT_PREFERENCES.fontPairId,
    locale: isLocaleCode(raw.locale) ? raw.locale : DEFAULT_PREFERENCES.locale,
    reduceMotion:
      typeof raw.reduceMotion === 'boolean' ? raw.reduceMotion : DEFAULT_PREFERENCES.reduceMotion,
    cardTilt: typeof raw.cardTilt === 'boolean' ? raw.cardTilt : DEFAULT_PREFERENCES.cardTilt,
  };
}

export function resolveSchemeTokens(prefs: UserPreferences): ColorSchemeModeTokens {
  if (prefs.colorSchemeId === 'custom' && prefs.customScheme) {
    return prefs.customScheme;
  }
  return getPresetTokens(prefs.colorSchemeId) ?? getPresetTokens('olive')!;
}

function applyTokensToElement(el: HTMLElement, tokens: ColorTokens) {
  for (const [key, cssVar] of Object.entries(COLOR_TOKEN_CSS_VARS)) {
    el.style.setProperty(cssVar, tokens[key as keyof ColorTokens]);
  }
}

export type ApplyPreferencesOptions = {
  /** Target element (default: document.documentElement). Use for preview panes. */
  target?: HTMLElement;
  /** Force apply even when APPLY_PREFERENCES_INSTANTLY is false. */
  force?: boolean;
  /** When set, only apply this mode's tokens (for preview light/dark toggle). */
  forceResolvedMode?: 'light' | 'dark';
};

/**
 * Apply preference tokens/classes to the DOM.
 * Respects APPLY_PREFERENCES_INSTANTLY unless force is true.
 */
export function applyPreferences(
  prefs: UserPreferences,
  options: ApplyPreferencesOptions = {}
) {
  if (!APPLY_PREFERENCES_INSTANTLY && !options.force) return;

  const root = options.target ?? document.documentElement;
  const isPreview = Boolean(options.target);
  const resolved = options.forceResolvedMode ?? resolveTheme(prefs.theme);
  const scheme = resolveSchemeTokens(prefs);
  const tokens = resolved === 'dark' ? scheme.dark : scheme.light;
  // When locale is Bengali, render with a Bengali-capable face if current pair cannot.
  const effectiveFontId =
    prefs.locale === 'bn' && !getFontPair(prefs.fontPairId).supportsBengali
      ? 'bengali'
      : prefs.fontPairId;
  const font = getFontPair(effectiveFontId);

  root.classList.toggle('dark', resolved === 'dark');
  root.dataset.colorScheme = prefs.colorSchemeId;
  root.dataset.fontPair = effectiveFontId;
  root.dataset.reduceMotion = prefs.reduceMotion ? 'true' : 'false';
  root.dataset.cardTilt = prefs.cardTilt ? 'true' : 'false';
  if (!isPreview) {
    root.lang = prefs.locale;
  }

  applyTokensToElement(root, tokens);
  root.style.setProperty('--font-sans-active', font.sans);
  root.style.setProperty('--font-serif-active', font.serif);
}

export function readPreferencesCache(): UserPreferences | null {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return null;
    return normalizePreferences(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writePreferencesCache(prefs: UserPreferences) {
  localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(normalizePreferences(prefs)));
}

export function clearPreferencesCache() {
  localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  clearPreferencesPendingHydrate();
}

export function markPreferencesPendingHydrate() {
  sessionStorage.setItem(PREFERENCES_PENDING_HYDRATE_KEY, '1');
}

export function isPreferencesPendingHydrate(): boolean {
  return sessionStorage.getItem(PREFERENCES_PENDING_HYDRATE_KEY) === '1';
}

export function clearPreferencesPendingHydrate() {
  sessionStorage.removeItem(PREFERENCES_PENDING_HYDRATE_KEY);
}

export function resetOnboardingTour() {
  localStorage.removeItem(ONBOARDING_STORAGE_KEY);
}

export function getOnboardingStep(): number {
  try {
    const saved = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (saved == null) return 0;
    const n = Number(saved);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export function setOnboardingStep(step: number) {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, String(step));
}

const PRESET_BOOT_MAP = Object.fromEntries(
  COLOR_SCHEME_PRESETS.map((p) => [p.id, p.tokens])
);

/** Inline FOUC boot script body (no imports). Keep in sync with applyPreferences. */
export const PREFERENCES_BOOT_SCRIPT = `(function(){try{var k=${JSON.stringify(PREFERENCES_STORAGE_KEY)};var raw=localStorage.getItem(k);if(!raw)return;var p=JSON.parse(raw);var theme=p.theme||'system';var dark=theme==='dark'||(theme==='system'||!theme)&&matchMedia('(prefers-color-scheme:dark)').matches;var r=document.documentElement;if(dark)r.classList.add('dark');else r.classList.remove('dark');if(p.colorSchemeId)r.setAttribute('data-color-scheme',p.colorSchemeId);if(p.fontPairId)r.setAttribute('data-font-pair',p.fontPairId);r.setAttribute('data-reduce-motion',p.reduceMotion?'true':'false');r.setAttribute('data-card-tilt',p.cardTilt?'true':'false');if(p.locale)r.lang=p.locale;var presets=${JSON.stringify(PRESET_BOOT_MAP)};var map=${JSON.stringify(COLOR_TOKEN_CSS_VARS)};var scheme=null;if(p.colorSchemeId==='custom'&&p.customScheme){scheme=p.customScheme;}else if(p.colorSchemeId&&presets[p.colorSchemeId]){scheme=presets[p.colorSchemeId];}if(scheme){var tokens=dark?scheme.dark:scheme.light;for(var key in map){if(tokens[key])r.style.setProperty(map[key],tokens[key]);}}}catch(e){}})()`;
