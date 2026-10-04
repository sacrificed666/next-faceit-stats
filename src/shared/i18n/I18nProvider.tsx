"use client";

import type { ReactNode } from "react";

import { I18nContext } from "./context";
import { createI18n } from "./create";
import type { Locale } from "./locales";
import type { Messages } from "./translate";

interface I18nProviderProps {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
}

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return <I18nContext value={createI18n(locale, messages)}>{children}</I18nContext>;
}
