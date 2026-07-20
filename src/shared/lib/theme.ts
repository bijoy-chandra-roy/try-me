export type Theme = 'light' | 'dark' | 'system';

export const THEME_OPTIONS: { value: Theme; label: string; description: string }[] = [
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

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return theme;
}

export function applyTheme(theme: Theme) {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  localStorage.setItem('theme', theme);
}

export function readStoredTheme(): Theme {
  const stored = localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}
