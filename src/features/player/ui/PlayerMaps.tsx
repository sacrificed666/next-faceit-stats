"use client";

import { mapName } from "@/features/squad/model/maps";
import { mapCells, type PlayerView } from "@/features/squad/model/squad";
import { useI18n } from "@/shared/i18n/useI18n";
import { BackdropImage } from "@/shared/ui/BackdropImage";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Section } from "@/shared/ui/Section";

interface PlayerMapsProps {
  view: PlayerView;
}

export function PlayerMaps({ view }: PlayerMapsProps) {
  const { t, format } = useI18n();
  const cells = [...mapCells(view).entries()].toSorted(
    ([aMap, a], [bMap, b]) => b.matches - a.matches || mapName(aMap).localeCompare(mapName(bMap)),
  );
  const segments = new Map(view.player.maps.map((segment) => [segment.map, segment]));

  return (
    <Section id="maps" title={t("playerMaps.title")} description={t("playerMaps.description")}>
      {cells.length === 0 ? (
        <div className="panel">
          <EmptyState icon="map" title={t("empty.range")} />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cells.map(([map, summary]) => {
            const segment = segments.get(map);
            return (
              <li key={map} className="panel flex flex-col overflow-hidden">
                <div className="relative isolate flex h-24 items-end gap-3 bg-inset p-4">
                  <BackdropImage
                    src={segment?.image ?? null}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="-z-10 opacity-60"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10"
                    style={{ backgroundImage: "var(--image-fade)" }}
                  />
                  <h3 className="text-lg font-extrabold tracking-tight text-ink">{mapName(map)}</h3>
                  <span className="ml-auto text-xs font-semibold text-ink-secondary">
                    {t("count.matches", { count: summary.matches })}
                  </span>
                </div>
                <dl className="grid grid-cols-3 gap-2 p-4 text-center">
                  <div>
                    <dt className="text-[0.6875rem] font-semibold text-ink-muted">{t("metric.winRate")}</dt>
                    <dd className="text-base font-bold text-ink">{format.percent(summary.winRate, 0)}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6875rem] font-semibold text-ink-muted">{t("metric.kd")}</dt>
                    <dd className="text-base font-bold text-ink">{format.decimal(summary.kd, 2)}</dd>
                  </div>
                  <div>
                    <dt className="text-[0.6875rem] font-semibold text-ink-muted">{t("metric.adr")}</dt>
                    <dd className="text-base font-bold text-ink">{format.decimal(summary.adr, 1)}</dd>
                  </div>
                </dl>
                <p className="mt-auto border-t border-line px-4 py-2.5 text-xs text-ink-muted">
                  {segment
                    ? t("playerMaps.allTime", {
                        matches: t("count.matches", { count: segment.matches }),
                        rate: format.percent(segment.winRate, 0),
                        kd: format.decimal(segment.kd, 2),
                      })
                    : t("playerMaps.noAllTime")}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}
