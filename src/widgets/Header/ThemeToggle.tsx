"use client";

import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import type { ThemePreference } from "@/shared/lib/theme";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { SegmentedControl } from "@/shared/ui/SegmentedControl";

import { setTheme, useTheme } from "./useTheme";

const THEMES: ReadonlyArray<{ value: ThemePreference; label: MessageKey; icon: IconName }> = [
  { value: "system", label: "nav.theme.system", icon: "monitor" },
  { value: "light", label: "nav.theme.light", icon: "sun" },
  { value: "dark", label: "nav.theme.dark", icon: "moon" },
];

export function ThemeToggle() {
  const { t } = useI18n();
  const theme = useTheme();
  const options = THEMES.map((entry) => ({
    value: entry.value,
    title: t(entry.label),
    label: (
      <span className="flex items-center">
        <Icon name={entry.icon} size={16} />
        <span className="sr-only">{t(entry.label)}</span>
      </span>
    ),
  }));
  return <SegmentedControl label={t("nav.theme")} size="sm" options={options} value={theme} onChange={setTheme} />;
}
