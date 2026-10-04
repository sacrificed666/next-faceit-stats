import { currentStreak, type Streak } from "./form";
import { mapName } from "./maps";
import type { MatchMetricKey, MetricKey } from "./metrics";
import { selectMatches, type Range } from "./range";
import { rank, rollingAverage, summarize, type Summary } from "./stats";
import type { SquadMember } from "./together";
import type { Match, Player } from "./types";

export interface PlayerView {
  player: Player;
  matches: Match[];
  summary: Summary;
  streak: Streak | null;
}

export interface MapCell {
  map: string;
  playerId: string;
  summary: Summary;
}

export interface MapColumn {
  map: string;
  name: string;
  matches: number;
}

export const ROLLING_WINDOW = 5;

export function viewPlayer(player: Player, range: Range, reference: number): PlayerView {
  const matches = selectMatches(player.matches, range, reference);
  return { player, matches, summary: summarize(matches), streak: currentStreak(matches) };
}

export function viewPlayers(players: readonly Player[], range: Range, reference: number): PlayerView[] {
  return players.map((player) => viewPlayer(player, range, reference));
}

export function members(views: readonly PlayerView[]): SquadMember[] {
  return views.map((view) => ({ id: view.player.id, matches: view.matches }));
}

export function active(views: readonly PlayerView[]): PlayerView[] {
  return views.filter((view) => view.summary.matches > 0);
}

export function squadAverage(views: readonly PlayerView[], key: MetricKey): number {
  const playing = active(views);
  if (playing.length === 0) return 0;
  return playing.reduce((sum, view) => sum + view.summary[key], 0) / playing.length;
}

export function averageElo(views: readonly PlayerView[]): number {
  if (views.length === 0) return 0;
  return views.reduce((sum, view) => sum + view.player.elo, 0) / views.length;
}

export function metricRanks(views: readonly PlayerView[], key: MetricKey | "elo"): Map<string, number> {
  if (key === "elo") return rank(views.map((view) => ({ id: view.player.id, value: view.player.elo })));
  return rank(active(views).map((view) => ({ id: view.player.id, value: view.summary[key] })));
}

export function mapColumns(views: readonly PlayerView[]): MapColumn[] {
  const counts = new Map<string, number>();
  for (const view of views) {
    for (const match of view.matches) counts.set(match.map, (counts.get(match.map) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([map, matches]) => ({ map, name: mapName(map), matches }))
    .toSorted((a, b) => b.matches - a.matches || a.name.localeCompare(b.name));
}

export function mapCells(view: PlayerView): Map<string, Summary> {
  const byMap = new Map<string, Match[]>();
  for (const match of view.matches) {
    const list = byMap.get(match.map) ?? [];
    list.push(match);
    byMap.set(match.map, list);
  }
  return new Map([...byMap.entries()].map(([map, matches]) => [map, summarize(matches)]));
}

export interface TrendSeries {
  perMatch: number[];
  rolling: number[];
  matches: Match[];
}

export function trendSeries(matches: readonly Match[], key: MatchMetricKey): TrendSeries {
  const chronological = matches.toReversed();
  const perMatch = chronological.map((match) => match[key]);
  return { perMatch, rolling: rollingAverage(perMatch, ROLLING_WINDOW), matches: chronological };
}

export function playerById(views: readonly PlayerView[]): Map<string, Player> {
  return new Map(views.map((view) => [view.player.id, view.player]));
}
