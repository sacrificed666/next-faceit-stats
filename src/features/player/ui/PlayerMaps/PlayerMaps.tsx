"use client";

import { mapName } from "@/features/squad/model/maps";
import { mapCells, type PlayerView } from "@/features/squad/model/squad";
import MetricValue from "@/features/squad/ui/MetricValue/MetricValue";
import { useI18n } from "@/shared/i18n/useI18n";
import { fitGrid } from "@/shared/lib/fitGrid";
import BackdropImage from "@/shared/ui/BackdropImage/BackdropImage";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Section from "@/shared/ui/Section/Section";

interface PlayerMapsProps {
  view: PlayerView;
}

// A card for every map played in the range, next to the all-time numbers
const PlayerMaps = ({ view }: PlayerMapsProps) => {
  const { t, format } = useI18n();
  const cells = [...mapCells(view).entries()].toSorted(
    ([aMap, a], [bMap, b]) => b.matches - a.matches || mapName(aMap).localeCompare(mapName(bMap)),
  );
  const segments = new Map(view.player.maps.map((segment) => [segment.map, segment]));
  const columns = [t("metric.matches"), t("metric.winRate"), t("metric.kd"), t("metric.adr")];
  const grid = fitGrid(cells.length, { sm: [2], lg: [3, 4], xl: [4] });

  return (
    <Section id="maps" title={t("playerMaps.title")} description={t("playerMaps.description")}>
      {cells.length === 0 ? (
        <div className="panel">
          <EmptyState icon="map" title={t("empty.range")} />
        </div>
      ) : (
        <ul className="fit-grid gap-3 sm:gap-4" style={grid.list}>
          {cells.map(([map, summary], index) => {
            const segment = segments.get(map);
            return (
              <li key={map} className="panel flex flex-col overflow-hidden" style={grid.item(index)}>
                <div className="relative isolate flex h-16 items-end bg-inset px-4 pb-2">
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
                </div>
                <table className="w-full text-sm tabular-nums">
                  <caption className="sr-only">{t("playerMaps.caption", { map: mapName(map) })}</caption>
                  <thead>
                    <tr className="text-[0.6875rem] text-ink-muted">
                      <td aria-hidden="true" className="pl-4" />
                      {columns.map((column) => (
                        <th key={column} scope="col" className="px-1.5 pt-2.5 pb-1 text-right font-semibold last:pr-4">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="font-bold text-ink">
                      <th scope="row" className="py-1 pl-4 text-left text-xs font-semibold text-ink-secondary">
                        {t("playerMaps.range")}
                      </th>
                      <td className="px-1.5 py-1 text-right">{format.integer(summary.matches)}</td>
                      <td className="px-1.5 py-1 text-right">
                        <MetricValue metric="winRate" value={summary.winRate} digits={0} />
                      </td>
                      <td className="px-1.5 py-1 text-right">
                        <MetricValue metric="kd" value={summary.kd} />
                      </td>
                      <td className="py-1 pr-4 pl-1.5 text-right">
                        <MetricValue metric="adr" value={summary.adr} />
                      </td>
                    </tr>
                    <tr className="text-ink-muted">
                      <th scope="row" className="pt-1 pb-3 pl-4 text-left text-xs font-semibold">
                        {t("playerMaps.allTime")}
                      </th>
                      <td className="px-1.5 pt-1 pb-3 text-right">{segment ? format.integer(segment.matches) : "-"}</td>
                      <td className="px-1.5 pt-1 pb-3 text-right">
                        {segment ? format.percent(segment.winRate, 0) : "-"}
                      </td>
                      <td className="px-1.5 pt-1 pb-3 text-right">{segment ? format.decimal(segment.kd, 2) : "-"}</td>
                      <td className="pt-1 pr-4 pb-3 pl-1.5 text-right">
                        {segment?.adr === null || segment?.adr === undefined ? "-" : format.decimal(segment.adr, 1)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
};

export default PlayerMaps;
