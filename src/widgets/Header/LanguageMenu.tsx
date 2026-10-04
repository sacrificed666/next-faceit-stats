"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useId } from "react";

import { useSearch } from "@/shared/hooks/useQuery";
import { LOCALE_COOKIE, LOCALE_INFO, LOCALES, isLocale, type Locale } from "@/shared/i18n/locales";
import { useI18n } from "@/shared/i18n/useI18n";
import { flagUrl } from "@/shared/lib/urls";
import { Icon } from "@/shared/ui/Icon";

function swapLocale(pathname: string, locale: Locale): string {
  const [, first = "", ...rest] = pathname.split("/");
  const tail = isLocale(first) ? rest : [first, ...rest].filter(Boolean);
  return ["", locale, ...tail].join("/");
}

function remember(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; samesite=lax`;
}

function Flag({ locale }: { locale: Locale }) {
  return (
    <Image
      src={flagUrl(LOCALE_INFO[locale].flag)}
      alt=""
      width={20}
      height={15}
      unoptimized
      referrerPolicy="no-referrer"
      className="h-[15px] w-5 shrink-0 rounded-[3px] object-cover ring-1 ring-line"
    />
  );
}

export function LanguageMenu() {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const search = useSearch();
  const id = useId();
  const menu = `${id}-languages`;
  return (
    <div className="relative">
      <button
        type="button"
        popoverTarget={menu}
        aria-label={`${t("nav.languageCurrent", { language: LOCALE_INFO[locale].name })} (${locale.toUpperCase()})`}
        className="language-anchor inline-flex h-9 items-center gap-2 rounded-full px-2.5 text-sm font-bold text-ink-secondary uppercase transition-colors hover:bg-hover hover:text-ink"
      >
        <Flag locale={locale} />
        <span aria-hidden="true" className="max-sm:hidden">
          {locale}
        </span>
        <Icon name="chevronDown" size={14} />
      </button>
      <div id={menu} popover="auto" className="language-menu panel w-56 p-1.5">
        <p className="px-3 pt-1.5 pb-1 text-xs font-semibold text-ink-muted">{t("nav.language")}</p>
        <ul>
          {LOCALES.map((entry) => (
            <li key={entry}>
              <a
                href={`${swapLocale(pathname, entry)}${search}`}
                hrefLang={entry}
                lang={entry}
                aria-current={entry === locale ? "true" : undefined}
                onClick={() => remember(entry)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-hover hover:text-ink aria-[current=true]:text-ink"
              >
                <Flag locale={entry} />
                <span className="flex-1">{LOCALE_INFO[entry].name}</span>
                {entry === locale ? <Icon name="check" size={16} className="text-accent-text" /> : null}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
