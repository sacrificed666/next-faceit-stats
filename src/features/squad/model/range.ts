import type { Match } from "./types";

export const DAY_RANGES = ["7d", "30d", "90d"] as const;
export const MATCH_RANGES = ["20", "50", "100"] as const;
export const RANGES = [...DAY_RANGES, ...MATCH_RANGES] as const;

export type Range = (typeof RANGES)[number];

export const DEFAULT_RANGE: Range = "20";

const DAY = 86_400_000;

export interface RangeSpec {
  unit: "days" | "matches";
  count: number;
}

export function isRange(value: unknown): value is Range {
  return typeof value === "string" && (RANGES as readonly string[]).includes(value);
}

export function parseRange(value: string | null | undefined): Range | null {
  return isRange(value) ? value : null;
}

export function rangeSpec(range: Range): RangeSpec {
  return range.endsWith("d")
    ? { unit: "days", count: Number.parseInt(range, 10) }
    : { unit: "matches", count: Number.parseInt(range, 10) };
}

export function selectMatches(matches: readonly Match[], range: Range, reference: number): Match[] {
  const { unit, count } = rangeSpec(range);
  if (unit === "matches") return matches.slice(0, count);
  const since = reference - count * DAY;
  return matches.filter((match) => match.finishedAt >= since);
}
