'use client';

import { useSession } from 'next-auth/react';
import { usePreferencesHydration } from '@/shared/hooks/usePreferences';

/** Syncs Mongo preferences ↔ localStorage according to login/logout rules. */
export function PreferencesHydrator() {
  const { status } = useSession();
  usePreferencesHydration(status === 'authenticated');
  return null;
}
