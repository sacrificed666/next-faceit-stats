"use client";

import type { SquadMate } from "@/features/player/model/profile";
import type { PlayerView } from "@/features/squad/model/squad";
import type { Teammate } from "@/features/squad/model/together";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import { useI18n } from "@/shared/i18n/useI18n";
import BarList from "@/shared/ui/BarList/BarList";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Section from "@/shared/ui/Section/Section";

interface TeammatesProps {
  view: PlayerView;
  squad: ReadonlyMap<string, SquadMate>;
  mates: readonly Teammate[];
}

const Teammates = ({ view, squad, mates }: TeammatesProps) => {
  const { t, format } = useI18n();
  const items = mates.flatMap((mate) => {
    const player = squad.get(mate.id);
    if (!player) return [];
    return [
      {
        id: mate.id,
        value: mate.winRate,
        display: format.percent(mate.winRate, 0),
        label: <PlayerName player={player} size={26} />,
        detail: t("teammates.detail", { count: mate.matches, record: `${mate.wins}-${mate.matches - mate.wins}` }),
      },
    ];
  });

  return (
    <Section
      id="teammates"
      title={t("teammates.title")}
      description={t("teammates.description", { player: view.player.nickname })}
    >
      <div className="panel p-4 sm:p-6">
        {items.length > 0 ? (
          <BarList
            ordered={false}
            max={100}
            items={items}
            reference={{
              value: view.summary.winRate,
              label: t("teammates.overall", { value: format.percent(view.summary.winRate, 0) }),
            }}
          />
        ) : (
          <EmptyState icon="users" title={t("teammates.empty")}>
            {t("teammates.emptyHint")}
          </EmptyState>
        )}
      </div>
    </Section>
  );
};

export default Teammates;
