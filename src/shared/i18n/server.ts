import "server-only";
import { locale as rootLocale } from "next/root-params";

import type { I18n } from "./context";
import { createI18n } from "./create";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./locales";
import type { Messages } from "./translate";

const LOADERS: Readonly<Record<Locale, () => Promise<Messages>>> = {
  en: async () => (await import("./messages/en")).en,
  uk: async () => (await import("./messages/uk")).uk,
  de: async () => (await import("./messages/de")).de,
  es: async () => (await import("./messages/es")).es,
  fr: async () => (await import("./messages/fr")).fr,
  it: async () => (await import("./messages/it")).it,
  nl: async () => (await import("./messages/nl")).nl,
  pl: async () => (await import("./messages/pl")).pl,
};

export function getMessages(locale: Locale): Promise<Messages> {
  return LOADERS[locale]();
}

export async function getI18n(locale: Locale): Promise<I18n> {
  return createI18n(locale, await getMessages(locale));
}

export async function currentLocale(): Promise<Locale> {
  const value = await rootLocale();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
