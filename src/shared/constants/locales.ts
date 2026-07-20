export type LocaleCode = 'en' | 'bn';

export const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'bn'];

export const DEFAULT_LOCALE: LocaleCode = 'en';

export type LocaleOption = {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
};

export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
];

export function isLocaleCode(value: unknown): value is LocaleCode {
  return typeof value === 'string' && SUPPORTED_LOCALES.includes(value as LocaleCode);
}
