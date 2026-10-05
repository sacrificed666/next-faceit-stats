"use client";

import { contextFor, type ProfileData } from "@/features/player/model/profile";
import { viewPlayer } from "@/features/squad/model/squad";
import { useRange } from "@/features/squad/model/useRange";
import RangeToolbar from "@/features/squad/ui/RangeToolbar/RangeToolbar";
import { useI18n } from "@/shared/i18n/useI18n";

import FormSummary from "../FormSummary/FormSummary";
import MatchHistory from "../MatchHistory/MatchHistory";
import PlayerMaps from "../PlayerMaps/PlayerMaps";
import PlayerTrend from "../PlayerTrend/PlayerTrend";
import Playstyle from "../Playstyle/Playstyle";
import SquadLinks from "../SquadLinks/SquadLinks";
import Teammates from "../Teammates/Teammates";

interface PlayerProfileProps {
  data: ProfileData;
}

const PlayerProfile = ({ data }: PlayerProfileProps) => {
  const { t } = useI18n();
  const range = useRange();
  const context = contextFor(data, range);
  if (!context) return null;
  const view = viewPlayer(data.player, range, data.updatedAt);
  const squad = new Map(data.squad.map((mate) => [mate.id, mate]));
  const sections = [
    { id: "form", label: t("section.form") },
    { id: "trend", label: t("section.trend") },
    { id: "maps", label: t("section.maps") },
    { id: "matches", label: t("section.history") },
    { id: "teammates", label: t("section.teammates") },
    { id: "lifetime", label: t("section.lifetime") },
  ];

  return (
    <div className="flex flex-col gap-12 sm:gap-16" data-query-scope="">
      <RangeToolbar sections={sections} />
      <FormSummary view={view} averages={context.averages} />
      <PlayerTrend view={view} averages={context.averages} />
      <PlayerMaps view={view} />
      <MatchHistory view={view} squad={squad} mates={new Map(context.mates)} />
      <Teammates view={view} squad={squad} mates={context.teammates} />
      <Playstyle player={data.player} />
      <SquadLinks squad={data.squad} current={data.player.id} />
    </div>
  );
};

export default PlayerProfile;
