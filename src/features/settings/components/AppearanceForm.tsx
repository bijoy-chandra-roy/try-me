'use client';

import { useEffect, useMemo, useState } from 'react';
import { GlassCard } from '@/shared/components/GlassCard';
import { Button } from '@/shared/components/Button';
import { Checkbox } from '@/shared/components/Checkbox';
import { AppearancePreview } from '@/features/settings/components/AppearancePreview';
import { usePreferences } from '@/shared/hooks/usePreferences';
import { useT } from '@/shared/hooks/useT';
import {
  COLOR_SCHEME_PRESETS,
  COLOR_TOKEN_LABELS,
  createEmptyCustomScheme,
  DEFAULT_PREFERENCES,
  FONT_PAIRS,
  THEME_OPTIONS,
  type ColorSchemeId,
  type ColorTokenKey,
  type ColorTokens,
  type FontPairId,
  type ThemeMode,
  type UserPreferences,
} from '@/shared/constants';
import { resolveTheme } from '@/shared/lib/preferences';

const TOKEN_KEYS = Object.keys(COLOR_TOKEN_LABELS) as ColorTokenKey[];

function optionClass(selected: boolean) {
  return `flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 transition-colors ${
    selected
      ? 'border-[var(--color-accent-fill)] bg-[var(--color-overlay-pressed)]'
      : 'border-[var(--color-border)] hover:bg-[var(--color-overlay-hover)]'
  }`;
}

export function AppearanceForm() {
  const { prefs, ready, saving, error, savePreferences } = usePreferences();
  const t = useT();
  const [draft, setDraft] = useState<UserPreferences>(prefs);
  const [editorMode, setEditorMode] = useState<'light' | 'dark'>('light');
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraft(prefs);
  }, [prefs]);

  useEffect(() => {
    if (!ready) return;
    setPreviewMode(resolveTheme(prefs.theme));
    setEditorMode(resolveTheme(prefs.theme));
  }, [ready, prefs.theme]);

  const customTokens: ColorTokens = useMemo(() => {
    const scheme = draft.customScheme ?? createEmptyCustomScheme();
    return scheme[editorMode];
  }, [draft.customScheme, editorMode]);

  function patchDraft(partial: Partial<UserPreferences>) {
    setDraft((prev) => ({ ...prev, ...partial }));
    setMessage(null);
  }

  function updateCustomToken(key: ColorTokenKey, value: string) {
    const base = draft.customScheme ?? createEmptyCustomScheme();
    const next = {
      ...base,
      [editorMode]: { ...base[editorMode], [key]: value },
    };
    patchDraft({ colorSchemeId: 'custom', customScheme: next });
  }

  async function handleSave() {
    setMessage(null);
    try {
      await savePreferences(draft);
      setMessage(t('settings.appearance.saved'));
    } catch {
      /* error surfaced via hook */
    }
  }

  async function handleResetAppearance() {
    if (!window.confirm(t('settings.appearance.resetConfirm'))) return;
    setMessage(null);
    try {
      const next = {
        theme: DEFAULT_PREFERENCES.theme,
        colorSchemeId: DEFAULT_PREFERENCES.colorSchemeId,
        customScheme: null,
        fontPairId: DEFAULT_PREFERENCES.fontPairId,
        reduceMotion: DEFAULT_PREFERENCES.reduceMotion,
        cardTilt: DEFAULT_PREFERENCES.cardTilt,
      };
      await savePreferences(next);
      setDraft((prev) => ({ ...prev, ...next }));
      setMessage(t('settings.appearance.resetDone'));
    } catch {
      /* error surfaced via hook */
    }
  }

  const schemes: { id: ColorSchemeId; label: string; description: string }[] = [
    ...COLOR_SCHEME_PRESETS.map((p) => ({
      id: p.id as ColorSchemeId,
      label: p.label,
      description: p.description,
    })),
    {
      id: 'custom',
      label: t('settings.appearance.custom'),
      description: t('settings.appearance.customDesc'),
    },
  ];

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="font-serif text-xl font-semibold">{t('settings.appearance.title')}</h2>
        <p className="mt-1 text-sm text-muted">{t('settings.appearance.subtitle')}</p>

        <fieldset className="mt-6 space-y-2" disabled={!ready || saving}>
          <legend className="mb-2 text-sm font-medium">{t('settings.appearance.theme')}</legend>
          {THEME_OPTIONS.map((option) => {
            const selected = draft.theme === option.value;
            return (
              <label key={option.value} className={optionClass(selected)}>
                <input
                  type="radio"
                  name="theme"
                  value={option.value}
                  checked={selected}
                  onChange={() => patchDraft({ theme: option.value as ThemeMode })}
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

        <fieldset className="mt-8 space-y-2" disabled={!ready || saving}>
          <legend className="mb-2 text-sm font-medium">
            {t('settings.appearance.colorScheme')}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {schemes.map((scheme) => {
              const selected = draft.colorSchemeId === scheme.id;
              const preset = COLOR_SCHEME_PRESETS.find((p) => p.id === scheme.id);
              return (
                <label key={scheme.id} className={optionClass(selected)}>
                  <input
                    type="radio"
                    name="colorScheme"
                    value={scheme.id}
                    checked={selected}
                    onChange={() => {
                      if (scheme.id === 'custom') {
                        patchDraft({
                          colorSchemeId: 'custom',
                          customScheme: draft.customScheme ?? createEmptyCustomScheme(),
                        });
                      } else {
                        patchDraft({ colorSchemeId: scheme.id });
                      }
                    }}
                    className="mt-1"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block text-sm font-medium">{scheme.label}</span>
                      {preset && (
                        <span className="flex gap-1" aria-hidden>
                          <span
                            className="h-3 w-3 rounded-full border border-[var(--color-border)]"
                            style={{ background: preset.tokens.light.accentFill }}
                          />
                          <span
                            className="h-3 w-3 rounded-full border border-[var(--color-border)]"
                            style={{ background: preset.tokens.dark.accentFill }}
                          />
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted">{scheme.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {draft.colorSchemeId === 'custom' && (
          <div className="mt-6 rounded-xl border border-[var(--color-border)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{t('settings.appearance.customColors')}</p>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((mode) => (
                  <Button
                    key={mode}
                    size="sm"
                    variant={editorMode === mode ? 'primary' : 'secondary'}
                    onClick={() => setEditorMode(mode)}
                  >
                    {mode === 'light'
                      ? t('settings.appearance.lightScience')
                      : t('settings.appearance.darkScience')}
                  </Button>
                ))}
              </div>
            </div>
            <p className="mt-1 text-xs text-muted">{t('settings.appearance.customHint')}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TOKEN_KEYS.map((key) => (
                <label key={key} className="block text-sm">
                  <span className="mb-1 block text-muted">{COLOR_TOKEN_LABELS[key]}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={toColorInputValue(customTokens[key])}
                      onChange={(e) => updateCustomToken(key, e.target.value)}
                      className="h-9 w-12 cursor-pointer rounded border border-[var(--color-border)] bg-transparent"
                    />
                    <input
                      type="text"
                      value={customTokens[key]}
                      onChange={(e) => updateCustomToken(key, e.target.value)}
                      className="input-glass min-w-0 flex-1 font-mono text-xs"
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <fieldset className="mt-8 space-y-2" disabled={!ready || saving}>
          <legend className="mb-2 text-sm font-medium">{t('settings.appearance.fonts')}</legend>
          {FONT_PAIRS.map((pair) => {
            const selected = draft.fontPairId === pair.id;
            return (
              <label key={pair.id} className={optionClass(selected)}>
                <input
                  type="radio"
                  name="fontPair"
                  value={pair.id}
                  checked={selected}
                  onChange={() => patchDraft({ fontPairId: pair.id as FontPairId })}
                  className="mt-1"
                />
                <span>
                  <span
                    className="block text-sm font-medium"
                    style={{ fontFamily: pair.serif }}
                  >
                    {pair.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted" style={{ fontFamily: pair.sans }}>
                    {pair.description}
                  </span>
                </span>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-8 space-y-4">
          <p className="mb-2 text-sm font-medium">{t('settings.appearance.motion')}</p>
          <Checkbox
            checked={draft.cardTilt}
            onChange={(checked) => patchDraft({ cardTilt: checked })}
            label={t('settings.appearance.cardTilt')}
            disabled={!ready || saving}
          />
          <p className="text-xs text-muted">{t('settings.appearance.cardTiltHint')}</p>
          <Checkbox
            checked={draft.reduceMotion}
            onChange={(checked) => patchDraft({ reduceMotion: checked })}
            label={t('settings.appearance.reduceMotion')}
            disabled={!ready || saving}
          />
          <p className="text-xs text-muted">{t('settings.appearance.reduceMotionHint')}</p>
        </div>

        <div className="mt-8">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium">{t('settings.appearance.livePreview')}</p>
            {draft.theme === 'system' && (
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((mode) => (
                  <Button
                    key={mode}
                    size="sm"
                    variant={previewMode === mode ? 'primary' : 'ghost'}
                    onClick={() => setPreviewMode(mode)}
                  >
                    {mode === 'light'
                      ? t('settings.appearance.previewLight')
                      : t('settings.appearance.previewDark')}
                  </Button>
                ))}
              </div>
            )}
          </div>
          <AppearancePreview draft={draft} previewMode={previewMode} />
        </div>

        {(error || message) && (
          <p className={`mt-4 text-sm ${error ? 'text-error' : 'text-muted'}`}>
            {error ?? message}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => void handleSave()} disabled={!ready || saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
          <Button
            variant="secondary"
            onClick={() => void handleResetAppearance()}
            disabled={!ready || saving}
          >
            {t('common.reset')}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}

/** Color inputs need #rrggbb; fall back when value is rgba/named. */
function toColorInputValue(value: string): string {
  if (/^#[0-9a-fA-F]{6}$/.test(value)) return value;
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const r = value[1];
    const g = value[2];
    const b = value[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return '#888888';
}
