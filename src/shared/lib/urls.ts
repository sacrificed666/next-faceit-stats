import type { Locale } from "@/shared/i18n/locales";

export const homePath = (locale: Locale): `/${Locale}` => `/${locale}`;

export const playerPath = (locale: Locale, nickname: string): `/${Locale}/players/${string}` =>
  `/${locale}/players/${encodeURIComponent(nickname)}`;

export const comparePath = (locale: Locale): `/${Locale}/compare` => `/${locale}/compare`;

export const faceitProfileUrl = (nickname: string): string => {
  return `https://www.faceit.com/en/players/${encodeURIComponent(nickname)}`;
};

export const faceitMatchUrl = (matchId: string): string => {
  return `https://www.faceit.com/en/cs2/room/${encodeURIComponent(matchId)}`;
};

export const steamProfileUrl = (steamId: string): string => {
  return `https://steamcommunity.com/profiles/${encodeURIComponent(steamId)}`;
};

export const flagUrl = (countryCode: string): string => `/flags/${encodeURIComponent(countryCode.toUpperCase())}`;
