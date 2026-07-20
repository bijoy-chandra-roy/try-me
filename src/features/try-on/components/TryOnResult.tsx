'use client';

import { Tooltip } from '@/shared/components/Tooltip';
import type { TryOnResult } from '@/shared/types';

interface TryOnResultProps {
  result: TryOnResult;
}

export function TryOnResultView({ result }: TryOnResultProps) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-xl ring-1 ring-sand-200/60 dark:ring-olive-600/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.compositeImageUrl}
          alt={`Try-on result for ${result.productName}`}
          className="mx-auto max-h-96 w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between rounded-lg bg-sand-100/80 px-4 py-3 dark:bg-olive-700/30">
        <div className="min-w-0 pr-3">
          <p className="truncate text-sm font-medium text-olive-700 dark:text-sand-100">
            {result.productName}
          </p>
          <p className="truncate text-xs text-muted-subtle">
            {result.fromFallback
              ? 'Served from resilient fallback cache'
              : 'Generated via VTO API'}
          </p>
        </div>
        <Tooltip
          content={
            result.fromFallback
              ? 'API unavailable — showing a cached composite'
              : 'Freshly generated from the live VTO service'
          }
        >
          <span
            className={`shrink-0 cursor-default ${
              result.fromFallback ? 'chip-status-fallback' : 'chip-status-live'
            }`}
          >
            {result.fromFallback ? 'Fallback' : 'Live'}
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
