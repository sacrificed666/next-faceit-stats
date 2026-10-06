"use client";

import { useState } from "react";

import { activityFeed, type FeedPlayer } from "@/features/dashboard/model/activity";
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

// One squad member's line in a match: K-D-A, rating, K/D and ADR
const Line = ({ entry, player }: { entry: FeedPlayer; player: Player }) => {
  const { t } = useI18n();
  const { match } = entry;
  const kda = { kills: match.kills, deaths: match.deaths, assists: match.assists };
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-1">
      <PlayerName player={player} size={24} className="sm:w-44" />
      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-secondary tabular-nums sm:gap-x-4">
        <span className="sm:w-16">
          <span aria-hidden="true">{t("activity.kda", kda)}</span>
          <span className="sr-only">{t("activity.kdaSpoken", kda)}</span>
        </span>
        {(["rating", "kd", "adr"] as const).map((key) => (
          <span key={key} className="font-semibold text-ink">
            <span className="font-normal text-ink-muted">{`${t(METRICS[key].label)} `}</span>
            <MetricValue metric={key} value={match[key]} />
          </span>
        ))}
      </span>
    </li>
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
          <ol className="panel flex flex-col divide-y divide-line">
            {shown.map((entry) => {
              const rivals = entry.sides.length > 1;
              const squadSize = entry.sides.reduce((sum, side) => sum + side.players.length, 0);
              return (
                <li
                  key={entry.matchId}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 px-4 py-3 sm:grid-cols-[13rem_minmax(0,1fr)_auto] sm:gap-x-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <MapThumb map={entry.map} size="md" />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-bold text-ink">{mapName(entry.map)}</span>
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <RelativeTime timestamp={entry.finishedAt} className="text-xs text-ink-muted" />
                        {rivals || squadSize > 1 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-px text-[0.6875rem] font-bold text-accent-text">
                            <Icon name={rivals ? "swap" : "users"} size={11} />
                            {t(rivals ? "activity.squadVsSquad" : "activity.together")}
                          </span>
                        ) : null}
                      </span>
                    </div>
                  </div>
                  <ExternalLink
                    href={faceitMatchUrl(entry.matchId)}
                    label={t("activity.roomFor", { map: mapName(entry.map) })}
                    className="justify-self-end rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-accent-text sm:order-last"
                  />
                  <div className="col-span-2 flex min-w-0 flex-col gap-2 sm:col-span-1">
                    {entry.sides.map((side) => (
                      <div key={String(side.won)} className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
                        <span className="shrink-0 sm:w-20">
                          <ResultBadge won={side.won} score={`${side.teamScore}:${side.opponentScore}`} />
                        </span>
                        <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
                          {side.players.map((feedPlayer) => {
                            const player = players.get(feedPlayer.playerId);
                            return player ? (
                              <Line key={feedPlayer.playerId} entry={feedPlayer} player={player} />
                            ) : null;
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              );
            })}
          </ol>
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
