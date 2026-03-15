"use client";

import type { PlayerWithStats } from "@/types/faceit";
import { getPlayerColor, getLevelColor } from "@/lib/colors";
import { formatStat } from "@/lib/format";

interface Props {
  players: PlayerWithStats[];
}

const QUICK_STATS = [
  { key: "avgKd", label: "K/D" },
  { key: "avgKr", label: "K/R" },
  { key: "avgAdr", label: "ADR" },
  { key: "avgHsPercent", label: "HS %" },
  { key: "winPercent", label: "Win %" },
] as const;

export default function PlayerCards({ players }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {players.map((player) => {
        const color = getPlayerColor(player.colorIndex);

        return (
          <div
            key={player.playerId}
            className="relative bg-surface/80 backdrop-blur-xl border border-white/6 rounded-2xl p-3 sm:p-5 transition-all duration-300 hover:border-white/12 hover:shadow-lg"
            style={{ borderTopColor: color, borderTopWidth: "3px" }}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4">
              {player.avatar ? (
                <img
                  src={player.avatar}
                  alt={player.nickname}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm"
                  style={{ backgroundColor: color }}
                >
                  {player.nickname.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm truncate">{player.nickname}</span>
                  {player.country && (
                    <img
                      src={`https://flagcdn.com/w40/${player.country.toLowerCase()}.png`}
                      alt={player.country}
                      className="w-5 h-3.5 object-cover rounded-sm"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold border bg-black/40"
                    style={{
                      borderColor: getLevelColor(player.level),
                      color: getLevelColor(player.level),
                    }}
                  >
                    {player.level}
                  </span>
                  <span className="text-gray-400 text-xs">{player.elo} ELO</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-1 gap-y-2 sm:gap-1">
              {QUICK_STATS.map(({ key, label }) => {
                const value = player.stats[key as keyof typeof player.stats] as number;
                return (
                  <div key={key} className="text-center">
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {label}
                    </div>
                    <div className="text-xs font-semibold text-gray-200 mt-0.5">
                      {formatStat(value, key)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
