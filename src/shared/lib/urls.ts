import type { Locale } from "@/shared/i18n/locales";

export function homePath(locale: Locale): `/${Locale}` {
  return `/${locale}`;
}

export function playerPath(locale: Locale, nickname: string): `/${Locale}/players/${string}` {
  return `/${locale}/players/${encodeURIComponent(nickname)}`;
}

export function comparePath(locale: Locale): `/${Locale}/compare` {
  return `/${locale}/compare`;
}

export function faceitProfileUrl(nickname: string): string {
  return `https://www.faceit.com/en/players/${encodeURIComponent(nickname)}`;
}

export function faceitMatchUrl(matchId: string): string {
  return `https://www.faceit.com/en/cs2/room/${encodeURIComponent(matchId)}`;
}

export function steamProfileUrl(steamId: string): string {
  return `https://steamcommunity.com/profiles/${encodeURIComponent(steamId)}`;
}

export function flagUrl(countryCode: string): string {
  return `https://flagcdn.com/${encodeURIComponent(countryCode.toLowerCase())}.svg`;
}
