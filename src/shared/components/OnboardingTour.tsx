'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { Button } from '@/shared/components/Button';
import { GlassCard } from '@/shared/components/GlassCard';
import { ONBOARDING_STORAGE_KEY } from '@/shared/constants';
import {
  getOnboardingStep,
  setOnboardingStep,
} from '@/shared/lib/preferences';
import { useT } from '@/shared/hooks/useT';
import type { MessageKey } from '@/shared/i18n';

const STEP_KEYS = [
  { title: 'onboarding.step1.title', body: 'onboarding.step1.body' },
  { title: 'onboarding.step2.title', body: 'onboarding.step2.body' },
  { title: 'onboarding.step3.title', body: 'onboarding.step3.body' },
] as const satisfies ReadonlyArray<{ title: MessageKey; body: MessageKey }>;

/** Lightweight demo tour — progress is device-local for easy reset between demos. */
export function OnboardingTour() {
  const { status } = useSession();
  const pathname = usePathname();
  const t = useT();
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') {
      setStep(null);
      return;
    }
    // Skip on auth pages
    if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
      setStep(null);
      return;
    }
    const saved = getOnboardingStep();
    if (saved >= STEP_KEYS.length) {
      setStep(null);
      return;
    }
    setStep(saved);
  }, [status, pathname]);

  if (step == null || step >= STEP_KEYS.length) return null;

  const current = STEP_KEYS[step];
  const isLast = step === STEP_KEYS.length - 1;

  function advance(next: number) {
    setOnboardingStep(next);
    setStep(next >= STEP_KEYS.length ? null : next);
  }

  function skip() {
    setOnboardingStep(STEP_KEYS.length);
    setStep(null);
  }

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-overlay flex justify-center p-4 sm:bottom-6 sm:p-0"
      role="dialog"
      aria-label={t('onboarding.ariaLabel')}
    >
      <GlassCard className="motion-fade-in w-full max-w-md p-5 shadow-med sm:mx-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          {t('onboarding.tipProgress', { n: step + 1, total: STEP_KEYS.length })}
        </p>
        <h2 className="mt-1 font-serif text-xl font-semibold text-primary">
          {t(current.title)}
        </h2>
        <p className="mt-2 text-sm text-muted">{t(current.body)}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={skip}>
            {t('onboarding.skip')}
          </Button>
          <Button
            size="sm"
            onClick={() => advance(step + 1)}
          >
            {isLast ? t('onboarding.done') : t('onboarding.next')}
          </Button>
        </div>
        {/* Keep key referenced so resets that clear ONBOARDING_STORAGE_KEY are discoverable */}
        <span className="sr-only" data-onboarding-key={ONBOARDING_STORAGE_KEY} />
      </GlassCard>
    </div>
  );
}
