"use client";

import Link from "next/link";

import { DEFAULT_RANGE } from "@/features/squad/model/range";
import type { Player } from "@/features/squad/model/types";
import { useRange } from "@/features/squad/model/useRange";
import { LevelBadge } from "@/features/squad/ui/LevelBadge";
import { LevelProgress } from "@/features/squad/ui/LevelProgress";
import { useI18n } from "@/shared/i18n/useI18n";
import { comparePath, faceitProfileUrl, steamProfileUrl } from "@/shared/lib/urls";
import { Avatar } from "@/shared/ui/Avatar";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { ExternalLink } from "@/shared/ui/ExternalLink";
import { Icon } from "@/shared/ui/Icon";

export type HeroPlayer = Pick<
  Player,
  "nickname" | "avatar" | "country" | "elo" | "level" | "region" | "regionRank" | "steamId"
>;

interface ProfileHeroProps {
  player: HeroPlayer;
}

const BUTTON =
  "inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/80 px-3.5 py-2 text-sm font-semibold text-ink backdrop-blur transition-colors hover:border-accent hover:text-accent-text";

export function ProfileHero({ player }: ProfileHeroProps) {
  const { locale, t, format } = useI18n();
  const range = useRange();
  const compare = new URLSearchParams({ a: player.nickname });
  if (range !== DEFAULT_RANGE) compare.set("range", range);
  return (
    <header className="panel relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{ backgroundImage: "radial-gradient(48rem 18rem at 12% -6rem, var(--accent-soft), transparent 70%)" }}
      />
      <div className="flex flex-col gap-6 p-5 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar src={player.avatar} name={player.nickname} size={112} eager className="ring-4 ring-accent-soft" />
          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-xs font-bold tracking-[0.18em] text-accent-text uppercase">
              {player.region ? t("player.kickerRegion", { region: player.region }) : t("player.kicker")}
            </p>
            <h1 className="truncate text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{player.nickname}</h1>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-secondary">
              {player.country ? (
                <span className="inline-flex items-center gap-1.5">
                  <CountryFlag code={player.country} size={14} />
                  {format.country(player.country)}
                </span>
              ) : null}
              {player.regionRank && player.region ? (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="trophy" size={15} className="text-ink-muted" />
                  {t("roster.regionRank", { rank: format.integer(player.regionRank), region: player.region })}
                </span>
              ) : null}
            </p>
            <div className="mt-1 flex flex-wrap gap-2">
              <ExternalLink href={faceitProfileUrl(player.nickname)} className={BUTTON}>
                {t("player.faceit")}
              </ExternalLink>
              {player.steamId ? (
                <ExternalLink href={steamProfileUrl(player.steamId)} className={BUTTON}>
                  {t("player.steam")}
                </ExternalLink>
              ) : null}
              <Link href={`${comparePath(locale)}?${compare.toString()}`} className={BUTTON}>
                <Icon name="users" size={15} />
                {t("player.compare")}
              </Link>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-3 rounded-2xl border border-line bg-surface/85 p-4 backdrop-blur lg:w-80">
          <div className="flex items-center gap-3">
            <LevelBadge level={player.level} size={52} />
            <div>
              <p className="text-3xl leading-none font-extrabold tracking-tight text-ink">
                {format.integer(player.elo)}
              </p>
              <p className="mt-1 text-xs font-semibold text-ink-muted">
                {t("level.eloLevel", { level: player.level })}
              </p>
            </div>
          </div>
          <LevelProgress elo={player.elo} />
        </div>
      </div>
    </header>
  );
}
