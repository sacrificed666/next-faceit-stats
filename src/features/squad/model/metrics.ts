import type { MessageKey } from "@/shared/i18n/translate";
import type { Formatter } from "@/shared/lib/format";

export type MetricKey = "kd" | "kr" | "adr" | "hsPercent" | "winRate";

export type MatchMetricKey = Exclude<MetricKey, "winRate">;

export interface Metric {
  key: MetricKey;
  label: MessageKey;
  name: MessageKey;
  digits: number;
  percent: boolean;
}

export const METRICS: Readonly<Record<MetricKey, Metric>> = {
  kd: { key: "kd", label: "metric.kd", name: "metric.kd.name", digits: 2, percent: false },
  kr: { key: "kr", label: "metric.kr", name: "metric.kr.name", digits: 2, percent: false },
  adr: { key: "adr", label: "metric.adr", name: "metric.adr.name", digits: 1, percent: false },
  hsPercent: { key: "hsPercent", label: "metric.hsPercent", name: "metric.hsPercent.name", digits: 1, percent: true },
  winRate: { key: "winRate", label: "metric.winRate", name: "metric.winRate.name", digits: 1, percent: true },
};

export const METRIC_KEYS: readonly MetricKey[] = ["kd", "kr", "adr", "hsPercent", "winRate"];

export const MATCH_METRIC_KEYS: readonly MatchMetricKey[] = ["kd", "kr", "adr", "hsPercent"];

export const formatMetric = (format: Formatter, key: MetricKey, value: number, digits = METRICS[key].digits): string =>
  METRICS[key].percent ? format.percent(value, digits) : format.decimal(value, digits);
