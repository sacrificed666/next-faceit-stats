/** Stat keys that render as percentages. */
const PERCENT_KEYS = new Set(["winPercent", "hsPercent", "avgHsPercent"]);

/** Stat keys that render with one decimal place. */
const SINGLE_DECIMAL_KEYS = new Set(["adr", "avgAdr"]);

/**
 * Formats a numeric stat value for display.
 *
 * - Percentage keys (`winPercent`, `hsPercent`, `avgHsPercent`) → `"X.X%"`
 * - ADR keys (`adr`, `avgAdr`) → `"X.X"`
 * - Everything else → `"X.XX"`
 */
export function formatStat(value: number, key: string): string {
  if (PERCENT_KEYS.has(key)) return `${value.toFixed(1)}%`;
  if (SINGLE_DECIMAL_KEYS.has(key)) return value.toFixed(1);
  return value.toFixed(2);
}
