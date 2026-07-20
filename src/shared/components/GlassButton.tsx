'use client';

import { type ReactNode } from 'react';

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export function GlassButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
}: GlassButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
    >
      {children}
    </button>
  );
}
