import { DEFAULT_LOCALE, type LocaleCode } from '@/shared/constants';
import { en } from './messages/en';
import { bn } from './messages/bn';

export type MessageKey = keyof typeof en;
export type MessageParams = Record<string, string | number>;

const catalogs: Record<LocaleCode, Record<MessageKey, string>> = {
  en,
  bn: bn as Record<MessageKey, string>,
};

let currentLocale: LocaleCode = DEFAULT_LOCALE;

export function setI18nLocale(locale: LocaleCode) {
  currentLocale = locale;
}

export function getI18nLocale(): LocaleCode {
  return currentLocale;
}

function interpolate(template: string, params?: MessageParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    params[name] !== undefined ? String(params[name]) : `{${name}}`
  );
}

/**
 * Translate a message key.
 * Overloads: t(key), t(key, locale), t(key, params), t(key, locale, params)
 */
export function t(key: MessageKey, localeOrParams?: LocaleCode | MessageParams, params?: MessageParams): string {
  let locale: LocaleCode = currentLocale;
  let vars: MessageParams | undefined;

  if (typeof localeOrParams === 'string') {
    locale = localeOrParams;
    vars = params;
  } else if (localeOrParams && typeof localeOrParams === 'object') {
    vars = localeOrParams;
  }

  const raw = catalogs[locale]?.[key] ?? catalogs.en[key] ?? key;
  return interpolate(raw, vars);
}
