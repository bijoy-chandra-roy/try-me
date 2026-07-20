'use client';

import { GlassCard } from '@/shared/components/GlassCard';
import { useTheme } from '@/shared/hooks/useTheme';
import { THEME_OPTIONS, type Theme } from '@/shared/lib/theme';

export function AppearanceForm() {
  const { theme, setTheme, ready } = useTheme();

  return (
    <GlassCard className="max-w-form p-6">
      <h2 className="font-serif text-xl font-semibold">Appearance</h2>
      <p className="mt-1 text-sm text-muted">
        Choose how TryMe looks on this device. Your preference is saved in this browser.
      </p>

      <fieldset className="mt-6 space-y-2" disabled={!ready}>
        <legend className="sr-only">Theme</legend>
        {THEME_OPTIONS.map((option) => {
          const selected = theme === option.value;
          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                selected
                  ? 'border-[var(--color-accent-fill)] bg-[var(--color-overlay-pressed)]'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-overlay-hover)]'
              }`}
            >
              <input
                type="radio"
                name="theme"
                value={option.value}
                checked={selected}
                onChange={() => setTheme(option.value as Theme)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="mt-0.5 block text-sm text-muted">{option.description}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </GlassCard>
  );
}
