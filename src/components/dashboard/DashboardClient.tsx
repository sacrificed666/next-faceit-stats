"use client";

import { useState, useMemo } from "react";
import type { PlayerData, PlayerWithStats, RangeFilter } from "@/types/faceit";
import { aggregateStats } from "@/lib/processing";
import Header from "@/components/layout/Header";
import PlayerCards from "./PlayerCards";
import StatsTable from "./StatsTable";
import Trends from "./Trends";
import Comparison from "./Comparison";
import MapStats from "./MapStats";
import MatchHistory from "./MatchHistory";

interface Props {
  players: PlayerData[];
}

export default function DashboardClient({ players }: Props) {
  const [range, setRange] = useState<RangeFilter>(20);

  const playersWithStats: PlayerWithStats[] = useMemo(() => {
    return players.map((player) => {
      const filteredMatches = player.matches.slice(0, range);
      return {
        ...player,
        filteredMatches,
        stats: aggregateStats(filteredMatches),
      };
    });
  }, [players, range]);

  return (
    <>
      <Header players={players} range={range} onRangeChange={setRange} />

      <div className="space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-8 pt-16 sm:pt-18 pb-4 sm:pb-6 max-w-400 mx-auto">
        <PlayerCards players={playersWithStats} />
        <StatsTable players={playersWithStats} />
        <Trends players={playersWithStats} />
        <Comparison players={playersWithStats} />
        <MapStats players={playersWithStats} range={range} />
        <MatchHistory players={playersWithStats} />
      </div>
    </>
  );
}
