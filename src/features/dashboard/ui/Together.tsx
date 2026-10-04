"use client";

import { playerById, type PlayerView } from "@/features/squad/model/squad";
import { duos, partySizes, type Lineup } from "@/features/squad/model/together";
import { PlayerName } from "@/features/squad/ui/PlayerName";
import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import { Avatar } from "@/shared/ui/Avatar";
import { BarList } from "@/shared/ui/BarList";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Section } from "@/shared/ui/Section";
import { RelativeTime } from "@/shared/ui/Time";

const DUO_LIMIT = 8;

const LINEUPS: Partial<Record<number, MessageKey>> = {
  1: "together.lineup.1",
  2: "together.lineup.2",
  3: "together.lineup.3",
  4: "together.lineup.4",
  5: "together.lineup.5",
};

interface TogetherProps {
  views: readonly PlayerView[];
  lineups: readonly Lineup[];
}

export function Together({ views, lineups }: TogetherProps) {
  const { t, format } = useI18n();
  const players = playerById(views);
  const sizes = partySizes(lineups);
  const pairs = duos(lineups).slice(0, DUO_LIMIT);
  const lineupLabel = (size: number) => {
    const key = LINEUPS[size];
    return key ? t(key) : t("together.lineup.other", { count: size });
  };

  return (
    <Section id="together" title={t("together.title")} description={t("together.description")}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="panel flex flex-col gap-4 p-4 sm:p-6">
          <h3 className="text-base font-bold text-ink">{t("together.lineups")}</h3>
          {sizes.length > 0 ? (
            <BarList
              ordered={false}
              max={100}
              items={sizes.map((size) => ({
                id: String(size.size),
                value: size.winRate,
                display: format.percent(size.winRate, 0),
                label: <span className="truncate text-sm font-semibold text-ink">{lineupLabel(size.size)}</span>,
                detail: `${t("count.matches", { count: size.matches })}, ${size.wins}-${size.matches - size.wins}`,
              }))}
              reference={{ value: 50, label: t("together.reference", { value: format.percent(50, 0) }) }}
            />
          ) : (
            <EmptyState icon="users" title={t("empty.range")} />
          )}
        </div>
        <div className="panel flex flex-col gap-4 p-4 sm:p-6">
          <h3 className="text-base font-bold text-ink">{t("together.duos")}</h3>
          {pairs.length > 0 ? (
            <ol className="flex flex-col divide-y divide-line">
              {pairs.map((pair) => {
                const first = players.get(pair.ids[0]);
                const second = players.get(pair.ids[1]);
                if (!first || !second) return null;
                return (
                  <li
                    key={pair.ids.join(":")}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 first:pt-0 last:pb-0"
                  >
                    <span aria-hidden="true" className="flex shrink-0 -space-x-2">
                      <Avatar src={first.avatar} name={first.nickname} size={30} className="ring-2 ring-surface" />
                      <Avatar src={second.avatar} name={second.nickname} size={30} className="ring-2 ring-surface" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 text-sm">
                      <PlayerName player={first} avatar={false} className="max-w-full" />
                      <span className="text-ink-muted">&amp;</span>
                      <PlayerName player={second} avatar={false} className="max-w-full" />
                    </span>
                    <span className="flex items-center gap-4 text-sm">
                      <span className="text-ink-secondary">{t("count.matches", { count: pair.matches })}</span>
                      <span className="w-14 text-right font-bold text-ink">{format.percent(pair.winRate, 0)}</span>
                      <span className="hidden w-32 text-right text-xs text-ink-muted sm:inline">
                        <RelativeTime timestamp={pair.lastPlayedAt} />
                      </span>
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState icon="users" title={t("together.noDuos")}>
              {t("together.noDuosHint")}
            </EmptyState>
          )}
        </div>
      </div>
    </Section>
  );
}
