'use client';

import type { TryOnResult } from '@/shared/types';

interface TryOnResultProps {
  result: TryOnResult;
}

export function TryOnResultView({ result }: TryOnResultProps) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.compositeImageUrl}
          alt={`Try-on result for ${result.productName}`}
          className="mx-auto max-h-96 w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-sand-100/80 px-4 py-3 dark:bg-olive-700/30">
        <div>
          <p className="text-sm font-medium text-olive-700 dark:text-sand-100">
            {result.productName}
          </p>
          <p className="text-xs text-sand-500 dark:text-sand-400">
            {result.fromFallback
              ? 'Served from resilient fallback cache'
              : 'Generated via VTO API'}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            result.fromFallback
              ? 'bg-clay-400/20 text-clay-600 dark:text-clay-400'
              : 'bg-olive-600/15 text-olive-600 dark:text-olive-500'
          }`}
        >
          {result.fromFallback ? 'Fallback' : 'Live'}
        </span>
      </div>
    </div>
  );
}
