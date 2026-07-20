'use client';

import { SettingsSubNav } from '@/features/settings/components/SettingsSubNav';
import { useT } from '@/shared/hooks/useT';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const t = useT();

  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">
          {t('settings.title')}
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">{t('settings.subtitle')}</p>
      </header>
      <SettingsSubNav />
      {children}
    </div>
  );
}
