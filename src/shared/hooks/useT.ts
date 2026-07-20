'use client';

import { usePreferences } from '@/shared/hooks/usePreferences';
import { t, type MessageKey, type MessageParams } from '@/shared/i18n';

export function useT() {
  const { prefs } = usePreferences();
  return (key: MessageKey, params?: MessageParams) => t(key, prefs.locale, params);
}
