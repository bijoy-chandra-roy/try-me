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
    <div className="fixed bottom-6 right-6 z-40 max-w-xs rounded-xl border border-sand-200/80 bg-sand-50/95 p-4 shadow-xl backdrop-blur-md dark:border-olive-600/60 dark:bg-olive-700/95">
      <p className="text-sm text-olive-700 dark:text-sand-100">{step.message}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="text-xs text-sand-500 dark:text-sand-400">
          {stepIndex + 1} of {STEPS.length}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={dismiss}
            className="text-xs font-medium text-sand-600 hover:text-olive-700 dark:text-sand-300 dark:hover:text-sand-100"
          >
            Skip
          </button>
          <button
            type="button"
            onClick={advance}
            className="rounded-full bg-olive-600 px-3 py-1 text-xs font-medium text-sand-50 hover:bg-olive-700"
          >
            {stepIndex + 1 === STEPS.length ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
