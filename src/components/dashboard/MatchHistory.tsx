"use client";

import { useState, useMemo } from "react";
import type { PlayerWithStats, ProcessedMatch } from "@/types/faceit";
import { getPlayerColor } from "@/lib/colors";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useSort } from "@/hooks/useSort";
import SortIndicator from "@/components/ui/SortIndicator";

interface Props {
  players: PlayerWithStats[];
}

type SortColumn = "date" | "kd" | "kr" | "adr" | "hsPercent";

const COLUMNS = [
  { key: "date" as const, label: "Date", sortable: true, width: "w-[130px]" },
  { key: "map" as const, label: "Map", sortable: false, width: "w-[100px]" },
  { key: "score" as const, label: "Score", sortable: false, width: "w-[90px]" },
  { key: "kda" as const, label: "K/D/A", sortable: false, width: "w-[120px]" },
  { key: "kd" as const, label: "K/D", sortable: true, width: "w-[80px]" },
  { key: "kr" as const, label: "K/R", sortable: true, width: "w-[80px]" },
  { key: "adr" as const, label: "ADR", sortable: true, width: "w-[80px]" },
  { key: "hsPercent" as const, label: "HS %", sortable: true, width: "w-[80px]" },
];

const MOBILE_SORT_OPTIONS: Array<{ key: SortColumn; label: string }> = [
  { key: "date", label: "Date" },
  { key: "kd", label: "K/D" },
  { key: "kr", label: "K/R" },
  { key: "adr", label: "ADR" },
  { key: "hsPercent", label: "HS %" },
];

function getSortValue(match: ProcessedMatch, col: SortColumn): number {
  switch (col) {
    case "date":
      return match.finishedAt;
    case "kd":
      return match.kd;
    case "kr":
      return match.kr;
    case "adr":
      return match.adr;
    case "hsPercent":
      return match.hsPercent;
  }
}

export default function MatchHistory({ players }: Props) {
  const [activePlayer, setActivePlayer] = useState(players[0]?.nickname ?? "");
  const { sortCol, sortDir, handleSort, resetSort } = useSort<SortColumn>("date");
  const isMobile = useIsMobile();

  const currentPlayer = players.find((p) => p.nickname === activePlayer) ?? players[0];

  const sortedMatches = useMemo(() => {
    if (!currentPlayer) return [];
    return [...currentPlayer.filteredMatches].sort((a, b) => {
      const aVal = getSortValue(a, sortCol);
      const bVal = getSortValue(b, sortCol);
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [currentPlayer, sortCol, sortDir]);

  function handleTabChange(nickname: string): void {
    setActivePlayer(nickname);
    resetSort("date");
  }

  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-white/6 rounded-2xl p-3 sm:p-5">
      <h2 className="text-white font-bold text-base sm:text-lg mb-3 sm:mb-4">Match History</h2>

      <div
        className="flex gap-0.5 sm:gap-1 overflow-x-auto pb-2 mb-3 sm:mb-4"
        role="tablist"
        aria-label="Player selection"
      >
        {players.map((player) => {
          const color = getPlayerColor(player.colorIndex);
          return (
            <button
              key={player.nickname}
              role="tab"
              aria-selected={activePlayer === player.nickname}
              onClick={() => handleTabChange(player.nickname)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm rounded-lg transition-all duration-150 whitespace-nowrap ${
                activePlayer === player.nickname
                  ? "bg-white/12 text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {player.nickname}
            </button>
          );
        })}
      </div>

      {isMobile ? (
        <div className="space-y-2.5">
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
                {sortCol === col.key && (
                  <span className="ml-1">{sortDir === "asc" ? "▲" : "▼"}</span>
                )}
              </button>
            ))}
          </div>

          {sortedMatches.map((match) => (
            <div key={match.matchId} className="rounded-xl border border-white/6 bg-white/3 p-2.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-medium">{match.map}</span>
                  <span className="text-gray-500 text-xs">{match.date}</span>
                </div>
                <span
                  className={`text-sm font-semibold px-2 py-0.5 rounded ${
                    match.result ? "text-win bg-win/10" : "text-loss bg-loss/10"
                  }`}
                >
                  {match.score}
                </span>
              </div>

              <div className="flex items-center mb-2">
                <span className="text-xs text-gray-400">
                  K/D/A: {match.kills} / {match.deaths} / {match.assists}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                <div className="flex items-center justify-between text-gray-300">
                  <span>K/D</span>
                  <span className="text-gray-100 font-medium">{match.kd.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>K/R</span>
                  <span className="text-gray-100 font-medium">{match.kr.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>ADR</span>
                  <span className="text-gray-100 font-medium">{match.adr.toFixed(1)}</span>
                </div>
                <div className="flex items-center justify-between text-gray-300">
                  <span>HS %</span>
                  <span className="text-gray-100 font-medium">{match.hsPercent.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          ))}

          {sortedMatches.length === 0 && (
            <div className="py-8 text-center text-gray-500">No matches found</div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed min-w-165">
            <thead>
              <tr className="border-b border-white/6">
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
                    className={`${col.width} px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider ${
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
              {sortedMatches.map((match) => (
                <tr
                  key={match.matchId}
                  className="border-t border-white/4 hover:bg-white/2 transition-colors"
                >
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-300">
                    {match.date}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-300">{match.map}</td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5">
                    <span
                      className={`text-sm font-medium px-2 py-0.5 rounded ${
                        match.result ? "text-win bg-win/10" : "text-loss bg-loss/10"
                      }`}
                    >
                      {match.score}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-300">
                    {match.kills} / {match.deaths} / {match.assists}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-200 font-medium">
                    {match.kd.toFixed(2)}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-200 font-medium">
                    {match.kr.toFixed(2)}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-200 font-medium">
                    {match.adr.toFixed(1)}
                  </td>
                  <td className="px-3 sm:px-4 py-2 sm:py-2.5 text-sm text-gray-200 font-medium">
                    {match.hsPercent.toFixed(0)}%
                  </td>
                </tr>
              ))}
              {sortedMatches.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No matches found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
