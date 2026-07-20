'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Tooltip } from '@/shared/components/Tooltip';
import type { FloatingSide } from '@/shared/hooks/useFloatingPosition';

interface IconLinkProps {
  href: string;
  label: string;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  tooltipSide?: FloatingSide;
  showTooltip?: boolean;
  className?: string;
  badge?: number;
}

export function IconLink({
  href,
  label,
  children,
  active = false,
  onClick,
  tooltipSide = 'top',
  showTooltip = true,
  className = '',
  badge,
}: IconLinkProps) {
  const link = (
    <Link
      href={href}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onClick={onClick}
      className={`btn-icon relative ${
        active
          ? 'bg-[var(--color-overlay-pressed)] text-primary'
          : 'text-muted'
      } ${className}`.trim()}
    >
      {children}
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-accent-fill)] px-1 text-[10px] font-medium text-[var(--color-on-accent)]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );

  if (!showTooltip) return link;

  return (
    <Tooltip content={label} side={tooltipSide}>
      {link}
    </Tooltip>
  );
}
