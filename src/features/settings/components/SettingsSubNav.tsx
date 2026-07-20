'use client';

import Link from '@/shared/components/Link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { getSettingsNavItems } from '@/shared/auth/navigation';
import { Tooltip } from '@/shared/components/Tooltip';
import { getNavIcon } from '@/shared/ui/nav-icons';
import { useT } from '@/shared/hooks/useT';

export function SettingsSubNav() {
  const pathname = usePathname();
  const { role } = useAuth();
  const t = useT();
  const items = role ? getSettingsNavItems(role) : [];

  return (
    <nav
      aria-label={t('settings.title')}
      className="mb-8 flex flex-wrap gap-1 border-b border-subtle pb-px"
    >
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = getNavIcon(item.icon);
        const label = t(item.labelKey);
        return (
          <Tooltip key={item.href} content={label}>
            <Link
              href={item.href}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              className={`motion-nav-underline -mb-px inline-flex items-center justify-center border-b-2 px-3 py-2.5 sm:px-4 ${
                isActive
                  ? 'border-[var(--color-accent-fill)] text-primary'
                  : 'border-transparent text-muted hover:text-primary'
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
              <span className="sr-only">{label}</span>
            </Link>
          </Tooltip>
        );
      })}
    </nav>
  );
}
