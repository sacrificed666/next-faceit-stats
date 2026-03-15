import { MAP_NAMES, VALID_MAPS } from "./maps";
import type {
  FaceitMatchStatsRaw,
  ProcessedMatch,
  AggregatedStats,
  MetricKey,
} from "@/types/faceit";

const GAME_MODE_5V5 = "5v5";

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Converts a single raw FACEIT match stats object into a processed match.
 * Returns `null` if the match is not 5v5 or on an unrecognized map.
 */
export function processMatch(raw: FaceitMatchStatsRaw): ProcessedMatch | null {
  if (raw["Game Mode"] !== GAME_MODE_5V5) return null;

  const mapKey = raw["Map"];
  if (!VALID_MAPS.includes(mapKey)) return null;

  return {
    matchId: raw["Match Id"],
    finishedAt: raw["Match Finished At"],
    date: formatDate(raw["Match Finished At"]),
    map: MAP_NAMES[mapKey],
    mapKey,
    kills: parseInt(raw["Kills"]) || 0,
    deaths: parseInt(raw["Deaths"]) || 0,
    assists: parseInt(raw["Assists"]) || 0,
    kd: parseFloat(raw["K/D Ratio"]) || 0,
    kr: parseFloat(raw["K/R Ratio"]) || 0,
    adr: parseFloat(raw["ADR"]) || 0,
    hsPercent: parseFloat(raw["Headshots %"]) || 0,
    result: raw["Result"] === "1",
    score: raw["Score"].replace(" / ", " : "),
    rounds: parseInt(raw["Rounds"]) || 0,
    tripleKills: parseInt(raw["Triple Kills"]) || 0,
    quadroKills: parseInt(raw["Quadro Kills"]) || 0,
    pentaKills: parseInt(raw["Penta Kills"]) || 0,
    mvps: parseInt(raw["MVPs"]) || 0,
    firstHalfScore: parseInt(raw["First Half Score"]) || 0,
    secondHalfScore: parseInt(raw["Second Half Score"]) || 0,
    overtimeScore: parseInt(raw["Overtime score"]) || 0,
  };
}

/**
 * Processes an array of raw FACEIT stat items into deduplicated, sorted matches.
 * Filters to 5v5 mode and valid maps, removes duplicates, and sorts newest-first.
 */
export function processMatches(items: Array<{ stats: FaceitMatchStatsRaw }>): ProcessedMatch[] {
  const processed = items
    .map((item) => processMatch(item.stats))
    .filter((m): m is ProcessedMatch => m !== null);

  const seen = new Set<string>();
  const unique = processed.filter((m) => {
    if (seen.has(m.matchId)) return false;
    seen.add(m.matchId);
    return true;
  });

  return unique.sort((a, b) => b.finishedAt - a.finishedAt);
}

/** Computes aggregate statistics for a set of processed matches. */
export function aggregateStats(matches: ProcessedMatch[]): AggregatedStats {
  if (matches.length === 0) {
    return {
      avgKd: 0,
      avgKr: 0,
      avgAdr: 0,
      avgHsPercent: 0,
      winPercent: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      totalMatches: 0,
    };
  }

  const n = matches.length;
  const wins = matches.filter((m) => m.result).length;

  return {
    avgKd: matches.reduce((s, m) => s + m.kd, 0) / n,
    avgKr: matches.reduce((s, m) => s + m.kr, 0) / n,
    avgAdr: matches.reduce((s, m) => s + m.adr, 0) / n,
    avgHsPercent: matches.reduce((s, m) => s + m.hsPercent, 0) / n,
    winPercent: (wins / n) * 100,
    avgKills: matches.reduce((s, m) => s + m.kills, 0) / n,
    avgDeaths: matches.reduce((s, m) => s + m.deaths, 0) / n,
    avgAssists: matches.reduce((s, m) => s + m.assists, 0) / n,
    totalMatches: n,
  };
}

/**
 * Ranks values from highest to lowest, assigning shared ranks for ties.
 * Returns a Map from key → rank (1-based).
 */
export function computeRankings(
  values: Array<{ key: string; value: number }>,
): Map<string, number> {
  const sorted = [...values].sort((a, b) => b.value - a.value);
  const rankings = new Map<string, number>();

  let currentRank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].value < sorted[i - 1].value) {
      currentRank = i + 1;
    }
    rankings.set(sorted[i].key, currentRank);
  }

  return rankings;
}

/** Extracts the value of a metric from aggregated stats. */
export function getStatValue(stats: AggregatedStats, key: MetricKey): number {
  switch (key) {
    case "kd":
      return stats.avgKd;
    case "kr":
      return stats.avgKr;
    case "adr":
      return stats.avgAdr;
    case "hsPercent":
      return stats.avgHsPercent;
    case "winPercent":
      return stats.winPercent;
  }
}

/** Extracts the value of a metric from a single match. */
export function getMatchMetricValue(match: ProcessedMatch, key: MetricKey): number {
  switch (key) {
    case "kd":
      return match.kd;
    case "kr":
      return match.kr;
    case "adr":
      return match.adr;
    case "hsPercent":
      return match.hsPercent;
    case "winPercent":
      return 0;
  }
}
