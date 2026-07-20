'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';

export type IconButtonSize = 'sm' | 'md';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
  size?: IconButtonSize;
}

export function IconButton({
  children,
  label,
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={`btn-icon ${size === 'sm' ? 'btn-icon-sm' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
