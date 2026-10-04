import { mapKey } from "@/features/squad/model/maps";
import type { LifetimeStats, MapSegment, Match, Player } from "@/features/squad/model/types";

const GAME_MODE = "5v5";
const SEGMENT_TYPE = "Map";
const IMAGE_HOSTS = new Set(["distribution.faceit-cdn.net", "assets.faceit-cdn.net"]);

export interface Profile {
  id: string;
  nickname: string;
  avatar: string | null;
  country: string | null;
  elo: number;
  level: number;
  region: string | null;
  steamId: string | null;
}

function field(value: unknown, key: string): unknown {
  if (typeof value !== "object" || value === null) return undefined;
  const result: unknown = Reflect.get(value, key);
  return result;
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value.map((entry: unknown) => entry) : [];
}

function text(value: unknown): string {
  if (typeof value === "string") return value;
  return typeof value === "number" && Number.isFinite(value) ? String(value) : "";
}

function optionalNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function number(value: unknown): number {
  return optionalNumber(value) ?? 0;
}

function rate(value: unknown): number | null {
  const parsed = optionalNumber(value);
  return parsed === null ? null : parsed * 100;
}

function imageUrl(value: unknown): string | null {
  if (typeof value !== "string" || value === "") return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" && IMAGE_HOSTS.has(parsed.hostname) ? parsed.href : null;
  } catch {
    return null;
  }
}

export function parseProfile(raw: unknown): Profile | null {
  const id = text(field(raw, "player_id"));
  const nickname = text(field(raw, "nickname"));
  if (id === "" || nickname === "") return null;
  const cs2 = field(field(raw, "games"), "cs2");
  const country = text(field(raw, "country")).trim().toLowerCase();
  const steamId = text(field(raw, "steam_id_64"));
  const region = text(field(cs2, "region"));
  return {
    id,
    nickname,
    avatar: imageUrl(field(raw, "avatar")),
    country: /^[a-z]{2}$/.test(country) ? country : null,
    elo: number(field(cs2, "faceit_elo")),
    level: number(field(cs2, "skill_level")),
    region: region === "" ? null : region,
    steamId: /^\d+$/.test(steamId) ? steamId : null,
  };
}

function scores(stats: unknown, won: boolean): { teamScore: number; opponentScore: number } {
  const parts = text(field(stats, "Score"))
    .split("/")
    .flatMap((part) => {
      const value = optionalNumber(part.trim());
      return value === null ? [] : [value];
    });
  const [first = 0, second = 0] = parts;
  const teamScore =
    optionalNumber(field(stats, "Final Score")) ?? (won ? Math.max(first, second) : Math.min(first, second));
  return { teamScore, opponentScore: first === teamScore ? second : first };
}

export function parseMatch(stats: unknown): Match | null {
  const id = text(field(stats, "Match Id"));
  const finishedAt = optionalNumber(field(stats, "Match Finished At"));
  if (id === "" || finishedAt === null || text(field(stats, "Game Mode")) !== GAME_MODE) return null;
  const won = text(field(stats, "Result")) === "1";
  return {
    id,
    finishedAt,
    map: text(field(stats, "Map")) || "unknown",
    won,
    ...scores(stats, won),
    rounds: number(field(stats, "Rounds")),
    kills: number(field(stats, "Kills")),
    deaths: number(field(stats, "Deaths")),
    assists: number(field(stats, "Assists")),
    kd: number(field(stats, "K/D Ratio")),
    kr: number(field(stats, "K/R Ratio")),
    adr: number(field(stats, "ADR")),
    hsPercent: number(field(stats, "Headshots %")),
    mvps: number(field(stats, "MVPs")),
    tripleKills: number(field(stats, "Triple Kills")),
    quadroKills: number(field(stats, "Quadro Kills")),
    pentaKills: number(field(stats, "Penta Kills")),
  };
}

export function parseMatches(raw: unknown): Match[] {
  const seen = new Set<string>();
  const matches: Match[] = [];
  for (const item of list(field(raw, "items"))) {
    const match = parseMatch(field(item, "stats"));
    if (!match || seen.has(match.id)) continue;
    seen.add(match.id);
    matches.push(match);
  }
  return matches.toSorted((a, b) => b.finishedAt - a.finishedAt);
}

export function parseLifetime(raw: unknown): LifetimeStats | null {
  const stats = field(raw, "lifetime");
  if (typeof stats !== "object" || stats === null) return null;
  return {
    matches: number(field(stats, "Matches")),
    winRate: number(field(stats, "Win Rate %")),
    longestWinStreak: number(field(stats, "Longest Win Streak")),
    kd: number(field(stats, "Average K/D Ratio")),
    hsPercent: number(field(stats, "Average Headshots %")),
    adr: optionalNumber(field(stats, "ADR")),
    entryRate: rate(field(stats, "Entry Rate")),
    entrySuccessRate: rate(field(stats, "Entry Success Rate")),
    oneVsOneWinRate: rate(field(stats, "1v1 Win Rate")),
    oneVsTwoWinRate: rate(field(stats, "1v2 Win Rate")),
    flashSuccessRate: rate(field(stats, "Flash Success Rate")),
    utilityDamagePerRound: optionalNumber(field(stats, "Utility Damage per Round")),
    sniperKillRate: rate(field(stats, "Sniper Kill Rate")),
  };
}

export function parseMapSegments(raw: unknown): MapSegment[] {
  return list(field(raw, "segments"))
    .filter((segment) => text(field(segment, "type")) === SEGMENT_TYPE && text(field(segment, "mode")) === GAME_MODE)
    .flatMap((segment) => {
      const label = text(field(segment, "label"));
      const stats = field(segment, "stats");
      const matches = number(field(stats, "Matches"));
      if (label === "" || matches === 0) return [];
      return [
        {
          map: mapKey(label),
          matches,
          winRate: number(field(stats, "Win Rate %")),
          kd: number(field(stats, "Average K/D Ratio")),
          adr: optionalNumber(field(stats, "ADR")),
          hsPercent: number(field(stats, "Average Headshots %")),
          image: imageUrl(field(segment, "img_regular")) ?? imageUrl(field(segment, "img_small")),
        },
      ];
    })
    .toSorted((a, b) => b.matches - a.matches);
}

export function parseRanking(raw: unknown): number | null {
  const position = optionalNumber(field(raw, "position"));
  return position !== null && position > 0 ? position : null;
}

export interface PlayerSources {
  matches: unknown;
  lifetime: unknown;
  ranking: unknown;
}

export function buildPlayer(profile: Profile, sources: PlayerSources): Player {
  return {
    ...profile,
    regionRank: parseRanking(sources.ranking),
    lifetime: parseLifetime(sources.lifetime),
    maps: parseMapSegments(sources.lifetime),
    matches: parseMatches(sources.matches),
  };
}
