'use client';

import { signOut } from 'next-auth/react';
import { DEFAULT_PREFERENCES } from '@/shared/constants';
import {
  applyPreferences,
  clearPreferencesCache,
} from '@/shared/lib/preferences';
import { setI18nLocale } from '@/shared/i18n';

export async function signOutAndClearPreferences(callbackUrl = '/') {
  clearPreferencesCache();
  applyPreferences(DEFAULT_PREFERENCES, { force: true });
  setI18nLocale(DEFAULT_PREFERENCES.locale);
  await signOut({ callbackUrl });
}

export function confirmSignOut(message: string): boolean {
  return window.confirm(message);
}
