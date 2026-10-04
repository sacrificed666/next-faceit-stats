import type { Player } from "./types";

export function decodeNickname(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function findPlayer(players: readonly Player[], nickname: string): Player | null {
  const wanted = decodeNickname(nickname).toLowerCase();
  return players.find((player) => player.nickname.toLowerCase() === wanted) ?? null;
}
