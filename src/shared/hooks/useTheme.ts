'use client';

import { usePreferences } from '@/shared/hooks/usePreferences';
import type { ThemeMode } from '@/shared/constants';

/** @deprecated Prefer usePreferences for full appearance control. */
export function useTheme() {
  const { prefs, ready, savePreferences } = usePreferences();

  function setTheme(next: ThemeMode) {
    void savePreferences({ theme: next });
  }

  return { theme: prefs.theme, setTheme, ready };
}
