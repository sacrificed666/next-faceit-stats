"use client";

import { useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import type { PlayerWithStats, MetricKey } from "@/types/faceit";
import type { AggregatedStats } from "@/types/faceit";
import { MAP_LIST, MAP_NAMES } from "@/lib/maps";
import { getPlayerColor } from "@/lib/colors";
import { aggregateStats, getStatValue, computeRankings } from "@/lib/processing";
import { formatStat } from "@/lib/format";
import { METRIC_TABS, UNRANKED } from "@/lib/constants";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSort } from "@/hooks/useSort";
import RankedYAxisTick from "@/components/ui/RankedYAxisTick";
import MedalBadge from "@/components/ui/MedalBadge";
import SortIndicator from "@/components/ui/SortIndicator";
import CustomTooltip from "./CustomTooltip";

interface Props {
  players: PlayerWithStats[];
  range: number;
}

type TableSortCol = "matches" | "winPercent" | "kd" | "kr" | "adr" | "hsPercent";

const TABLE_COLS = [
  { key: "player" as const, label: "Player", sortable: false, width: "w-[180px]" },
  { key: "matches" as const, label: "Matches", sortable: true, width: "w-[90px]" },
  { key: "winPercent" as const, label: "Win %", sortable: true, width: "w-[100px]" },
  { key: "kd" as const, label: "Avg K/D", sortable: true, width: "w-[100px]" },
  { key: "kr" as const, label: "Avg K/R", sortable: true, width: "w-[100px]" },
  { key: "adr" as const, label: "Avg ADR", sortable: true, width: "w-[100px]" },
  { key: "hsPercent" as const, label: "Avg HS %", sortable: true, width: "w-[100px]" },
];

const RANKABLE_DATA_COLS: TableSortCol[] = [
  "matches",
  "winPercent",
  "kd",
  "kr",
  "adr",
  "hsPercent",
];

const MOBILE_SORT_OPTIONS: Array<{ key: TableSortCol; label: string }> = [
  { key: "matches", label: "Matches" },
  { key: "winPercent", label: "Win %" },
  { key: "kd", label: "K/D" },
  { key: "kr", label: "K/R" },
  { key: "adr", label: "ADR" },
  { key: "hsPercent", label: "HS %" },
];

function getColValue(stats: AggregatedStats, col: TableSortCol): number {
  if (col === "matches") return stats.totalMatches;
  return getStatValue(stats, col);
}

export default function MapStats({ players, range }: Props) {
  const [activeMap, setActiveMap] = useState(MAP_LIST[0][0]);
  const [metric, setMetric] = useState<MetricKey>("kd");
  const { sortCol, sortDir, handleSort } = useSort<TableSortCol>("kd");
  const isMobile = useIsMobile();

  const mapPlayerStats = useMemo(() => {
    const result: Record<string, Map<string, AggregatedStats>> = {};
    for (const [mapKey] of MAP_LIST) {
      const playerMap = new Map<string, AggregatedStats>();
      for (const player of players) {
        const rangeMatches = player.matches.slice(0, range);
        const mapMatches = rangeMatches.filter((m) => m.mapKey === mapKey);
        playerMap.set(player.nickname, aggregateStats(mapMatches));
      }
      result[mapKey] = playerMap;
    }
    return result;
  }, [players, range]);

  const activeMapName = MAP_NAMES[activeMap] || activeMap;
  const currentMapStats = mapPlayerStats[activeMap];

  const chartData = useMemo(() => {
    if (!currentMapStats) return [];
    const entries = players
      .map((p) => {
        const stats = currentMapStats.get(p.nickname);
        const value = stats ? getStatValue(stats, metric) : 0;
        return {
          nickname: p.nickname,
          value,
          color: getPlayerColor(p.colorIndex),
          hasData: (stats?.totalMatches ?? 0) > 0,
          formatted: formatStat(stats ? getStatValue(stats, metric) : 0, metric),
        };
      })
      .filter((d) => d.hasData);

    const rankings = computeRankings(entries.map((e) => ({ key: e.nickname, value: e.value })));

    return entries
      .map((e) => ({ ...e, rank: rankings.get(e.nickname) ?? UNRANKED }))
      .sort((a, b) => b.value - a.value);
  }, [players, currentMapStats, metric]);

  const tableData = useMemo(() => {
    if (!currentMapStats) return [];
    return [...players]
      .map((p) => ({
        ...p,
        mapStats: currentMapStats.get(p.nickname)!,
      }))
      .sort((a, b) => {
        const aVal = getColValue(a.mapStats, sortCol);
        const bVal = getColValue(b.mapStats, sortCol);
        return sortDir === "desc" ? bVal - aVal : aVal - bVal;
      });
  }, [players, currentMapStats, sortCol, sortDir]);

  const tableRankings = useMemo(() => {
    const result: Record<string, Map<string, number>> = {};
    for (const col of RANKABLE_DATA_COLS) {
      const values = tableData.map((p) => ({
        key: p.nickname,
        value: getColValue(p.mapStats, col),
      }));
      result[col] = computeRankings(values);
    }
    return result;
  }, [tableData]);

  const barHeight = isMobile ? 260 : Math.max(chartData.length * 50 + 40, 200);
  const mobileChartWidth = Math.max(chartData.length * 72, 320);

  const tooltipValueFormatter = useCallback((value: number) => formatStat(value, metric), [metric]);

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-white/6 rounded-2xl p-3 sm:p-5">
      <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2">
        <h2 className="text-white font-bold text-base sm:text-lg shrink-0">Map Stats</h2>
        <div className="min-w-0 overflow-x-auto">
          <div className="flex gap-1" role="tablist" aria-label="Map stats metric">
            {METRIC_TABS.map((opt) => (
              <button
                key={opt.key}
                role="tab"
                aria-selected={metric === opt.key}
                onClick={() => setMetric(opt.key)}
                className={`shrink-0 px-1.5 sm:px-4 py-0.5 sm:py-1.5 text-[11px] sm:text-sm rounded-md sm:rounded-lg whitespace-nowrap transition-all duration-150 ${
                  metric === opt.key
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div
        className="flex gap-0.5 sm:gap-1 overflow-x-auto pb-2 mb-3 sm:mb-4"
        role="tablist"
        aria-label="Map selection"
      >
        {MAP_LIST.map(([mapKey, mapName]) => (
          <button
            key={mapKey}
            role="tab"
            aria-selected={activeMap === mapKey}
            onClick={() => setActiveMap(mapKey)}
            className={`px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-150 whitespace-nowrap ${
              activeMap === mapKey
                ? "bg-white/12 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {mapName}
          </button>
        ))}
      </div>

      {chartData.length > 0 ? (
        isMobile ? (
          <div className="mb-6 overflow-x-auto" style={{ height: barHeight }}>
            <div style={{ width: mobileChartWidth, height: barHeight }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 8, left: 8, bottom: 20 }}>
                  <XAxis
                    dataKey="nickname"
                    type="category"
                    interval={0}
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    axisLine={{ stroke: "#333" }}
                  />
                  <YAxis
                    type="number"
                    tick={{ fill: "#9ca3af", fontSize: 10 }}
                    axisLine={{ stroke: "#333" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => (
                      <CustomTooltip
                        active={active}
                        payload={payload}
                        label={METRIC_TABS.find((o) => o.key === metric)?.label}
                        nameKey="nickname"
                        valueFormatter={tooltipValueFormatter}
                      />
                    )}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={26}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                    <LabelList dataKey="formatted" position="top" fill="#e5e7eb" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div style={{ height: barHeight }} className="mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 50 }}>
                <XAxis
                  type="number"
                  tick={{ fill: "#9ca3af", fontSize: 12 }}
                  axisLine={{ stroke: "#333" }}
                />
                <YAxis
                  dataKey="nickname"
                  type="category"
                  width={150}
                  tick={<RankedYAxisTick data={chartData} isMobile={false} />}
                  axisLine={{ stroke: "#333" }}
                />
                <Tooltip
                  content={({ active, payload }) => (
                    <CustomTooltip
                      active={active}
                      payload={payload}
                      label={METRIC_TABS.find((o) => o.key === metric)?.label}
                      nameKey="nickname"
                      valueFormatter={tooltipValueFormatter}
                    />
                  )}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={28}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                  <LabelList
                    dataKey="formatted"
                    position="right"
                    fill="#e5e7eb"
                    fontSize={12}
                    fontWeight={600}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )
      ) : (
        <div className="h-50 flex items-center justify-center text-gray-500 mb-6">
          No match data for {activeMapName}
        </div>
      )}

      <div className="sm:hidden space-y-2.5">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {MOBILE_SORT_OPTIONS.map((col) => (
            <button
              key={col.key}
              onClick={() => handleSort(col.key)}
              className={`px-1.5 py-0.5 text-[11px] rounded-md whitespace-nowrap transition-colors ${
                sortCol === col.key
                  ? "bg-primary text-white"
                  : "bg-white/5 text-gray-300 hover:text-white"
              }`}
            >
              {col.label}
              {sortCol === col.key && <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>}
            </button>
          ))}
        </div>

        {tableData.map((player) => {
          const s = player.mapStats;
          const hasMaps = s.totalMatches > 0;
          const color = getPlayerColor(player.colorIndex);

          return (
            <div
              key={player.playerId}
              className="rounded-xl border border-white/6 bg-white/3 p-2.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-white text-sm font-medium truncate">{player.nickname}</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                <div className="flex items-center justify-between text-gray-300">
                  <span>Matches</span>
                  <span className="inline-flex items-center text-gray-100 font-medium">
                    {hasMaps ? s.totalMatches : "—"}
                    <MedalBadge rank={tableRankings.matches?.get(player.nickname) ?? UNRANKED} />
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>Win %</span>
                  <span className="inline-flex items-center text-gray-100 font-medium">
                    {hasMaps ? `${s.winPercent.toFixed(1)}%` : "—"}
                    <MedalBadge rank={tableRankings.winPercent?.get(player.nickname) ?? UNRANKED} />
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>K/D</span>
                  <span className="inline-flex items-center text-gray-100 font-medium">
                    {hasMaps ? s.avgKd.toFixed(2) : "—"}
                    <MedalBadge rank={tableRankings.kd?.get(player.nickname) ?? UNRANKED} />
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>K/R</span>
                  <span className="inline-flex items-center text-gray-100 font-medium">
                    {hasMaps ? s.avgKr.toFixed(2) : "—"}
                    <MedalBadge rank={tableRankings.kr?.get(player.nickname) ?? UNRANKED} />
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>ADR</span>
                  <span className="inline-flex items-center text-gray-100 font-medium">
                    {hasMaps ? s.avgAdr.toFixed(1) : "—"}
                    <MedalBadge rank={tableRankings.adr?.get(player.nickname) ?? UNRANKED} />
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>HS %</span>
                  <span className="inline-flex items-center text-gray-100 font-medium">
                    {hasMaps ? `${s.avgHsPercent.toFixed(1)}%` : "—"}
                    <MedalBadge rank={tableRankings.hsPercent?.get(player.nickname) ?? UNRANKED} />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-fixed min-w-167.5">
          <thead>
            <tr className="border-b border-white/6">
              {TABLE_COLS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={
                    col.sortable && sortCol === col.key
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={`${col.width} px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer select-none hover:text-gray-200" : ""
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key as TableSortCol) : undefined}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    {col.sortable && (
                      <SortIndicator
                        active={sortCol === col.key}
                        direction={sortCol === col.key ? sortDir : "desc"}
                      />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((player) => {
              const s = player.mapStats;
              const hasMaps = s.totalMatches > 0;
              const color = getPlayerColor(player.colorIndex);

              return (
                <tr
                  key={player.playerId}
                  className="border-t border-white/4 hover:bg-white/2 transition-colors"
                >
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-white text-sm truncate">{player.nickname}</span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span className="inline-flex items-center text-sm text-gray-300">
                      {hasMaps ? s.totalMatches : "—"}
                      <MedalBadge
                        rank={tableRankings["matches"]?.get(player.nickname) ?? UNRANKED}
                      />
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span className="inline-flex items-center text-sm text-gray-300">
                      {hasMaps ? `${s.winPercent.toFixed(1)}%` : "—"}
                      <MedalBadge
                        rank={tableRankings["winPercent"]?.get(player.nickname) ?? UNRANKED}
                      />
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span className="inline-flex items-center text-sm text-gray-300">
                      {hasMaps ? s.avgKd.toFixed(2) : "—"}
                      <MedalBadge rank={tableRankings["kd"]?.get(player.nickname) ?? UNRANKED} />
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span className="inline-flex items-center text-sm text-gray-300">
                      {hasMaps ? s.avgKr.toFixed(2) : "—"}
                      <MedalBadge rank={tableRankings["kr"]?.get(player.nickname) ?? UNRANKED} />
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span className="inline-flex items-center text-sm text-gray-300">
                      {hasMaps ? s.avgAdr.toFixed(1) : "—"}
                      <MedalBadge rank={tableRankings["adr"]?.get(player.nickname) ?? UNRANKED} />
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span className="inline-flex items-center text-sm text-gray-300">
                      {hasMaps ? `${s.avgHsPercent.toFixed(1)}%` : "—"}
                      <MedalBadge
                        rank={tableRankings["hsPercent"]?.get(player.nickname) ?? UNRANKED}
                      />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
