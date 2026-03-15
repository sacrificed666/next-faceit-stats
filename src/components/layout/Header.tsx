"use client";

import type { PlayerData, RangeFilter } from "@/types/faceit";
import { getPlayerColor } from "@/lib/colors";

const RANGE_OPTIONS: RangeFilter[] = [5, 10, 20, 30, 50, 100];

interface Props {
  players?: PlayerData[];
  range?: RangeFilter;
  onRangeChange?: (range: RangeFilter) => void;
}

export default function Header({ players, range, onRangeChange }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#141616]/80 backdrop-blur-xl border-b border-white/6">
      <div className="max-w-400 mx-auto px-3 sm:px-4 md:px-8 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img
            src="/faceit/faceit.svg"
            alt="FACEIT"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain"
          />
          <h1 className="text-white font-bold text-sm tracking-tight sm:hidden">Stats</h1>
          <h1 className="text-white font-bold text-lg tracking-tight hidden sm:block">
            FACEIT Stats
          </h1>
        </div>

        {players && players.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 sm:gap-3 overflow-x-auto px-1 sm:px-2">
            {players.map((p) => {
              const color = getPlayerColor(p.colorIndex);
              return (
                <div key={p.nickname} className="flex items-center gap-1.5 shrink-0">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-gray-300 text-xs sm:text-sm whitespace-nowrap">
                    {p.nickname}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {range !== undefined && onRangeChange && (
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <span className="text-gray-500 text-sm hidden md:block">Last</span>
            <div
              className="flex gap-1 bg-white/4 rounded-lg p-0.5 overflow-x-auto max-w-[62vw] sm:max-w-none"
              role="tablist"
              aria-label="Match range filter"
            >
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  role="tab"
                  aria-selected={range === opt}
                  aria-label={`Last ${opt} matches`}
                  onClick={() => onRangeChange(opt)}
                  className={`px-2 sm:px-2.5 py-1 text-xs sm:text-sm rounded-md transition-all duration-150 whitespace-nowrap min-w-8 ${
                    range === opt
                      ? "bg-primary text-white font-medium"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
