import { LOCALE_INFO, type Locale } from "./locales";
import type { en } from "./messages/en";

export type PluralMessage = Readonly<Partial<Record<Intl.LDMLPluralRule, string>> & { other: string }>;
export type Message = string | PluralMessage;
export type MessageKey = keyof typeof en;
export type Messages = Readonly<Record<MessageKey, Message>>;
export type TranslationParams = Readonly<Record<string, string | number>>;
export type Translate = (key: MessageKey, params?: TranslationParams) => string;

const pluralRules = new Map<Locale, Intl.PluralRules>();
const numberFormats = new Map<Locale, Intl.NumberFormat>();

export function pluralCategory(locale: Locale, count: number): Intl.LDMLPluralRule {
  let rules = pluralRules.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(LOCALE_INFO[locale].intl);
    pluralRules.set(locale, rules);
  }
  return rules.select(count);
}

function formatParameter(locale: Locale, value: string | number): string {
  if (typeof value === "string") return value;
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(LOCALE_INFO[locale].intl, { maximumFractionDigits: 0 });
    numberFormats.set(locale, format);
  }
  return format.format(value);
}

export function translate(locale: Locale, messages: Messages, key: MessageKey, params: TranslationParams = {}): string {
  const message = messages[key];
  const template =
    typeof message === "string"
      ? message
      : (message[pluralCategory(locale, Number(params.count ?? 0))] ?? message.other);
  return template.replaceAll(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name];
    return value === undefined ? placeholder : formatParameter(locale, value);
  });
}

export function createTranslator(locale: Locale, messages: Messages): Translate {
  return (key, params) => translate(locale, messages, key, params);
}
