'use client';

import { type ReactNode } from 'react';
import { useGlassElasticity } from '@/shared/hooks/useGlassElasticity';
import { ScrollArea } from '@/shared/components/ScrollArea';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  elastic?: boolean;
  /** Defaults to hidden (clips glass/media). Use auto for scrollable panels. */
  overflow?: 'hidden' | 'auto' | 'visible';
}

export function GlassCard({
  children,
  className = '',
  hover = false,
  elastic = true,
  overflow = 'hidden',
}: GlassCardProps) {
  const { ref, handleMouseMove, handleMouseLeave } = useGlassElasticity<HTMLDivElement>();

  if (overflow === 'auto') {
    return (
      <div
        ref={elastic ? ref : undefined}
        onMouseMove={elastic ? handleMouseMove : undefined}
        onMouseLeave={elastic ? handleMouseLeave : undefined}
        className={`glass-card relative flex min-h-0 flex-col overflow-hidden rounded-2xl ${
          hover ? 'glass-card-hover' : ''
        } ${className}`}
      >
        <ScrollArea
          className="flex min-h-0 flex-1 flex-col"
          viewportClassName="min-h-0 flex-1"
          edgeInset={16}
        >
          {children}
        </ScrollArea>
      </div>
    );
  }

  const overflowClass =
    overflow === 'visible' ? 'overflow-visible' : 'overflow-hidden';

  return (
    <div
      ref={elastic ? ref : undefined}
      onMouseMove={elastic ? handleMouseMove : undefined}
      onMouseLeave={elastic ? handleMouseLeave : undefined}
      className={`glass-card relative rounded-2xl ${overflowClass} ${hover ? 'glass-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
