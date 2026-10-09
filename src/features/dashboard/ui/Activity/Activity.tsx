"use client";

import { useState } from "react";

import { activityFeed, type FeedEntry } from "@/features/dashboard/model/activity";
import { mapName } from "@/features/squad/model/maps";
import { METRICS } from "@/features/squad/model/metrics";
import { members, playerById, type PlayerView } from "@/features/squad/model/squad";
import type { Player } from "@/features/squad/model/types";
import MapThumb from "@/features/squad/ui/MapThumb/MapThumb";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import ResultBadge from "@/features/squad/ui/ResultBadge/ResultBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { faceitMatchUrl } from "@/shared/lib/urls";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";
import Icon from "@/shared/ui/Icon/Icon";
import RelativeTime from "@/shared/ui/RelativeTime/RelativeTime";
import Section from "@/shared/ui/Section/Section";

const PAGE = 8;

const STATS = ["rating", "kd", "adr"] as const;

const HEAD = "px-2 py-2.5 text-xs font-semibold text-ink-muted sm:px-3";
const CELL = "px-2 py-2 sm:px-3";

interface MatchRowsProps {
  entry: FeedEntry;
  players: ReadonlyMap<string, Player>;
}

// A match as a group of rows, one per squad member, the match cells spanning them
const MatchRows = ({ entry, players }: MatchRowsProps) => {
  const { t } = useI18n();
  const lines = entry.sides.flatMap((side) =>
    side.players.map((feedPlayer, index) => ({ side, feedPlayer, opensSide: index === 0 })),
  );
  const rivals = entry.sides.length > 1;
  return (
    <tbody className="group border-b border-line last:border-b-0 hover:bg-hover">
      {lines.map(({ side, feedPlayer, opensSide }, index) => {
        const player = players.get(feedPlayer.playerId);
        const { match } = feedPlayer;
        const kda = { kills: match.kills, deaths: match.deaths, assists: match.assists };
        return (
          <tr key={`${feedPlayer.playerId}:${String(side.won)}`}>
            {index === 0 ? (
              <th
                scope="rowgroup"
                rowSpan={lines.length}
                className={`${CELL} sticky left-0 z-10 bg-surface text-left font-normal group-hover:bg-[color-mix(in_oklab,var(--surface),var(--ink)_4%)]`}
              >
                <span className="flex items-center gap-3">
                  <MapThumb map={entry.map} size="md" className="max-sm:hidden" />
                  <span className="flex min-w-0 flex-col items-start font-semibold text-ink">
                    {mapName(entry.map)}
                    <RelativeTime
                      timestamp={entry.finishedAt}
                      className="text-xs font-normal text-ink-muted sm:whitespace-nowrap"
                    />
                    {rivals || lines.length > 1 ? (
                      <span
                        title={t(rivals ? "activity.squadVsSquad" : "activity.together")}
                        className="mt-1 inline-flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-px text-[0.6875rem] font-bold whitespace-nowrap text-accent-text max-sm:py-1"
                      >
                        <Icon name={rivals ? "swap" : "users"} size={11} />
                        {/* Phones keep the icon and leave the words to screen readers */}
                        <span className="max-sm:sr-only">
                          {t(rivals ? "activity.squadVsSquad" : "activity.together")}
                        </span>
                      </span>
                    ) : null}
                  </span>
                </span>
              </th>
            ) : null}
            {opensSide ? (
              <td rowSpan={side.players.length} className={`${CELL} max-sm:pr-0.5`}>
                <ResultBadge won={side.won} score={`${side.teamScore}:${side.opponentScore}`} />
              </td>
            ) : null}
            <th scope="row" className={`${CELL} text-left font-normal`}>
              {player ? <PlayerName player={player} size={24} /> : null}
              {/* Phones fold the numbers under the name instead of four more columns */}
              <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 pl-8 text-xs whitespace-nowrap text-ink-muted tabular-nums sm:hidden">
                <span aria-hidden="true">{t("activity.kda", kda)}</span>
                <span className="sr-only">{t("activity.kdaSpoken", kda)}</span>
                <span aria-hidden="true">·</span>
                <span>
                  {t("metric.rating")}{" "}
                  <span className="font-semibold">
                    <MetricValue metric="rating" value={match.rating} />
                  </span>
                </span>
              </span>
            </th>
            <td className={`${CELL} text-right whitespace-nowrap text-ink-secondary tabular-nums max-sm:hidden`}>
              <span aria-hidden="true">{t("activity.kda", kda)}</span>
              <span className="sr-only">{t("activity.kdaSpoken", kda)}</span>
            </td>
            {STATS.map((key) => (
              <td key={key} className={`${CELL} text-right font-semibold text-ink tabular-nums max-sm:hidden`}>
                <MetricValue metric={key} value={match[key]} />
              </td>
            ))}
            {index === 0 ? (
              <td rowSpan={lines.length} className={`${CELL} text-right max-sm:pl-0`}>
                <ExternalLink
                  href={faceitMatchUrl(entry.matchId)}
                  label={t("activity.roomFor", { map: mapName(entry.map) })}
                  className="rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-accent-text"
                />
              </td>
            ) : null}
          </tr>
        );
      })}
    </tbody>
  );
};

interface ActivityProps {
  views: readonly PlayerView[];
}

// The latest matches of the whole squad, where a shared match appears once
const Activity = ({ views }: ActivityProps) => {
  const { t } = useI18n();
  const [limit, setLimit] = useState(PAGE);
  const players = playerById(views);
  const feed = activityFeed(members(views));
  const shown = feed.slice(0, limit);

  return (
    <Section id="activity" title={t("activity.title")} description={t("activity.description")}>
      {feed.length === 0 ? (
        <div className="panel">
          <EmptyState icon="list" title={t("empty.range")} />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="panel scroll-edges scrollbar-thin relative overflow-x-auto">
            <table className="w-full text-sm sm:min-w-[48rem]">
              <caption className="sr-only">{t("activity.title")}</caption>
              <thead className="border-b border-line">
                <tr>
                  <th scope="col" className={`${HEAD} sticky left-0 z-10 bg-surface text-left`}>
                    {t("history.map")}
                  </th>
                  <th scope="col" className={`${HEAD} text-left`}>
                    {t("history.result")}
                  </th>
                  <th scope="col" className={`${HEAD} text-left`}>
                    {t("leaderboard.player")}
                  </th>
                  <th scope="col" className={`${HEAD} text-right max-sm:hidden`}>
                    <abbr title={t("history.kdaName")} className="no-underline">
                      {t("history.kda")}
                    </abbr>
                  </th>
                  {STATS.map((key) => (
                    <th key={key} scope="col" className={`${HEAD} text-right max-sm:hidden`}>
                      <abbr title={t(METRICS[key].name)} className="no-underline">
                        {t(METRICS[key].label)}
                      </abbr>
                    </th>
                  ))}
                  <th scope="col" className={HEAD}>
                    <span className="sr-only">{t("history.links")}</span>
                  </th>
                </tr>
              </thead>
              {shown.map((entry) => (
                <MatchRows key={entry.matchId} entry={entry} players={players} />
              ))}
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p aria-live="polite" className="text-sm text-ink-muted">
              {t("activity.shown", { shown: shown.length, total: feed.length })}
            </p>
            {shown.length < feed.length ? (
              <button
                type="button"
                onClick={() => setLimit((current) => current + PAGE)}
                className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent-text"
              >
                <Icon name="chevronDown" size={16} />
                {t("activity.more")}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </Section>
  );
};

export default Activity;
