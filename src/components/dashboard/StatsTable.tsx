"use client";

import { useMemo } from "react";
import type { PlayerWithStats } from "@/types/faceit";
import { getPlayerColor } from "@/lib/colors";
import { computeRankings, getStatValue } from "@/lib/processing";
import { formatStat } from "@/lib/format";
import { UNRANKED } from "@/lib/constants";
import { useSort } from "@/hooks/useSort";
import MedalBadge from "@/components/ui/MedalBadge";
import SortIndicator from "@/components/ui/SortIndicator";

interface Props {
  players: PlayerWithStats[];
}

type MetricSortColumn = "kd" | "kr" | "adr" | "hsPercent" | "winPercent";
type SortColumn = "elo" | MetricSortColumn;

const COLUMNS = [
  { key: "player" as const, label: "Player", sortable: false, width: "w-[200px]" },
  { key: "elo" as const, label: "ELO", sortable: true, width: "w-[100px]" },
  { key: "kda" as const, label: "K/D/A", sortable: false, width: "w-[140px]" },
  { key: "kd" as const, label: "K/D", sortable: true, width: "w-[100px]" },
  { key: "kr" as const, label: "K/R", sortable: true, width: "w-[100px]" },
  { key: "adr" as const, label: "ADR", sortable: true, width: "w-[100px]" },
  { key: "hsPercent" as const, label: "HS %", sortable: true, width: "w-[100px]" },
  { key: "winPercent" as const, label: "Win %", sortable: true, width: "w-[100px]" },
] as const;

const METRIC_COLUMNS: MetricSortColumn[] = ["kd", "kr", "adr", "hsPercent", "winPercent"];
const RANKABLE_COLUMNS: SortColumn[] = ["elo", ...METRIC_COLUMNS];
const MOBILE_SORT_OPTIONS: Array<{ key: SortColumn; label: string }> = [
  { key: "elo", label: "ELO" },
  { key: "kd", label: "K/D" },
  { key: "kr", label: "K/R" },
  { key: "adr", label: "ADR" },
  { key: "hsPercent", label: "HS %" },
  { key: "winPercent", label: "Win %" },
];

function getSortValue(player: PlayerWithStats, col: SortColumn): number {
  if (col === "elo") return player.elo;
  return getStatValue(player.stats, col);
}

export default function StatsTable({ players }: Props) {
  const { sortCol, sortDir, handleSort } = useSort<SortColumn>("kd");

  const rankings = useMemo(() => {
    const result: Record<string, Map<string, number>> = {};
    for (const col of RANKABLE_COLUMNS) {
      const values = players.map((p) => ({
        key: p.nickname,
        value: getSortValue(p, col),
      }));
      result[col] = computeRankings(values);
    }
    return result;
  }, [players]);

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      const aVal = getSortValue(a, sortCol);
      const bVal = getSortValue(b, sortCol);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [players, sortCol, sortDir]);

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-white/6 rounded-2xl overflow-hidden">
      <div className="p-3 sm:p-5 pb-2 sm:pb-3">
        <h2 className="text-white font-bold text-base sm:text-lg">General Statistics</h2>
      </div>

      <div className="sm:hidden px-3 pb-3 space-y-2.5">
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

        {sortedPlayers.map((player) => {
          const color = getPlayerColor(player.colorIndex);
          const s = player.stats;

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
                  <span className="text-white font-medium text-sm truncate">{player.nickname}</span>
                </div>
                <span className="inline-flex items-center text-sm text-gray-200 font-medium shrink-0">
                  {player.elo}
                  <MedalBadge rank={rankings.elo?.get(player.nickname) ?? UNRANKED} />
                </span>
              </div>

              <div className="mt-2 text-xs text-gray-400">
                K/D/A: {s.avgKills.toFixed(1)} / {s.avgDeaths.toFixed(1)} /{" "}
                {s.avgAssists.toFixed(1)}
              </div>

              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
                {METRIC_COLUMNS.map((col) => {
                  const val = getStatValue(s, col);
                  const rank = rankings[col]?.get(player.nickname) ?? UNRANKED;
                  const formatted = formatStat(val, col);
                  const label = COLUMNS.find((c) => c.key === col)?.label ?? col;

                  return (
                    <div
                      key={col}
                      className="flex items-center justify-between gap-2 text-gray-300"
                    >
                      <span>{label}</span>
                      <span className="inline-flex items-center text-gray-100 font-medium">
                        {formatted}
                        <MedalBadge rank={rank} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full table-fixed min-w-210">
          <thead>
            <tr className="border-t border-white/6">
              {COLUMNS.map((col) => (
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
                  className={`${col.width} px-3 sm:px-5 py-2.5 sm:py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                    col.sortable ? "cursor-pointer select-none hover:text-gray-200" : ""
                  }`}
                  onClick={col.sortable ? () => handleSort(col.key as SortColumn) : undefined}
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
            {sortedPlayers.map((player) => {
              const color = getPlayerColor(player.colorIndex);
              const s = player.stats;

              return (
                <tr
                  key={player.playerId}
                  className="border-t border-white/4 hover:bg-white/2 transition-colors"
                >
                  <td className="px-3 sm:px-5 py-2 sm:py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-white font-medium text-sm truncate">
                        {player.nickname}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3">
                    <span className="inline-flex items-center text-sm text-gray-200 font-medium">
                      {player.elo}
                      <MedalBadge rank={rankings.elo?.get(player.nickname) ?? UNRANKED} />
                    </span>
                  </td>
                  <td className="px-3 sm:px-5 py-2 sm:py-3 text-sm text-gray-300">
                    {s.avgKills.toFixed(1)} / {s.avgDeaths.toFixed(1)} / {s.avgAssists.toFixed(1)}
                  </td>
                  {METRIC_COLUMNS.map((col) => {
                    const val = getStatValue(s, col);
                    const rank = rankings[col]?.get(player.nickname) ?? UNRANKED;
                    const formatted = formatStat(val, col);

                    return (
                      <td key={col} className="px-3 sm:px-5 py-2 sm:py-3">
                        <span className="inline-flex items-center text-sm text-gray-200 font-medium">
                          {formatted}
                          <MedalBadge rank={rank} />
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
