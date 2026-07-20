/** @deprecated Prefer @/shared/lib/preferences and @/shared/constants */
import {
  applyPreferences,
  normalizePreferences,
  readPreferencesCache,
  resolveTheme,
  writePreferencesCache,
} from '@/shared/lib/preferences';
import {
  THEME_OPTIONS,
  type ThemeMode,
  type UserPreferences,
} from '@/shared/constants';

export type Theme = ThemeMode;

export { THEME_OPTIONS, resolveTheme };

export function applyTheme(theme: Theme) {
  const cached = readPreferencesCache();
  const prefs: UserPreferences = normalizePreferences({
    ...(cached ?? {}),
    theme,
  });
  writePreferencesCache(prefs);
  applyPreferences(prefs, { force: true });
}

export function readStoredTheme(): Theme {
  return readPreferencesCache()?.theme ?? 'system';
}
