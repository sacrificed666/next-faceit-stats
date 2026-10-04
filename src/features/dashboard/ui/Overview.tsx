"use client";

import { levelForElo } from "@/features/squad/model/levels";
import { active, averageElo, squadAverage, type PlayerView } from "@/features/squad/model/squad";
import type { Lineup } from "@/features/squad/model/together";
import { LevelBadge } from "@/features/squad/ui/LevelBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { Icon } from "@/shared/ui/Icon";
import { StatTile } from "@/shared/ui/StatTile";

interface OverviewProps {
  views: readonly PlayerView[];
  lineups: readonly Lineup[];
}

function best(views: readonly PlayerView[], value: (view: PlayerView) => number): PlayerView | null {
  return views.reduce<PlayerView | null>((top, view) => (!top || value(view) > value(top) ? view : top), null);
}

export function Overview({ views, lineups }: OverviewProps) {
  const { t, format } = useI18n();
  const playing = active(views);
  const elo = averageElo(views);
  const topElo = best(views, (view) => view.player.elo);
  const topKd = best(playing, (view) => view.summary.kd);
  const topWin = best(playing, (view) => view.summary.winRate);
  const together = lineups.filter((lineup) => lineup.playerIds.length > 1);
  const togetherWins = together.filter((lineup) => lineup.won).length;
  const hot = best(
    playing.filter((view) => view.streak?.won),
    (view) => view.streak?.length ?? 0,
  );

  return (
    <section aria-labelledby="overview-title" className="flex flex-col gap-4">
      <h2 id="overview-title" className="sr-only">
        {t("overview.title")}
      </h2>
      <dl className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <StatTile
          label={t("overview.averageElo")}
          icon={<Icon name="chart" size={14} />}
          value={
            <span className="inline-flex items-center gap-2">
              <LevelBadge level={levelForElo(elo).level} size={26} />
              {format.integer(elo)}
            </span>
          }
          detail={
            topElo
              ? t("overview.top", { name: topElo.player.nickname, value: format.integer(topElo.player.elo) })
              : undefined
          }
        />
        <StatTile
          label={t("overview.squadKd")}
          icon={<Icon name="crosshair" size={14} />}
          value={format.decimal(squadAverage(views, "kd"), 2)}
          detail={
            topKd
              ? t("overview.best", { name: topKd.player.nickname, value: format.decimal(topKd.summary.kd, 2) })
              : undefined
          }
        />
        <StatTile
          label={t("overview.squadWinRate")}
          icon={<Icon name="trophy" size={14} />}
          value={format.percent(squadAverage(views, "winRate"))}
          detail={
            topWin
              ? t("overview.best", { name: topWin.player.nickname, value: format.percent(topWin.summary.winRate) })
              : undefined
          }
        />
        <StatTile
          label={t("overview.together")}
          icon={<Icon name="users" size={14} />}
          value={format.integer(together.length)}
          detail={
            together.length > 0
              ? t("overview.togetherDetail", {
                  count: togetherWins,
                  rate: format.percent((togetherWins / together.length) * 100),
                })
              : t("overview.noShared")
          }
        />
        <StatTile
          label={t("overview.streak")}
          icon={<Icon name="flame" size={14} />}
          className="col-span-2 lg:col-span-1"
          value={hot?.streak ? t("count.wins", { count: hot.streak.length }) : "-"}
          detail={hot ? hot.player.nickname : t("overview.noStreak")}
        />
      </dl>
    </section>
  );
}
