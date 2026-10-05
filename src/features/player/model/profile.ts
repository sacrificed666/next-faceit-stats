import { METRIC_KEYS, type MetricKey } from "@/features/squad/model/metrics";
import { RANGES, type Range } from "@/features/squad/model/range";
import { members, squadAverage, viewPlayers } from "@/features/squad/model/squad";
import { duos, lineups, teammates, type Teammate } from "@/features/squad/model/together";
import type { Player } from "@/features/squad/model/types";

export type SquadMate = Pick<Player, "id" | "nickname" | "avatar" | "country" | "elo" | "level">;

export interface RangeContext {
  range: Range;
  averages: Readonly<Record<MetricKey, number>>;
  teammates: Teammate[];
  mates: Array<[string, string[]]>;
}

export interface ProfileData {
  player: Player;
  squad: SquadMate[];
  ranges: RangeContext[];
  updatedAt: number;
}

const averages = (views: Parameters<typeof squadAverage>[0]): Record<MetricKey, number> => {
  const [kd, kr, adr, hsPercent, winRate] = METRIC_KEYS.map((key) => squadAverage(views, key));
  return { kd: kd ?? 0, kr: kr ?? 0, adr: adr ?? 0, hsPercent: hsPercent ?? 0, winRate: winRate ?? 0 };
};

const rangeContext = (players: readonly Player[], playerId: string, range: Range, updatedAt: number): RangeContext => {
  const views = viewPlayers(players, range, updatedAt);
  const lineupList = lineups(members(views));
  return {
    range,
    averages: averages(views),
    teammates: teammates(playerId, duos(lineupList)),
    mates: lineupList.flatMap((lineup) =>
      lineup.playerIds.includes(playerId) && lineup.playerIds.length > 1
        ? [[lineup.matchId, lineup.playerIds.filter((id) => id !== playerId)] satisfies [string, string[]]]
        : [],
    ),
  };
};

export const profileData = (players: readonly Player[], player: Player, updatedAt: number): ProfileData => ({
  player,
  squad: players.map(({ id, nickname, avatar, country, elo, level }) => ({
    id,
    nickname,
    avatar,
    country,
    elo,
    level,
  })),
  ranges: RANGES.map((range) => rangeContext(players, player.id, range, updatedAt)),
  updatedAt,
});

export const contextFor = (data: ProfileData, range: Range): RangeContext | undefined =>
  data.ranges.find((entry) => entry.range === range);

export const withoutDetails = (player: Player): Player => ({ ...player, lifetime: null, maps: [] });

export const withoutMaps = (player: Player): Player => ({ ...player, maps: [] });
