'use client';

import { SettingsSubNav } from '@/features/settings/components/SettingsSubNav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-content px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-6 sm:mb-8">
        <h1 className="font-serif text-2xl font-semibold text-primary sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Manage your profile, security, and appearance
        </p>
      </header>
      <SettingsSubNav />
      {children}
    </div>
  );
}
