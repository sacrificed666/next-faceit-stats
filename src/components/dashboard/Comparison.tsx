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
import { getPlayerColor } from "@/lib/colors";
import { getStatValue, computeRankings } from "@/lib/processing";
import { formatStat } from "@/lib/format";
import { METRIC_TABS } from "@/lib/constants";
import { useIsMobile } from "@/hooks/useIsMobile";
import RankedYAxisTick from "@/components/ui/RankedYAxisTick";
import CustomTooltip from "./CustomTooltip";

interface Props {
  players: PlayerWithStats[];
}

export default function Comparison({ players }: Props) {
  const [activeTab, setActiveTab] = useState<MetricKey>("kd");
  const isMobile = useIsMobile();

  const chartData = useMemo(() => {
    const values = players.map((p) => ({
      key: p.nickname,
      value: getStatValue(p.stats, activeTab),
    }));
    const rankings = computeRankings(values);

    return players
      .map((p) => ({
        nickname: p.nickname,
        value: getStatValue(p.stats, activeTab),
        color: getPlayerColor(p.colorIndex),
        rank: rankings.get(p.nickname) ?? 99,
        formatted: formatStat(getStatValue(p.stats, activeTab), activeTab),
      }))
      .sort((a, b) => b.value - a.value);
  }, [players, activeTab]);

  const barHeight = isMobile ? 260 : Math.max(players.length * 50 + 40, 200);
  const mobileChartWidth = Math.max(chartData.length * 72, 320);

  const tooltipValueFormatter = useCallback(
    (value: number) => formatStat(value, activeTab),
    [activeTab],
  );

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-white/6 rounded-2xl p-3 sm:p-5">
      <div className="mb-4 sm:mb-5 flex items-center justify-between gap-2">
        <h2 className="text-white font-bold text-base sm:text-lg shrink-0">Comparison</h2>
        <div className="min-w-0 overflow-x-auto">
          <div className="flex gap-1" role="tablist" aria-label="Comparison metric">
            {METRIC_TABS.map((tab) => (
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

      {isMobile ? (
        <div className="overflow-x-auto" style={{ height: barHeight }}>
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
                      label={METRIC_TABS.find((t) => t.key === activeTab)?.label}
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
        <div style={{ height: barHeight }}>
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
                    label={METRIC_TABS.find((t) => t.key === activeTab)?.label}
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
      )}
    </div>
  );
}
