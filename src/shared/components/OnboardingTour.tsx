'use client';

import { useEffect, useState } from 'react';

const STEPS = [
  {
    id: 'filter',
    message: 'Filter by category to narrow the collection.',
  },
  {
    id: 'try-on',
    message: 'Hover a product card, then click Try On to preview it on your photo.',
  },
];

const STORAGE_KEY = 'tryme-onboarding-step';

export function OnboardingTour() {
  const [stepIndex, setStepIndex] = useState<number | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const index = saved ? Number(saved) : 0;
    if (index < STEPS.length) {
      setStepIndex(index);
    }
  }, []);

  if (stepIndex === null || stepIndex >= STEPS.length) return null;

  const step = STEPS[stepIndex];

  function advance() {
    if (stepIndex === null) return;
    const next = stepIndex + 1;
    localStorage.setItem(STORAGE_KEY, String(next));
    setStepIndex(next < STEPS.length ? next : null);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, String(STEPS.length));
    setStepIndex(null);
  }

  return (
    <div className="surface-popover fixed bottom-6 right-6 z-toast max-w-xs p-4">
      <p className="text-sm text-primary">{step.message}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-muted-subtle">
          {stepIndex + 1} of {STEPS.length}
        </span>
        <div className="flex gap-2">
          <button type="button" onClick={dismiss} className="btn-ghost btn-sm">
            Skip
          </button>
          <button type="button" onClick={advance} className="btn-primary btn-sm">
            {stepIndex + 1 === STEPS.length ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
