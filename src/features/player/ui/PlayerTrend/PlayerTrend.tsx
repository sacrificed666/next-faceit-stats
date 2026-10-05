"use client";

import { useState } from "react";

import { mapName } from "@/features/squad/model/maps";
import {
  formatMetric,
  MATCH_METRIC_KEYS,
  METRICS,
  type MatchMetricKey,
  type MetricKey,
} from "@/features/squad/model/metrics";
import { ROLLING_WINDOW, trendSeries, type PlayerView } from "@/features/squad/model/squad";
import { useTimeZone } from "@/shared/hooks/useClient";
import { useI18n } from "@/shared/i18n/useI18n";
import { niceScale } from "@/shared/lib/scale";
import DataTable from "@/shared/ui/DataTable/DataTable";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import LineChart, { ChartLegend } from "@/shared/ui/LineChart/LineChart";
import LocalDate from "@/shared/ui/LocalDate/LocalDate";
import Section from "@/shared/ui/Section/Section";
import SegmentedControl from "@/shared/ui/SegmentedControl/SegmentedControl";

interface PlayerTrendProps {
  view: PlayerView;
  averages: Readonly<Record<MetricKey, number>>;
}

const PlayerTrend = ({ view, averages }: PlayerTrendProps) => {
  const { t, format } = useI18n();
  const [metric, setMetric] = useState<MatchMetricKey>("kd");
  const timeZone = useTimeZone();
  const definition = METRICS[metric];
  const trend = trendSeries(view.matches, metric);
  const average = averages[metric];
  const scale = niceScale([...trend.perMatch, average], 4);
  const show = (value: number) => formatMetric(format, metric, value);
  const rolling = t("trends.rolling", { count: ROLLING_WINDOW });
  const options = MATCH_METRIC_KEYS.map((key) => ({
    value: key,
    label: t(METRICS[key].label),
    title: t(METRICS[key].name),
  }));
  const series = [
    { id: "match", label: t("trends.perMatch"), tone: "context" as const, values: trend.perMatch },
    { id: "rolling", label: rolling, tone: "data" as const, values: trend.rolling },
  ];
  const result = (won: boolean, score: string) =>
    t("result.score", { result: t(won ? "result.win" : "result.loss"), score });

  return (
    <Section
      id="trend"
      title={t("trend.title")}
      description={t("trend.description", { metric: t(definition.name) })}
      actions={<SegmentedControl label={t("trend.metric")} options={options} value={metric} onChange={setMetric} />}
    >
      <div className="panel flex flex-col gap-4 p-4 sm:p-6">
        {trend.matches.length === 0 ? (
          <EmptyState icon="chart" title={t("empty.range")} />
        ) : (
          <>
            <ChartLegend series={series} reference={t("trends.squadAverageValue", { value: show(average) })} />
            <LineChart
              label={t("trends.chart", { metric: t(definition.name), player: view.player.nickname })}
              height={260}
              scale={scale}
              format={show}
              reference={{ value: average, label: t("trends.squadAverage") }}
              points={trend.matches.map((match) => ({
                key: match.id,
                timestamp: match.finishedAt,
                label: format.date(match.finishedAt, timeZone),
                detail: `${mapName(match.map)} · ${result(match.won, `${match.teamScore}:${match.opponentScore}`)}`,
              }))}
              series={series}
            />
            <DataTable
              caption={t("trend.caption", { metric: t(definition.name), player: view.player.nickname })}
              columns={[t("trend.date"), t("trend.map"), t("trend.result"), t(definition.label), rolling]}
              rows={trend.matches.map((match, index) => ({
                key: match.id,
                header: <LocalDate timestamp={match.finishedAt} />,
                cells: [
                  mapName(match.map),
                  result(match.won, `${match.teamScore}:${match.opponentScore}`),
                  show(trend.perMatch[index] ?? 0),
                  show(trend.rolling[index] ?? 0),
                ],
              }))}
            />
          </>
        )}
      </div>
    </Section>
  );
};

export default PlayerTrend;
