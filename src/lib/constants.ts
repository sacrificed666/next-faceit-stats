import type { MetricKey } from "@/types/faceit";

export interface MetricTab {
  key: MetricKey;
  label: string;
}

/** All available metric tabs (K/D, K/R, ADR, HS %, Win %). */
export const METRIC_TABS: MetricTab[] = [
  { key: "kd", label: "K/D" },
  { key: "kr", label: "K/R" },
  { key: "adr", label: "ADR" },
  { key: "hsPercent", label: "HS %" },
  { key: "winPercent", label: "Win %" },
];

/** Metric tabs excluding Win % — used for per-match trend charts. */
export const TREND_METRIC_TABS: MetricTab[] = METRIC_TABS.filter((t) => t.key !== "winPercent");

/** Sentinel rank value indicating a player is outside the top 3. */
export const UNRANKED = 99;
