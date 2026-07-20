'use client';

import { type ReactNode } from 'react';
import { useGlassElasticity } from '@/shared/hooks/useGlassElasticity';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  elastic?: boolean;
}

export function GlassCard({
  children,
  className = '',
  hover = false,
  elastic = true,
}: GlassCardProps) {
  const { ref, handleMouseMove, handleMouseLeave } = useGlassElasticity<HTMLDivElement>();

  return (
    <div
      ref={elastic ? ref : undefined}
      onMouseMove={elastic ? handleMouseMove : undefined}
      onMouseLeave={elastic ? handleMouseLeave : undefined}
      className={`glass-card relative overflow-hidden rounded-2xl ${hover ? 'glass-card-hover' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
