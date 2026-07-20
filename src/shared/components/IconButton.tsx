'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Tooltip } from '@/shared/components/Tooltip';
import type { FloatingSide } from '@/shared/hooks/useFloatingPosition';

export type IconButtonSize = 'sm' | 'md';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Accessible name; also used as tooltip text when tooltip is enabled. */
  label: string;
  size?: IconButtonSize;
  tooltipSide?: FloatingSide;
  /** Set false when a parent already shows the label (e.g. drawer rows). */
  showTooltip?: boolean;
}

export function IconButton({
  children,
  label,
  size = 'md',
  className = '',
  type = 'button',
  tooltipSide = 'top',
  showTooltip = true,
  ...rest
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={`btn-icon ${size === 'sm' ? 'btn-icon-sm' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );

  if (!showTooltip) return button;

  return (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
