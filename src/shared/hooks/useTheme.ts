'use client';

import { useEffect, useState } from 'react';
import { applyTheme, readStoredTheme, type Theme } from '@/shared/lib/theme';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStoredTheme();
    setThemeState(stored);
    applyTheme(stored);
    setReady(true);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (readStoredTheme() === 'system') {
        applyTheme('system');
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  function setTheme(next: Theme) {
    setThemeState(next);
    applyTheme(next);
  }

  return { theme, setTheme, ready };
}
