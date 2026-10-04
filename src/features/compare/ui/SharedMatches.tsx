"use client";

import type { SharedMatch } from "@/features/compare/model/compare";
import { mapName } from "@/features/squad/model/maps";
import type { Match } from "@/features/squad/model/types";
import { ResultBadge } from "@/features/squad/ui/ResultBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { faceitMatchUrl } from "@/shared/lib/urls";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ExternalLink } from "@/shared/ui/ExternalLink";
import { Section } from "@/shared/ui/Section";
import { LocalDate } from "@/shared/ui/Time";

interface SharedMatchesProps {
  shared: readonly SharedMatch[];
  firstName: string;
  secondName: string;
}

function Line({ match }: { match: Match }) {
  const { t, format } = useI18n();
  return (
    <span className="flex flex-col items-end gap-0.5 tabular-nums">
      <span className="font-semibold text-ink">{`${match.kills}-${match.deaths}-${match.assists}`}</span>
      <span className="text-xs text-ink-muted">{`${t("metric.kd")} ${format.decimal(match.kd, 2)} · ${t("metric.adr")} ${format.decimal(match.adr, 1)}`}</span>
    </span>
  );
}

export function SharedMatches({ shared, firstName, secondName }: SharedMatchesProps) {
  const { t } = useI18n();
  return (
    <Section id="shared" title={t("compare.sharedTitle")} description={t("compare.sharedDescription")}>
      <div className="panel scrollbar-thin relative overflow-x-auto">
        {shared.length === 0 ? (
          <EmptyState icon="users" title={t("compare.sharedEmpty")} />
        ) : (
          <table className="w-full min-w-[44rem] text-sm">
            <caption className="sr-only">{t("compare.sharedTitle")}</caption>
            <thead className="border-b border-line">
              <tr className="text-xs text-ink-muted">
                <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                  {t("history.date")}
                </th>
                <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                  {t("history.result")}
                </th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                  {firstName}
                </th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                  {secondName}
                </th>
                <th scope="col" className="px-3 py-2.5 text-right font-semibold">
                  <span className="sr-only">{t("history.links")}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {shared.map((match) => (
                <tr key={match.id} className="border-b border-line last:border-b-0 hover:bg-hover">
                  <th scope="row" className="px-3 py-2.5 text-left font-normal">
                    <span className="flex flex-col">
                      <span className="font-semibold text-ink">{mapName(match.map)}</span>
                      <LocalDate timestamp={match.finishedAt} format="datetime" className="text-xs text-ink-muted" />
                    </span>
                  </th>
                  <td className="px-3 py-2.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ${match.together ? "bg-accent-soft text-accent-text" : "bg-inset text-ink-secondary"}`}
                      >
                        {t(match.together ? "compare.sameTeam" : "compare.opponents")}
                      </span>
                      {match.together ? (
                        <ResultBadge
                          won={match.first.won}
                          score={`${match.first.teamScore}:${match.first.opponentScore}`}
                        />
                      ) : (
                        <span className="text-xs font-semibold text-ink">
                          {t("compare.winner", { player: match.first.won ? firstName : secondName })}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Line match={match.first} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Line match={match.second} />
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <ExternalLink
                      href={faceitMatchUrl(match.id)}
                      label={t("activity.roomFor", { map: mapName(match.map) })}
                      className="rounded-full p-1.5 text-ink-muted hover:bg-hover hover:text-accent-text"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Section>
  );
}
