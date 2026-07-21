'use client';

import { Tooltip } from '@/shared/components/Tooltip';
import { OverflowText } from '@/shared/components/OverflowText';
import { useT } from '@/shared/hooks/useT';
import { TRY_ON_MEDIA_FRAME_CLASS } from '@/features/try-on/constants';
import type { TryOnResult } from '@/shared/types';

interface TryOnResultProps {
  result: TryOnResult;
}

export function TryOnResultView({ result }: TryOnResultProps) {
  const t = useT();

  return (
    <div className="space-y-4">
      <div className={TRY_ON_MEDIA_FRAME_CLASS}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={result.compositeImageUrl}
          alt={t('tryOn.resultAlt', { productName: result.productName })}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      <div className="flex items-center justify-between rounded-inner bg-[var(--color-overlay-hover)] px-4 py-3">
        <div className="min-w-0 pr-3">
          <OverflowText className="text-sm font-medium text-primary" title={result.productName}>
            {result.productName}
          </OverflowText>
          <OverflowText className="text-xs text-muted-subtle">
            {result.fromFallback
              ? t('tryOn.fallbackStatus')
              : t('tryOn.liveStatus')}
          </OverflowText>
        </div>
        <Tooltip
          content={
            result.fromFallback
              ? t('tryOn.fallbackTooltip')
              : t('tryOn.liveTooltip')
          }
        >
          <span
            className={`shrink-0 cursor-default ${
              result.fromFallback ? 'chip-status-fallback' : 'chip-status-live'
            }`}
          >
            {result.fromFallback ? t('tryOn.badge.fallback') : t('tryOn.badge.live')}
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
