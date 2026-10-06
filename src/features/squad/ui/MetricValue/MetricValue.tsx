"use client";

import { useI18n } from "@/shared/i18n/useI18n";

import { formatMetric, metricTone, type MetricKey } from "../../model/metrics";

const TONES = { good: "text-good", bad: "text-bad", even: "" } as const;

interface MetricValueProps {
  metric: MetricKey;
  value: number;
  digits?: number;
  className?: string;
}

// A metric in green when good and red when weak; the parent sets other colours
const MetricValue = ({ metric, value, digits, className = "" }: MetricValueProps) => {
  const { format } = useI18n();
  return (
    <span className={`${TONES[metricTone(metric, value)]} ${className}`.trim() || undefined}>
      {formatMetric(format, metric, value, digits)}
    </span>
  );
};

export default MetricValue;
