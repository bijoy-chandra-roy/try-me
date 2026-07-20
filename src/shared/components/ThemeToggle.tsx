'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  localStorage.setItem('theme', theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme | null) ?? 'system';
    setTheme(stored);
    applyTheme(stored);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if ((localStorage.getItem('theme') as Theme | null) === 'system') {
        applyTheme('system');
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  function cycleTheme() {
    const next: Theme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
    applyTheme(next);
  }

  const label =
    theme === 'light' ? 'Light mode' : theme === 'dark' ? 'Dark mode' : 'System theme';

  return (
    <button
      type="button"
      onClick={cycleTheme}
      aria-label={`Theme: ${label}. Click to cycle.`}
      className="rounded-full p-2 text-sand-600 transition-colors hover:bg-sand-200/60 hover:text-olive-700 dark:text-sand-300 dark:hover:bg-olive-600/40 dark:hover:text-sand-100"
    >
      {theme === 'light' && (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
      {theme === 'dark' && (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <path d="M21 14.5A8.5 8.5 0 1114.5 3a6.5 6.5 0 006.5 11.5z" />
        </svg>
      )}
      {theme === 'system' && (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      )}
    </button>
  );
}
