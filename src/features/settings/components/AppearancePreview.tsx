'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/shared/components/Button';
import { Checkbox } from '@/shared/components/Checkbox';
import { StatusChip } from '@/shared/components/StatusChip';
import {
  applyPreferences,
  type ApplyPreferencesOptions,
} from '@/shared/lib/preferences';
import type { UserPreferences } from '@/shared/constants';

type Props = {
  draft: UserPreferences;
  /** Preview light/dark independently of system theme when theme is system. */
  previewMode: 'light' | 'dark';
};

/** Live mini UI kit scoped to draft preference tokens. */
export function AppearancePreview({ draft, previewMode }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const opts: ApplyPreferencesOptions = {
      target: el,
      force: true,
      forceResolvedMode: draft.theme === 'system' ? previewMode : undefined,
    };
    // When theme is light/dark, applyPreferences uses resolveTheme from window —
    // forceResolvedMode handles system; for explicit themes pass the theme itself.
    if (draft.theme === 'light' || draft.theme === 'dark') {
      opts.forceResolvedMode = draft.theme;
    }
    applyPreferences(draft, opts);
  }, [draft, previewMode]);

  return (
    <div
      ref={ref}
      data-prefs-preview
      className="overflow-hidden rounded-container border border-[var(--color-border)] bg-[var(--color-background-body)] p-4 text-[var(--color-text-primary)]"
      style={{
        fontFamily: 'var(--font-sans-active, inherit)',
      }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        Preview
      </p>
      <h3
        className="mt-1 text-xl font-semibold"
        style={{ fontFamily: 'var(--font-serif-active, inherit)' }}
      >
        TryMe sample
      </h3>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Buttons, inputs, chips, and cards use your draft scheme.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm">Primary</Button>
        <Button size="sm" variant="secondary">
          Secondary
        </Button>
        <Button size="sm" variant="ghost">
          Ghost
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        <input
          readOnly
          value="Sample input"
          className="input-glass w-full"
          aria-label="Sample input"
        />
          <Checkbox
            checked
            onChange={() => undefined}
            label="Remember preference"
          />
        <div className="flex flex-wrap gap-2">
          <StatusChip status="active" />
          <span className="chip-category">Category</span>
          <span className="text-sm text-error">Error text</span>
        </div>
      </div>

      <div
        className="glass-card motion-card-hover mt-4 p-3"
        style={{
          background: 'var(--color-background-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-container)',
        }}
      >
        <p
          className="font-semibold"
          style={{ fontFamily: 'var(--font-serif-active, inherit)' }}
        >
          Product card
        </p>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Soft surface with accent CTA
        </p>
        <button
          type="button"
          className="mt-3 rounded-full px-3 py-1.5 text-sm font-medium"
          style={{
            background: 'var(--color-accent-fill)',
            color: 'var(--color-on-accent)',
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
