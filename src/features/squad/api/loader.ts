import "server-only";
import { cacheLife, cacheTag } from "next/cache";

import { missingVariables, readSquadConfig } from "@/features/squad/model/config";
import type { ApiFailure, FailedPlayer, Player, SquadSnapshot } from "@/features/squad/model/types";
import { log } from "@/shared/lib/log";

import { createFaceitClient, FaceitError, type FaceitClient } from "./client";
import { buildPlayer, parseProfile } from "./parse";

type LoadResult = { ok: true; player: Player } | { ok: false; failure: FailedPlayer; kind: ApiFailure | null };

const isUnauthorized = (error: unknown): boolean => error instanceof FaceitError && error.kind === "unauthorized";

const optional = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    return await promise;
  } catch (error) {
    if (isUnauthorized(error)) throw error;
    return null;
  }
};

const keepsLastVersion = (): boolean =>
  process.env.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build";

const reachable = async (url: string | null): Promise<string | null> => {
  if (!url) return null;
  try {
    const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(4000) });
    return response.ok ? url : null;
  } catch {
    return null;
  }
};

const loadPlayer = async (client: FaceitClient, nickname: string): Promise<LoadResult> => {
  try {
    const profile = parseProfile(await client.player(nickname));
    if (!profile) {
      log.warn("Player was not found on FACEIT", { nickname });
      return { ok: false, failure: { nickname, reason: "not-found" }, kind: null };
    }
    const [matches, lifetime, ranking] = await Promise.all([
      client.matches(profile.id),
      optional(client.lifetime(profile.id)),
      profile.region ? optional(client.ranking(profile.region, profile.id)) : Promise.resolve(null),
    ]);
    const player = buildPlayer(profile, { matches, lifetime, ranking });
    player.avatar = await reachable(player.avatar);
    return { ok: true, player };
  } catch (error) {
    if (!(error instanceof FaceitError) || isUnauthorized(error)) throw error;
    log.warn("Player could not be loaded", { nickname, kind: error.kind, status: error.status });
    return { ok: false, failure: { nickname, reason: "error" }, kind: error.kind };
  }
};

interface LoadedSquad {
  snapshot: SquadSnapshot;
  lifetime: "faceit" | "minutes";
}

const loadSquad = async (): Promise<LoadedSquad> => {
  const config = readSquadConfig();
  const missing = missingVariables(config);
  if (!config.apiKey || missing.length > 0)
    return { snapshot: { status: "unconfigured", missing }, lifetime: "minutes" };

  const client = createFaceitClient(config.apiKey);
  try {
    const results = await Promise.all(config.nicknames.map((nickname) => loadPlayer(client, nickname)));
    const players = results.flatMap((result) => (result.ok ? [result.player] : []));
    const failed = results.flatMap((result) => (result.ok ? [] : [result.failure]));
    const failure = results.find((result) => !result.ok && result.kind !== null);

    if (players.length === 0 && failure && !failure.ok && failure.kind) {
      if (keepsLastVersion()) throw new Error(`FACEIT is ${failure.kind}, keeping the last published squad`);
      return { snapshot: { status: "unavailable", reason: failure.kind, updatedAt: Date.now() }, lifetime: "minutes" };
    }

    log.info("Squad loaded", { players: players.length, failed: failed.length });
    return {
      snapshot: { status: "ready", players, failed, updatedAt: Date.now() },
      lifetime: failure ? "minutes" : "faceit",
    };
  } catch (error) {
    if (!(error instanceof FaceitError) || error.kind !== "unauthorized") throw error;
    log.error("FACEIT rejected the API key", { status: error.status });
    return { snapshot: { status: "unavailable", reason: "unauthorized", updatedAt: Date.now() }, lifetime: "minutes" };
  }
};

let inFlight: Promise<LoadedSquad> | null = null;

const loadSquadOnce = (): Promise<LoadedSquad> => {
  inFlight ??= loadSquad().finally(() => {
    inFlight = null;
  });
  return inFlight;
};

export const getSquad = async (): Promise<SquadSnapshot> => {
  "use cache";
  cacheTag("squad");
  const { snapshot, lifetime } = await loadSquadOnce();
  if (lifetime === "faceit") cacheLife("faceit");
  else cacheLife("minutes");
  return snapshot;
};

export const squadNicknames = async (): Promise<string[]> => {
  const squad = await getSquad();
  if (squad.status === "ready" && squad.players.length > 0) return squad.players.map((player) => player.nickname);
  return readSquadConfig().nicknames;
};
