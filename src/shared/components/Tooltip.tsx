'use client';

import { type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  side?: 'top' | 'bottom';
  fullWidth?: boolean;
}

export function Tooltip({ content, children, side = 'top', fullWidth = false }: TooltipProps) {
  return (
    <span
      className={`tooltip-trigger group/tip relative ${fullWidth ? 'block w-full' : 'inline-flex'}`}
    >
      {children}
      <span
        role="tooltip"
        className={`tooltip-bubble pointer-events-none absolute left-1/2 z-50 w-max max-w-[220px] -translate-x-1/2 rounded-lg px-2.5 py-1.5 text-center text-xs font-medium opacity-0 transition-opacity duration-200 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100 ${
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
        }`}
      >
        {content}
      </span>
    </span>
  );
}
