import { createFormatter } from "@/shared/lib/format";

import type { I18n } from "./context";
import type { Locale } from "./locales";
import { createTranslator, type Messages } from "./translate";

export function createI18n(locale: Locale, messages: Messages): I18n {
  return { locale, t: createTranslator(locale, messages), format: createFormatter(locale) };
}
