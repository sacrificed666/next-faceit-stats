import type { Match } from "./types";

export interface Summary {
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  kd: number;
  kr: number;
  adr: number;
  hsPercent: number;
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;
  tripleKills: number;
  quadroKills: number;
  pentaKills: number;
}

export const EMPTY_SUMMARY: Summary = {
  matches: 0,
  wins: 0,
  losses: 0,
  winRate: 0,
  kd: 0,
  kr: 0,
  adr: 0,
  hsPercent: 0,
  kills: 0,
  deaths: 0,
  assists: 0,
  mvps: 0,
  tripleKills: 0,
  quadroKills: 0,
  pentaKills: 0,
};

function average(matches: readonly Match[], pick: (match: Match) => number): number {
  return matches.reduce((sum, match) => sum + pick(match), 0) / matches.length;
}

function total(matches: readonly Match[], pick: (match: Match) => number): number {
  return matches.reduce((sum, match) => sum + pick(match), 0);
}

export function summarize(matches: readonly Match[]): Summary {
  if (matches.length === 0) return EMPTY_SUMMARY;
  const wins = matches.filter((match) => match.won).length;
  return {
    matches: matches.length,
    wins,
    losses: matches.length - wins,
    winRate: (wins / matches.length) * 100,
    kd: average(matches, (match) => match.kd),
    kr: average(matches, (match) => match.kr),
    adr: average(matches, (match) => match.adr),
    hsPercent: average(matches, (match) => match.hsPercent),
    kills: average(matches, (match) => match.kills),
    deaths: average(matches, (match) => match.deaths),
    assists: average(matches, (match) => match.assists),
    mvps: total(matches, (match) => match.mvps),
    tripleKills: total(matches, (match) => match.tripleKills),
    quadroKills: total(matches, (match) => match.quadroKills),
    pentaKills: total(matches, (match) => match.pentaKills),
  };
}

export function rank(entries: ReadonlyArray<{ id: string; value: number }>): Map<string, number> {
  const sorted = entries.toSorted((a, b) => b.value - a.value);
  const ranks = new Map<string, number>();
  let previous: number | null = null;
  let current = 0;
  sorted.forEach((entry, index) => {
    if (previous === null || entry.value < previous) current = index + 1;
    previous = entry.value;
    ranks.set(entry.id, current);
  });
  return ranks;
}

export function rollingAverage(values: readonly number[], window: number): number[] {
  const result: number[] = [];
  let sum = 0;
  values.forEach((value, index) => {
    sum += value;
    const dropped = values[index - window];
    if (dropped !== undefined) sum -= dropped;
    result.push(sum / Math.min(index + 1, window));
  });
  return result;
}
