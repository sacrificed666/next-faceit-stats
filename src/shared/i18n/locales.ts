export const LOCALES = ["en", "uk", "de", "es", "fr", "it", "nl", "pl"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "locale";

interface LocaleInfo {
  name: string;
  flag: string;
  intl: string;
  openGraph: string;
}

export const LOCALE_INFO: Readonly<Record<Locale, LocaleInfo>> = {
  en: { name: "English", flag: "gb", intl: "en-GB", openGraph: "en_GB" },
  uk: { name: "Українська", flag: "ua", intl: "uk-UA", openGraph: "uk_UA" },
  de: { name: "Deutsch", flag: "de", intl: "de-DE", openGraph: "de_DE" },
  es: { name: "Español", flag: "es", intl: "es-ES", openGraph: "es_ES" },
  fr: { name: "Français", flag: "fr", intl: "fr-FR", openGraph: "fr_FR" },
  it: { name: "Italiano", flag: "it", intl: "it-IT", openGraph: "it_IT" },
  nl: { name: "Nederlands", flag: "nl", intl: "nl-NL", openGraph: "nl_NL" },
  pl: { name: "Polski", flag: "pl", intl: "pl-PL", openGraph: "pl_PL" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  const ranked = (acceptLanguage ?? "")
    .split(",")
    .map((part, index) => {
      const [tag = "", ...parameters] = part.trim().split(";");
      const quality = parameters.map((parameter) => parameter.trim()).find((parameter) => parameter.startsWith("q="));
      const weight = quality ? Number.parseFloat(quality.slice(2)) : 1;
      return { language: tag.toLowerCase().split("-")[0] ?? "", weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((entry) => entry.language !== "" && entry.weight > 0)
    .toSorted((a, b) => b.weight - a.weight || a.index - b.index);
  return ranked.map((entry) => entry.language).find(isLocale) ?? DEFAULT_LOCALE;
}

export function localePath(locale: Locale, path = "/"): string {
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
