import { en, type TranslationKeys } from './en';

type Path<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends object
    ? Path<T[K], `${P}${K}.`>
    : `${P}${K}`;
}[keyof T & string];

export type TranslationKey = Path<TranslationKeys>;

const dictionary: Record<string, TranslationKeys> = { en };

let currentLocale: keyof typeof dictionary = 'en';

export function setLocale(locale: keyof typeof dictionary): void {
  currentLocale = locale;
}

export function t(key: TranslationKey): string {
  const parts = key.split('.');
  let node: unknown = dictionary[currentLocale];
  for (const part of parts) {
    if (node && typeof node === 'object' && part in node) {
      node = (node as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof node === 'string' ? node : key;
}
