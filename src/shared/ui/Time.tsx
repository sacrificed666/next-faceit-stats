"use client";

import { useNow, useTimeZone } from "@/shared/hooks/useClient";
import { useI18n } from "@/shared/i18n/useI18n";
import type { DateStyle } from "@/shared/lib/format";

interface LocalDateProps {
  timestamp: number;
  format?: DateStyle;
  className?: string;
}

export function LocalDate({ timestamp, format: style = "date", className }: LocalDateProps) {
  const { format } = useI18n();
  const timeZone = useTimeZone();
  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      data-format={style}
      className={className}
      suppressHydrationWarning
    >
      {format.date(timestamp, timeZone, style)}
    </time>
  );
}

interface RelativeTimeProps {
  timestamp: number;
  className?: string;
}

export function RelativeTime({ timestamp, className }: RelativeTimeProps) {
  const { format } = useI18n();
  const now = useNow();
  const timeZone = useTimeZone();
  const absolute = format.date(timestamp, timeZone, "datetime");
  return (
    <time
      dateTime={new Date(timestamp).toISOString()}
      data-format="relative"
      title={absolute}
      className={className}
      suppressHydrationWarning
    >
      {now === null ? absolute : format.relative(timestamp, now)}
    </time>
  );
}
