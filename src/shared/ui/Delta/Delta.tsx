"use client";

import { useI18n } from "@/shared/i18n/useI18n";

import Icon from "../Icon/Icon";

interface DeltaProps {
  value: number;
  digits: number;
  points?: boolean;
}

const Delta = ({ value, digits, points = false }: DeltaProps) => {
  const { t, format } = useI18n();
  const rounded = Number(value.toFixed(digits));
  const direction = rounded > 0 ? "up" : rounded < 0 ? "down" : "flat";
  const tone = direction === "up" ? "text-good" : direction === "down" ? "text-bad" : "text-ink-muted";
  const number = format.signed(value, digits);
  const text = points ? t("metric.points", { value: number }) : number;
  const spoken = direction === "up" ? "delta.above" : direction === "down" ? "delta.below" : "delta.even";
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${tone}`}>
      {direction === "flat" ? null : <Icon name={direction === "up" ? "arrowUp" : "arrowDown"} size={13} />}
      <span aria-hidden="true">{text}</span>
      <span className="sr-only">{t(spoken, { value: text })}</span>
    </span>
  );
};

export default Delta;
