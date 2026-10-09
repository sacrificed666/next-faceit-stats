"use client";

import Link from "next/link";

import { METRICS, type MetricKey } from "@/features/squad/model/metrics";
import type { PlayerView } from "@/features/squad/model/squad";
import { useRange, withRange } from "@/features/squad/model/useRange";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import LevelProgress from "@/features/squad/ui/LevelProgress/LevelProgress";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import { FormGuide } from "@/features/squad/ui/ResultBadge/ResultBadge";
import { rich } from "@/shared/i18n/rich";
import { useI18n } from "@/shared/i18n/useI18n";
import { fitGrid } from "@/shared/lib/fitGrid";
import { playerPath } from "@/shared/lib/urls";
import Avatar from "@/shared/ui/Avatar/Avatar";
import CountryFlag from "@/shared/ui/CountryFlag/CountryFlag";
import RelativeTime from "@/shared/ui/RelativeTime/RelativeTime";
import Section from "@/shared/ui/Section/Section";

const CARD_METRICS: readonly MetricKey[] = ["rating", "kd", "adr", "winRate"];

interface RosterProps {
  views: readonly PlayerView[];
}

// A card for every player, highest ELO first, with form numbers for the range
const Roster = ({ views }: RosterProps) => {
  const { locale, t, format } = useI18n();
  const range = useRange();
  const ordered = views.toSorted((a, b) => b.player.elo - a.player.elo);
  const grid = fitGrid(ordered.length, { sm: [2], md: [2, 3], lg: [3, 4], xl: [4, 5] });
  return (
    <Section id="players" title={t("roster.title")} description={t("roster.description")}>
      <ul className="fit-grid gap-3 sm:gap-4" style={grid.list}>
        {ordered.map(({ player, summary, matches }, index) => {
          const latest = player.matches[0];
          return (
            <li key={player.id} className="h-full" style={grid.item(index)}>
              <article className="panel group relative isolate flex h-full flex-col overflow-hidden transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong reduced:hover:translate-y-0 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent">
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={player.avatar} name={player.nickname} size={44} />
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
                  </div>
                  {/* The level sits by its ELO, leaving the name room on narrow cards */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-baseline gap-1.5">
                        <span className="text-xl font-extrabold tracking-tight text-ink">
                          {format.integer(player.elo)}
                        </span>
                        <span className="text-xs font-semibold text-ink-muted">{t("metric.elo")}</span>
                      </p>
                      <LevelBadge level={player.level} size={30} />
                    </div>
                    <LevelProgress elo={player.elo} />
                  </div>
                  <dl className="grid grid-cols-4 gap-1 rounded-xl bg-inset px-1 py-1.5 text-center">
                    {CARD_METRICS.map((key) => (
                      <div key={key} className="min-w-0">
                        <dt className="truncate text-[0.6875rem] font-semibold text-ink-muted">
                          {t(METRICS[key].label)}
                        </dt>
                        <dd className="text-sm font-bold text-ink">
                          {summary.matches ? (
                            <MetricValue metric={key} value={summary[key]} digits={key === "winRate" ? 0 : undefined} />
                          ) : (
                            "-"
                          )}
                        </dd>
                      </div>
                    ))}
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
};

export default Roster;
