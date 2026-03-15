import type { FaceitPlayerResponse, FaceitStatsResponse, PlayerData } from "@/types/faceit";
import { processMatches } from "./processing";
import { logger } from "./logger";

const FACEIT_BASE_URL = "https://open.faceit.com/data/v4/";
const REVALIDATE_SECONDS = 300;
const STATS_LIMIT = 100;

/** Fetches a player profile from the FACEIT API by nickname. */
async function fetchFaceitPlayer(nickname: string, apiKey: string): Promise<FaceitPlayerResponse> {
  const url = `${FACEIT_BASE_URL}players?nickname=${encodeURIComponent(nickname)}`;
  logger.info("Fetching player profile", { nickname });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    const msg = `Failed to fetch player "${nickname}": ${res.status}`;
    logger.error(msg, { nickname, status: res.status });
    throw new Error(msg);
  }

  return res.json();
}

/** Fetches CS2 match stats for a player from the FACEIT API. */
async function fetchFaceitStats(playerId: string, apiKey: string): Promise<FaceitStatsResponse> {
  const url = `${FACEIT_BASE_URL}players/${playerId}/games/cs2/stats?offset=0&limit=${STATS_LIMIT}`;
  logger.info("Fetching match stats", { playerId });

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    const msg = `Failed to fetch stats for ${playerId}: ${res.status}`;
    logger.error(msg, { playerId, status: res.status });
    throw new Error(msg);
  }

  return res.json();
}

/** Fetches and processes complete player data (profile + match stats). */
async function fetchPlayerData(
  nickname: string,
  apiKey: string,
  colorIndex: number,
): Promise<PlayerData> {
  const player = await fetchFaceitPlayer(nickname, apiKey);
  const stats = await fetchFaceitStats(player.player_id, apiKey);
  const matches = processMatches(stats.items);

  logger.info("Player data processed", { nickname, matchCount: matches.length });

  return {
    playerId: player.player_id,
    nickname: player.nickname,
    avatar: player.avatar || "",
    country: player.country || "",
    elo: player.games?.cs2?.faceit_elo ?? 0,
    level: player.games?.cs2?.skill_level ?? 0,
    matches,
    colorIndex,
  };
}

/**
 * Fetches data for all configured players in parallel.
 * Uses `Promise.allSettled` so one player's failure doesn't block others.
 * Throws if no players could be loaded.
 */
export async function fetchAllPlayers(): Promise<PlayerData[]> {
  const apiKey = process.env.FACEIT_API_KEY;
  const playersEnv = process.env.FACEIT_PLAYERS;

  if (!apiKey) throw new Error("FACEIT_API_KEY not configured");
  if (!playersEnv) throw new Error("FACEIT_PLAYERS not configured");

  const nicknames = playersEnv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  logger.info("Fetching all players", { count: nicknames.length });

  const results = await Promise.allSettled(
    nicknames.map((nickname, index) => fetchPlayerData(nickname, apiKey, index)),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      logger.error("Player fetch failed", { reason: String(result.reason) });
    }
  }

  const players = results
    .filter((r): r is PromiseFulfilledResult<PlayerData> => r.status === "fulfilled")
    .map((r) => r.value);

  if (players.length === 0) {
    throw new Error("Failed to fetch any player data");
  }

  logger.info("All players loaded", { loaded: players.length, total: nicknames.length });

  return players;
}
