"use client";

import { useId } from "react";

import { useI18n } from "@/shared/i18n/useI18n";

interface MeterProps {
  label: string;
  value: number | null;
  display: string;
  max?: number;
  hint?: string;
}

const Meter = ({ label, value, display, max = 100, hint }: MeterProps) => {
  const id = useId();
  const { t } = useI18n();
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm text-ink-secondary">
          {label}
        </label>
        <span aria-hidden="true" className="text-sm font-bold tabular-nums text-ink">
          {value === null ? "-" : display}
        </span>
      </div>
      <meter
        id={id}
        className="meter"
        min={0}
        max={max}
        value={Math.min(Math.max(value ?? 0, 0), max)}
        aria-valuetext={value === null ? t("lifetime.noData") : display}
      >
        {value === null ? t("lifetime.noData") : display}
      </meter>
      {hint ? <p className="text-xs text-ink-muted">{hint}</p> : null}
    </div>
  );
};

export default Meter;
