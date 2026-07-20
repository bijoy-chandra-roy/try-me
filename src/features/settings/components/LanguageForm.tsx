'use client';

import { useState } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { usePreferences } from '@/shared/hooks/usePreferences';
import { useT } from '@/shared/hooks/useT';
import { getFontPair, LOCALE_OPTIONS, type LocaleCode } from '@/shared/constants';

export function LanguageForm() {
  const { prefs, ready, saving, error, savePreferences } = usePreferences();
  const t = useT();
  const [message, setMessage] = useState<string | null>(null);

  async function selectLocale(locale: LocaleCode) {
    setMessage(null);
    try {
      const patch: { locale: LocaleCode; fontPairId?: 'bengali' } = { locale };
      if (locale === 'bn' && !getFontPair(prefs.fontPairId).supportsBengali) {
        patch.fontPairId = 'bengali';
      }
      await savePreferences(patch);
      setMessage(t('settings.language.saved'));
    } catch {
      /* hook error */
    }
  }

  return (
    <GlassCard className="max-w-form p-6">
      <h2 className="font-serif text-xl font-semibold">{t('settings.language.title')}</h2>
      <p className="mt-1 text-sm text-muted">{t('settings.language.subtitle')}</p>

      <fieldset className="mt-6 space-y-2" disabled={!ready || saving}>
        <legend className="sr-only">{t('settings.language.legend')}</legend>
        {LOCALE_OPTIONS.map((option) => {
          const selected = prefs.locale === option.code;
          return (
            <label
              key={option.code}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
                selected
                  ? 'border-[var(--color-accent-fill)] bg-[var(--color-overlay-pressed)]'
                  : 'border-[var(--color-border)] hover:bg-[var(--color-overlay-hover)]'
              }`}
            >
              <input
                type="radio"
                name="locale"
                value={option.code}
                checked={selected}
                onChange={() => void selectLocale(option.code)}
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">{option.nativeLabel}</span>
                <span className="mt-0.5 block text-sm text-muted">{option.label}</span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <p className="mt-4 text-xs text-muted">{t('settings.language.moreHint')}</p>

      {(error || message) && (
        <p className={`mt-4 text-sm ${error ? 'text-error' : 'text-muted'}`}>
          {error ?? message}
        </p>
      )}

      {saving && (
        <Button disabled className="mt-4">
          {t('common.saving')}
        </Button>
      )}
    </GlassCard>
  );
}
