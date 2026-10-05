"use client";

import { useState } from "react";

import { mapName } from "@/features/squad/model/maps";
import { formatMetric, MATCH_METRIC_KEYS, METRICS, type MatchMetricKey } from "@/features/squad/model/metrics";
import { active, ROLLING_WINDOW, squadAverage, trendSeries, type PlayerView } from "@/features/squad/model/squad";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import { useTimeZone } from "@/shared/hooks/useClient";
import { useI18n } from "@/shared/i18n/useI18n";
import { niceScale } from "@/shared/lib/scale";
import DataTable from "@/shared/ui/DataTable/DataTable";
import Delta from "@/shared/ui/Delta/Delta";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import LineChart, { ChartLegend } from "@/shared/ui/LineChart/LineChart";
import Section from "@/shared/ui/Section/Section";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

interface TrendsProps {
  views: readonly PlayerView[];
}

const Trends = ({ views }: TrendsProps) => {
  const { t, format } = useI18n();
  const [metric, setMetric] = useState<MatchMetricKey>("kd");
  const timeZone = useTimeZone();
  const definition = METRICS[metric];
  const average = squadAverage(views, metric);
  const panels = active(views).map((view) => ({ view, trend: trendSeries(view.matches, metric) }));
  const scale = niceScale(
    panels.flatMap(({ trend }) => trend.perMatch),
    3,
  );
  const show = (value: number) => formatMetric(format, metric, value);
  const rolling = t("trends.rolling", { count: ROLLING_WINDOW });
  const options = MATCH_METRIC_KEYS.map((key) => ({
    value: key,
    label: t(METRICS[key].label),
    title: t(METRICS[key].name),
  }));
  const legend = [
    { id: "match", label: t("trends.perMatch"), tone: "context" as const },
    { id: "rolling", label: rolling, tone: "data" as const },
  ];

  return (
    <Section
      id="trends"
      title={t("trends.title")}
      description={t("trends.description", { metric: t(definition.name) })}
      actions={<SegmentedControl label={t("trends.metric")} options={options} value={metric} onChange={setMetric} />}
    >
      {panels.length === 0 ? (
        <div className="panel">
          <EmptyState icon="chart" title={t("empty.range")} />
        </div>
      ) : (
        <>
          <ChartLegend series={legend} reference={t("trends.squadAverageValue", { value: show(average) })} />
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {panels.map(({ view, trend }) => (
              <li key={view.player.id} className="panel flex flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <PlayerName player={view.player} size={28} />
                  <span className="flex shrink-0 flex-col items-end">
                    <span className="text-lg leading-tight font-bold text-ink">{show(view.summary[metric])}</span>
                    <Delta
                      value={view.summary[metric] - average}
                      digits={definition.digits}
                      points={definition.percent}
                    />
                  </span>
                </div>
                <LineChart
                  label={t("trends.chart", { metric: t(definition.name), player: view.player.nickname })}
                  height={112}
                  scale={scale}
                  format={show}
                  reference={{ value: average, label: t("trends.squadAverage") }}
                  points={trend.matches.map((match) => ({
                    key: match.id,
                    timestamp: match.finishedAt,
                    label: format.date(match.finishedAt, timeZone),
                    detail: `${mapName(match.map)} · ${t("result.score", {
                      result: t(match.won ? "result.win" : "result.loss"),
                      score: `${match.teamScore}:${match.opponentScore}`,
                    })}`,
                  }))}
                  series={[
                    { id: "match", label: t("trends.match"), tone: "context", values: trend.perMatch },
                    { id: "rolling", label: rolling, tone: "data", values: trend.rolling },
                  ]}
                />
              </li>
            ))}
          </ul>
          <DataTable
            caption={t("trends.caption", { metric: t(definition.name) })}
            columns={[
              t("leaderboard.player"),
              t("trends.average"),
              t("trends.best"),
              t("trends.worst"),
              t("trends.last", { count: ROLLING_WINDOW }),
            ]}
            rows={panels.map(({ view, trend }) => ({
              key: view.player.id,
              header: view.player.nickname,
              cells: [
                show(view.summary[metric]),
                show(Math.max(...trend.perMatch)),
                show(Math.min(...trend.perMatch)),
                show(trend.rolling.at(-1) ?? 0),
              ],
            }))}
          />
        </>
      )}
    </Section>
  );
};

export default Trends;
