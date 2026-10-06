"use client";

import { useState } from "react";

import type { SquadMate } from "@/features/player/model/profile";
import { mapName } from "@/features/squad/model/maps";
import type { MatchMetricKey } from "@/features/squad/model/metrics";
import type { PlayerView } from "@/features/squad/model/squad";
import type { Match } from "@/features/squad/model/types";
import MapThumb from "@/features/squad/ui/MapThumb/MapThumb";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import ResultBadge from "@/features/squad/ui/ResultBadge/ResultBadge";
import { compareBy, useSort } from "@/shared/hooks/useSort";
import type { MessageKey, Translate } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import { faceitMatchUrl } from "@/shared/lib/urls";
import Avatar from "@/shared/ui/Avatar/Avatar";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import ExternalLink from "@/shared/ui/ExternalLink/ExternalLink";
import LocalDate from "@/shared/ui/LocalDate/LocalDate";
import Section from "@/shared/ui/Section/Section";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";
import SortHeader from "@/shared/ui/SortHeader/SortHeader";

type ResultFilter = "all" | "wins" | "losses";
type SortKey = "date" | "kills" | MatchMetricKey;

const RESULTS: ReadonlyArray<{ value: ResultFilter; label: MessageKey }> = [
  { value: "all", label: "history.all" },
  { value: "wins", label: "history.wins" },
  { value: "losses", label: "history.losses" },
];

const COLUMNS: ReadonlyArray<{
  key: Exclude<SortKey, "date">;
  label: MessageKey;
  title: MessageKey;
  digits?: number;
}> = [
  { key: "rating", label: "metric.rating", title: "metric.rating.name" },
  { key: "kills", label: "metric.kills", title: "metric.kills.name" },
  { key: "kd", label: "metric.kd", title: "metric.kd.name" },
  { key: "kr", label: "metric.kr", title: "metric.kr.name" },
  { key: "adr", label: "metric.adr", title: "metric.adr.name" },
  { key: "hsPercent", label: "metric.hsPercent", title: "metric.hsPercent.name", digits: 0 },
];

// The number a column sorts by
const sortValue = (match: Match, key: SortKey): number => (key === "date" ? match.finishedAt : match[key]);

// Badges for the aces, 4K and 3K rounds of one match
const multiKills = (match: Match, t: Translate): string[] => {
  const badges: string[] = [];
  if (match.pentaKills > 0) {
    badges.push(match.pentaKills > 1 ? t("history.aces", { count: match.pentaKills }) : t("history.ace"));
  }
  if (match.quadroKills > 0) badges.push(t("history.quadra", { count: match.quadroKills }));
  if (match.tripleKills > 0) badges.push(t("history.triple", { count: match.tripleKills }));
  return badges;
};

interface MatchHistoryProps {
  view: PlayerView;
  squad: ReadonlyMap<string, SquadMate>;
  mates: ReadonlyMap<string, readonly string[]>;
}

// Every match in the range as a sortable table, filtered by result and map
const MatchHistory = ({ view, squad, mates }: MatchHistoryProps) => {
  const { t, format } = useI18n();
  const [result, setResult] = useState<ResultFilter>("all");
  const [map, setMap] = useState("all");
  const { sort, toggle } = useSort<SortKey>("date");
  const maps = [...new Set(view.matches.map((match) => match.map))].toSorted((a, b) =>
    mapName(a).localeCompare(mapName(b)),
  );
  const selectedMap = maps.includes(map) ? map : "all";
  const rows = view.matches
    .filter((match) => (result === "all" ? true : result === "wins" ? match.won : !match.won))
    .filter((match) => selectedMap === "all" || match.map === selectedMap)
    .toSorted(compareBy((match) => sortValue(match, sort.key), sort.direction));
  const options = RESULTS.map((entry) => ({ value: entry.value, label: t(entry.label) }));

  return (
    <Section
      id="matches"
      title={t("history.title")}
      description={t("history.description")}
      actions={
        <>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink-secondary">
            <span className="sr-only">{t("history.map")}</span>
            <select
              value={selectedMap}
              onChange={(event) => setMap(event.target.value)}
              className="rounded-full border border-line bg-inset py-1.5 pr-8 pl-3 text-sm font-semibold text-ink"
            >
              <option value="all">{t("history.allMaps")}</option>
              {maps.map((entry) => (
                <option key={entry} value={entry}>
                  {mapName(entry)}
                </option>
              ))}
            </select>
          </label>
          <SegmentedControl label={t("history.result")} options={options} value={result} onChange={setResult} />
        </>
      }
    >
      <div className="panel scrollbar-thin relative overflow-x-auto">
        {rows.length === 0 ? (
          <EmptyState icon="list" title={t("history.empty")} />
        ) : (
          <table className="w-full min-w-[64rem] text-sm">
            <caption className="sr-only">
              {t("history.caption", {
                player: view.player.nickname,
                matches: t("count.matches", { count: rows.length }),
              })}
            </caption>
            <thead className="border-b border-line">
              <tr>
                <SortHeader
                  label={t("history.date")}
                  align="left"
                  active={sort.key === "date"}
                  direction={sort.direction}
                  onSort={() => toggle("date")}
                  className="sticky left-0 z-10 bg-surface"
                />
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">
                  {t("history.result")}
                </th>
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-ink-muted">
                  <abbr title={t("history.kdaName")} className="no-underline">
                    {t("history.kda")}
                  </abbr>
                </th>
                {COLUMNS.map((column) => (
                  <SortHeader
                    key={column.key}
                    label={t(column.label)}
                    title={t(column.title)}
                    active={sort.key === column.key}
                    direction={sort.direction}
                    onSort={() => toggle(column.key)}
                  />
                ))}
                <th scope="col" className="px-3 py-2.5 text-left text-xs font-semibold text-ink-muted">
                  {t("history.highlights")}
                </th>
                <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-ink-muted">
                  <span className="sr-only">{t("history.links")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((match) => {
                const team = (mates.get(match.id) ?? []).flatMap((id) => {
                  const mate = squad.get(id);
                  return mate ? [mate] : [];
                });
                const together =
                  team.length > 0 ? t("history.with", { names: format.list(team.map((mate) => mate.nickname)) }) : "";
                return (
                  <tr key={match.id} className="group border-b border-line last:border-b-0 hover:bg-hover">
                    <th
                      scope="row"
                      className="sticky left-0 z-10 bg-surface px-3 py-2.5 text-left font-normal group-hover:bg-[color-mix(in_oklab,var(--surface),var(--ink)_4%)]"
                    >
                      <span className="flex items-center gap-3">
                        <MapThumb map={match.map} />
                        <span className="flex flex-col">
                          <span className="font-semibold text-ink">{mapName(match.map)}</span>
                          <LocalDate
                            timestamp={match.finishedAt}
                            format="datetime"
                            className="text-xs whitespace-nowrap text-ink-muted"
                          />
                        </span>
                      </span>
                    </th>
                    <td className="px-3 py-2.5">
                      <span className="flex items-center gap-2">
                        <ResultBadge won={match.won} score={`${match.teamScore}:${match.opponentScore}`} />
                        {team.length > 0 ? (
                          <span className="flex -space-x-1.5" title={together}>
                            {team.map((mate) => (
                              <Avatar
                                key={mate.id}
                                src={mate.avatar}
                                name={mate.nickname}
                                size={22}
                                className="ring-2 ring-surface"
                              />
                            ))}
                            <span className="sr-only">{together}</span>
                          </span>
                        ) : null}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap text-ink-secondary">
                      {`${match.kills}-${match.deaths}-${match.assists}`}
                    </td>
                    {COLUMNS.map((column) => (
                      <td
                        key={column.key}
                        className={`px-3 py-2.5 text-right font-semibold ${sort.key === column.key ? "text-ink" : "text-ink-secondary"}`}
                      >
                        {column.key === "kills" ? (
                          format.integer(match.kills)
                        ) : (
                          <MetricValue metric={column.key} value={match[column.key]} digits={column.digits} />
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <span className="flex flex-wrap gap-1">
                        {match.mvps > 0 ? (
                          <span className="rounded-md bg-inset px-1.5 py-0.5 text-[0.6875rem] font-bold text-ink-secondary">
                            {t("history.mvps", { count: match.mvps })}
                          </span>
                        ) : null}
                        {multiKills(match, t).map((badge) => (
                          <span
                            key={badge}
                            className="rounded-md bg-accent-soft px-1.5 py-0.5 text-[0.6875rem] font-bold text-accent-text"
                          >
                            {badge}
                          </span>
                        ))}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <ExternalLink
                        href={faceitMatchUrl(match.id)}
                        label={t("activity.roomFor", { map: mapName(match.map) })}
                        className="rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-accent-text"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </Section>
  );
};

export default MatchHistory;
