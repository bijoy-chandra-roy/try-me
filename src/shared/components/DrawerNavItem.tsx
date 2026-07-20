'use client';

import Link from '@/shared/components/Link';
import type { LucideIcon } from 'lucide-react';

interface DrawerNavItemProps {
  href: string;
  label: string;
  icon: LucideIcon;
  active?: boolean;
  onClick?: () => void;
  badge?: number;
}

/** Labeled icon row for mobile drawers (tooltips are useless on touch). */
export function DrawerNavItem({
  href,
  label,
  icon: Icon,
  active = false,
  onClick,
  badge,
}: DrawerNavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-inner px-3 py-2.5 text-sm transition-colors ${
        active
          ? 'bg-[var(--color-overlay-pressed)] font-medium text-primary'
          : 'text-muted hover:bg-[var(--color-overlay-hover)] hover:text-primary'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.75} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {typeof badge === 'number' && badge > 0 && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-accent-fill)] px-1.5 text-xs text-[var(--color-on-accent)]">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}
