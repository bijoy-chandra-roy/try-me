'use client';

import { type ReactNode } from 'react';
import { Button, type ButtonProps } from '@/shared/components/Button';

/** @deprecated Prefer `Button`. Kept as a thin alias for existing imports. */
export function GlassButton({
  children,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  variant = 'primary',
  size = 'md',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
}) {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      variant={variant}
      size={size}
    >
      {children}
    </Button>
  );
}
