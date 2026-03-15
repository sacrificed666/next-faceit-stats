/** Palette for distinguishing players in charts and UI. */
export const PLAYER_COLORS = [
  "#F97316",
  "#3B82F6",
  "#10B981",
  "#6366F1",
  "#EC4899",
  "#E8375D",
  "#06B6D4",
  "#F59E0B",
  "#A855F7",
  "#84CC16",
] as const;

/** Medal dot colors keyed by podium rank (1st / 2nd / 3rd). */
export const MEDAL_COLORS = {
  1: "#FFD700",
  2: "#C0C0C0",
  3: "#CD7F32",
} as const;

/** FACEIT skill level → badge color mapping. */
const LEVEL_COLORS: Record<number, string> = {
  1: "#eee",
  2: "#1CE400",
  3: "#1CE400",
  4: "#FFC800",
  5: "#FFC800",
  6: "#FFC800",
  7: "#FFC800",
  8: "#FF6309",
  9: "#FF6309",
  10: "#FF0000",
};

/** Returns the badge color for a FACEIT skill level (1–10). */
export function getLevelColor(level: number): string {
  return LEVEL_COLORS[level] ?? "#eee";
}

/** Returns the chart/UI color for a player by their assigned color index. */
export function getPlayerColor(colorIndex: number): string {
  return PLAYER_COLORS[colorIndex % PLAYER_COLORS.length];
}
