'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { getSettingsNavItems } from '@/shared/auth/navigation';

export function SettingsSubNav() {
  const pathname = usePathname();
  const { role } = useAuth();
  const items = role ? getSettingsNavItems(role) : [];

  return (
    <nav
      aria-label="Settings sections"
      className="mb-8 flex flex-wrap gap-1 border-b border-subtle pb-px"
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`-mb-px border-b-2 px-3 py-2 text-sm transition-colors ${
              isActive
                ? 'border-[var(--color-accent-fill)] font-medium text-primary'
                : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
