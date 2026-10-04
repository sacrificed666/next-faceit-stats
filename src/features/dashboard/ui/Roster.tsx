"use client";

import Link from "next/link";

import type { PlayerView } from "@/features/squad/model/squad";
import { useRange, withRange } from "@/features/squad/model/useRange";
import { LevelBadge } from "@/features/squad/ui/LevelBadge";
import { LevelProgress } from "@/features/squad/ui/LevelProgress";
import { FormGuide } from "@/features/squad/ui/ResultBadge";
import { rich } from "@/shared/i18n/rich";
import { useI18n } from "@/shared/i18n/useI18n";
import { playerPath } from "@/shared/lib/urls";
import { Avatar } from "@/shared/ui/Avatar";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { Section } from "@/shared/ui/Section";
import { RelativeTime } from "@/shared/ui/Time";

interface RosterProps {
  views: readonly PlayerView[];
}

export function Roster({ views }: RosterProps) {
  const { locale, t, format } = useI18n();
  const range = useRange();
  const ordered = views.toSorted((a, b) => b.player.elo - a.player.elo);
  return (
    <Section id="players" title={t("roster.title")} description={t("roster.description")}>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {ordered.map(({ player, summary, matches }) => {
          const latest = player.matches[0];
          return (
            <li key={player.id} className="h-full">
              <article className="panel group relative isolate flex h-full flex-col overflow-hidden transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent">
                <div className="flex flex-1 flex-col gap-4 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={player.avatar} name={player.nickname} size={52} />
                    <div className="min-w-0 flex-1">
                      <h3 className="flex min-w-0 items-center gap-1.5 text-base font-bold text-ink">
                        <Link
                          href={withRange(playerPath(locale, player.nickname), range)}
                          className="truncate after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                        >
                          {player.nickname}
                        </Link>
                        {player.country ? <CountryFlag code={player.country} size={12} /> : null}
                      </h3>
                      <p className="truncate text-xs text-ink-muted">
                        {player.regionRank && player.region
                          ? t("roster.regionRank", { rank: format.integer(player.regionRank), region: player.region })
                          : (player.region ?? "FACEIT")}
                      </p>
                    </div>
                    <LevelBadge level={player.level} size={38} />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-extrabold tracking-tight text-ink">
                        {format.integer(player.elo)}
                      </span>
                      <span className="text-xs font-semibold text-ink-muted">{t("metric.elo")}</span>
                    </p>
                    <LevelProgress elo={player.elo} />
                  </div>
                  <dl className="grid grid-cols-3 gap-2 rounded-xl bg-inset p-2 text-center">
                    <div>
                      <dt className="text-[0.6875rem] font-semibold text-ink-muted">{t("metric.kd")}</dt>
                      <dd className="text-sm font-bold text-ink">
                        {summary.matches ? format.decimal(summary.kd, 2) : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.6875rem] font-semibold text-ink-muted">{t("metric.adr")}</dt>
                      <dd className="text-sm font-bold text-ink">
                        {summary.matches ? format.decimal(summary.adr, 1) : "-"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.6875rem] font-semibold text-ink-muted">{t("metric.winRate")}</dt>
                      <dd className="text-sm font-bold text-ink">
                        {summary.matches ? format.percent(summary.winRate, 0) : "-"}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                    <FormGuide matches={matches.slice(0, 5)} />
                    {latest ? (
                      <span className="text-xs text-ink-muted">
                        {rich(t("roster.played"), { time: <RelativeTime timestamp={latest.finishedAt} /> })}
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
