'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import {
  APPLY_PREFERENCES_INSTANTLY,
  DEFAULT_PREFERENCES,
  type UserPreferences,
} from '@/shared/constants';
import { apiClient } from '@/shared/lib/api-client';
import {
  applyPreferences,
  clearPreferencesCache,
  clearPreferencesPendingHydrate,
  isPreferencesPendingHydrate,
  markPreferencesPendingHydrate,
  normalizePreferences,
  readPreferencesCache,
  writePreferencesCache,
} from '@/shared/lib/preferences';
import { setI18nLocale } from '@/shared/i18n';

type PrefsListener = () => void;

let memoryPrefs: UserPreferences = { ...DEFAULT_PREFERENCES };
const listeners = new Set<PrefsListener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: PrefsListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): UserPreferences {
  return memoryPrefs;
}

function getServerSnapshot(): UserPreferences {
  return DEFAULT_PREFERENCES;
}

function setMemoryPrefs(
  prefs: UserPreferences,
  opts?: { apply?: boolean; persistCache?: boolean }
) {
  memoryPrefs = normalizePreferences(prefs);
  setI18nLocale(memoryPrefs.locale);
  if (opts?.persistCache !== false) {
    writePreferencesCache(memoryPrefs);
  }
  const shouldApply = opts?.apply === true || (opts?.apply !== false && APPLY_PREFERENCES_INSTANTLY);
  if (shouldApply) {
    applyPreferences(memoryPrefs, { force: true });
  }
  emit();
}

function isReloadNavigation(): boolean {
  try {
    const nav = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    return nav?.type === 'reload';
  } catch {
    return false;
  }
}

async function fetchAndCachePreferences() {
  const data = await apiClient<{ preferences: UserPreferences }>('/users/me/preferences');
  clearPreferencesPendingHydrate();
  setMemoryPrefs(data.preferences, { apply: true });
  return data.preferences;
}

export function usePreferences() {
  const prefs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cached = readPreferencesCache();
    if (cached) {
      setMemoryPrefs(cached, { persistCache: false, apply: true });
    } else {
      applyPreferences(DEFAULT_PREFERENCES, { force: true });
      setI18nLocale(DEFAULT_PREFERENCES.locale);
    }
    setReady(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (memoryPrefs.theme === 'system') {
        applyPreferences(memoryPrefs, { force: true });
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  async function savePreferences(patch: Partial<UserPreferences>) {
    setSaving(true);
    setError(null);
    const next = normalizePreferences({ ...memoryPrefs, ...patch });
    setMemoryPrefs(next, { apply: APPLY_PREFERENCES_INSTANTLY });
    try {
      const data = await apiClient<{ preferences: UserPreferences }>(
        '/users/me/preferences',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        }
      );
      setMemoryPrefs(data.preferences, { apply: APPLY_PREFERENCES_INSTANTLY });
      return data.preferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function resetPreferences() {
    setSaving(true);
    setError(null);
    try {
      const data = await apiClient<{ preferences: UserPreferences }>(
        '/users/me/preferences',
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reset: true }),
        }
      );
      setMemoryPrefs(data.preferences, { apply: true });
      return data.preferences;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset preferences');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return {
    prefs,
    ready,
    saving,
    error,
    savePreferences,
    resetPreferences,
  };
}

/**
 * Hydrates preferences from Mongo after login refresh.
 * - Logged out: clear cache, defaults
 * - Logged in + LS cache: use cache
 * - Logged in + pending hydrate + not a reload: keep defaults
 * - Logged in + reload (or no pending): Mongo → LS → apply
 */
export function usePreferencesHydration(authenticated: boolean) {
  useEffect(() => {
    if (!authenticated) {
      clearPreferencesCache();
      setMemoryPrefs({ ...DEFAULT_PREFERENCES }, { persistCache: false, apply: true });
      return;
    }

    const cached = readPreferencesCache();
    if (cached) {
      setMemoryPrefs(cached, { persistCache: false, apply: true });
      return;
    }

    const pending = isPreferencesPendingHydrate();
    if (pending && !isReloadNavigation()) {
      setMemoryPrefs({ ...DEFAULT_PREFERENCES }, { persistCache: false, apply: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await fetchAndCachePreferences();
      } catch {
        if (!cancelled) {
          setMemoryPrefs({ ...DEFAULT_PREFERENCES }, { persistCache: false, apply: true });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authenticated]);
}

/** Call when a new session is established (credentials/OAuth sign-in success). */
export function onLoginSuccessMarkPrefsPending() {
  clearPreferencesCache();
  markPreferencesPendingHydrate();
}
