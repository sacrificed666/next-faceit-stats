"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useId } from "react";

import { useSearch } from "@/shared/hooks/useQuery";
import { isLocale, LOCALE_COOKIE, LOCALE_INFO, LOCALES, type Locale } from "@/shared/i18n/locales";
import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import type { Effects } from "@/shared/lib/effects";
import type { ThemePreference } from "@/shared/lib/theme";
import { flagUrl } from "@/shared/lib/urls";
import Icon, { type IconName } from "@/shared/ui/Icon/Icon";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

import { setEffects, useDeviceEffects, useEffects } from "../../model/useEffects";
import { setTheme, useTheme } from "../../model/useTheme";

const ONE_YEAR = 60 * 60 * 24 * 365;

const THEMES: ReadonlyArray<{ value: ThemePreference; label: MessageKey; icon: IconName }> = [
  { value: "system", label: "settings.theme.system", icon: "monitor" },
  { value: "light", label: "settings.theme.light", icon: "sun" },
  { value: "dark", label: "settings.theme.dark", icon: "moon" },
];

const EFFECT_OPTIONS: ReadonlyArray<{ value: Effects; label: MessageKey }> = [
  { value: "auto", label: "settings.effects.auto" },
  { value: "full", label: "settings.effects.full" },
  { value: "reduced", label: "settings.effects.reduced" },
];

// The same address in another language
const switchLocale = (pathname: string, locale: Locale) => {
  const [, first = "", ...rest] = pathname.split("/");
  const tail = isLocale(first) ? rest : [first, ...rest].filter(Boolean);
  return ["", locale, ...tail].join("/");
};

// Remembers the language for the next visit to the bare address
const rememberLocale = (locale: Locale) => {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
};

// Settings popover: appearance, effects and language
const SettingsMenu = () => {
  const { locale, t } = useI18n();
  const pathname = usePathname();
  const search = useSearch();
  const theme = useTheme();
  const effects = useEffects();
  const device = useDeviceEffects();
  const panelId = useId();
  const titleId = useId();
  const languagesId = useId();
  const themes = THEMES.map((entry) => ({
    value: entry.value,
    label: (
      <span className="flex items-center justify-center gap-1.5">
        <Icon name={entry.icon} size={15} />
        {t(entry.label)}
      </span>
    ),
  }));

  return (
    <>
      <button
        type="button"
        popoverTarget={panelId}
        aria-label={t("settings.open")}
        className="settings-anchor inline-flex size-10 items-center justify-center rounded-full text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
      >
        <Icon name="sliders" size={20} />
      </button>
      <dialog id={panelId} popover="auto" aria-labelledby={titleId} className="settings-panel panel">
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-lg font-bold text-ink">
            {t("settings.title")}
          </h2>
          <button
            type="button"
            popoverTarget={panelId}
            popoverTargetAction="hide"
            aria-label={t("settings.close")}
            className="inline-flex size-8 items-center justify-center rounded-full bg-inset text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
          >
            <Icon name="close" size={16} />
          </button>
        </div>
        <SegmentedControl
          label={t("settings.theme")}
          hideLabel={false}
          fill
          options={themes}
          value={theme}
          onChange={setTheme}
        />
        <SegmentedControl
          label={t("settings.effects")}
          hideLabel={false}
          fill
          options={EFFECT_OPTIONS.map((entry) => ({ value: entry.value, label: t(entry.label) }))}
          value={effects}
          description={
            effects === "auto" && device
              ? t("settings.effects.device", { mode: t(`settings.effects.${device}`) })
              : undefined
          }
          onChange={setEffects}
        />
        <div className="min-w-0">
          <h3 id={languagesId} className="mb-1.5 text-xs font-semibold text-ink-muted">
            {t("settings.language")}
          </h3>
          <ul aria-labelledby={languagesId} className="grid grid-cols-2 gap-1">
            {LOCALES.map((entry) => (
              <li key={entry}>
                <a
                  href={`${switchLocale(pathname, entry)}${search}`}
                  hrefLang={entry}
                  lang={entry}
                  aria-current={entry === locale ? "true" : undefined}
                  onClick={() => rememberLocale(entry)}
                  className="flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold text-ink-secondary transition-colors hover:bg-hover hover:text-ink aria-[current=true]:bg-accent-soft aria-[current=true]:text-ink"
                >
                  <Image
                    src={flagUrl(LOCALE_INFO[entry].flag)}
                    alt=""
                    width={21}
                    height={14}
                    unoptimized
                    className="h-3.5 w-[21px] shrink-0 rounded-[3px] object-cover ring-1 ring-line"
                  />
                  {LOCALE_INFO[entry].name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
};

export default SettingsMenu;
