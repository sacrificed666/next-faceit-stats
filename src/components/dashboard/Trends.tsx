"use client";

import { useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import type { PlayerWithStats, MetricKey } from "@/types/faceit";
import { getPlayerColor } from "@/lib/colors";
import { getStatValue, getMatchMetricValue } from "@/lib/processing";
import { TREND_METRIC_TABS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/useIsMobile";
import CustomTooltip from "./CustomTooltip";

interface Props {
  players: PlayerWithStats[];
}

export default function Trends({ players }: Props) {
  const [activeTab, setActiveTab] = useState<MetricKey>("kd");
  const isMobile = useIsMobile();

  const chartData = useMemo(() => {
    const maxMatches = Math.max(...players.map((p) => p.filteredMatches.length), 0);

    return Array.from({ length: maxMatches }, (_, i) => {
      const point: Record<string, number | string | null> = {
        matchNum: i + 1,
      };
      players.forEach((p) => {
        const reversed = [...p.filteredMatches].reverse();
        const match = reversed[i];
        if (match) {
          point[p.nickname] = getMatchMetricValue(match, activeTab);
          point[`${p.nickname}_date`] = match.date;
        } else {
          point[p.nickname] = null;
        }
      });
      return point;
    });
  }, [players, activeTab]);

  const labelFormatter = useCallback((label: string | number) => `Match #${label}`, []);

  const valueFormatter = useCallback(
    (value: number, name: string, entryPayload?: Record<string, unknown>) => {
      const date = entryPayload?.[`${name}_date`];
      return `${value}${date ? ` (${date})` : ""}`;
    },
    [],
  );

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-white/6 rounded-2xl p-3 sm:p-5">
      <div className="flex items-center justify-between gap-2 mb-4 sm:mb-5">
        <h2 className="text-white font-bold text-base sm:text-lg shrink-0">Trends</h2>
        <div className="min-w-0 overflow-x-auto">
          <div className="flex gap-1" role="tablist" aria-label="Trends metric">
            {TREND_METRIC_TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 px-1.5 sm:px-4 py-0.5 sm:py-1.5 text-[11px] sm:text-sm rounded-md sm:rounded-lg whitespace-nowrap transition-all duration-150 ${
                  activeTab === tab.key
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-70 sm:h-100">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="matchNum"
              tick={{ fill: "#9ca3af", fontSize: isMobile ? 10 : 12 }}
              axisLine={{ stroke: "#333" }}
              label={{
                value: "Match #",
                position: "insideBottomRight",
                offset: -5,
                style: { fill: "#6b7280", fontSize: 11 },
              }}
            />
            <YAxis
              tick={{ fill: "#9ca3af", fontSize: isMobile ? 10 : 12 }}
              axisLine={{ stroke: "#333" }}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <CustomTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  labelFormatter={labelFormatter}
                  valueFormatter={valueFormatter}
                />
              )}
            />
            {!isMobile && <Legend wrapperStyle={{ color: "#9ca3af", paddingTop: "16px" }} />}
            {players.map((player) => {
              const color = getPlayerColor(player.colorIndex);
              const avg = getStatValue(player.stats, activeTab);

              return (
                <ReferenceLine
                  key={`ref-${player.nickname}`}
                  y={avg}
                  stroke={color}
                  strokeDasharray="5 5"
                  strokeOpacity={0.3}
                />
              );
            })}
            {players.map((player) => {
              const color = getPlayerColor(player.colorIndex);
              return (
                <Line
                  key={player.nickname}
                  type="monotone"
                  dataKey={player.nickname}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: isMobile ? 2 : 3, fill: color }}
                  activeDot={{ r: isMobile ? 3 : 5 }}
                  connectNulls={false}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isMobile && (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">
          {players.map((player) => {
            const color = getPlayerColor(player.colorIndex);
            return (
              <div key={player.nickname} className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-400 text-[11px]">{player.nickname}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
