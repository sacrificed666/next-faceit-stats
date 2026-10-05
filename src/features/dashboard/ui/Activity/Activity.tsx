"use client";

import { useState } from "react";

import { activityFeed, type FeedPlayer } from "@/features/dashboard/model/activity";
import { mapName } from "@/features/squad/model/maps";
import { members, playerById, type PlayerView } from "@/features/squad/model/squad";
import type { Player } from "@/features/squad/model/types";
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

const Line = ({ entry, player }: { entry: FeedPlayer; player: Player }) => {
  const { t, format } = useI18n();
  const { match } = entry;
  const kda = { kills: match.kills, deaths: match.deaths, assists: match.assists };
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-1">
      <PlayerName player={player} size={24} className="sm:w-48" />
      <span className="flex items-center gap-3 text-xs text-ink-secondary tabular-nums">
        <span>
          <span aria-hidden="true">{t("activity.kda", kda)}</span>
          <span className="sr-only">{t("activity.kdaSpoken", kda)}</span>
        </span>
        <span>
          <span className="text-ink-muted">{`${t("metric.kd")} `}</span>
          <span className="font-semibold text-ink">{format.decimal(match.kd, 2)}</span>
        </span>
        <span>
          <span className="text-ink-muted">{`${t("metric.adr")} `}</span>
          <span className="font-semibold text-ink">{format.decimal(match.adr, 1)}</span>
        </span>
      </span>
    </li>
  );
};

interface ActivityProps {
  views: readonly PlayerView[];
}

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
          <ol className="flex flex-col gap-3">
            {shown.map((entry) => {
              const rivals = entry.sides.length > 1;
              const squadSize = entry.sides.reduce((sum, side) => sum + side.players.length, 0);
              return (
                <li
                  key={entry.matchId}
                  className="panel grid gap-3 p-4 sm:grid-cols-[10rem_minmax(0,1fr)_auto] sm:items-start sm:gap-5"
                >
                  <div className="flex items-start justify-between gap-3 sm:flex-col sm:justify-start sm:gap-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-ink">{mapName(entry.map)}</span>
                      <RelativeTime timestamp={entry.finishedAt} className="text-xs text-ink-muted" />
                    </div>
                    {rivals || squadSize > 1 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[0.6875rem] font-bold text-accent-text">
                        <Icon name={rivals ? "swap" : "users"} size={12} />
                        {t(rivals ? "activity.squadVsSquad" : "activity.together")}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-w-0 flex-col gap-3">
                    {entry.sides.map((side) => (
                      <div
                        key={String(side.won)}
                        className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:gap-4"
                      >
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
                  <ExternalLink
                    href={faceitMatchUrl(entry.matchId)}
                    label={t("activity.roomFor", { map: mapName(entry.map) })}
                    className="justify-self-start rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-accent-text sm:justify-self-end"
                  />
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
