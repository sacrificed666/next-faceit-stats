"use client";

import type { Player } from "@/features/squad/model/types";
import { useI18n } from "@/shared/i18n/useI18n";
import EmptyState from "@/shared/ui/EmptyState/EmptyState";
import Meter from "@/shared/ui/Meter/Meter";
import Section from "@/shared/ui/Section/Section";

interface PlaystyleProps {
  player: Player;
}

const Playstyle = ({ player }: PlaystyleProps) => {
  const { t, format } = useI18n();
  const lifetime = player.lifetime;
  const percent = (value: number | null) => format.percent(value ?? 0, 0);
  return (
    <Section id="lifetime" title={t("lifetime.title")} description={t("lifetime.description")}>
      {lifetime ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <div className="panel flex flex-col gap-5 p-4 sm:p-6">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
              {[
                { label: t("lifetime.matches"), value: format.integer(lifetime.matches) },
                { label: t("lifetime.winRate"), value: format.percent(lifetime.winRate, 0) },
                { label: t("lifetime.kd"), value: format.decimal(lifetime.kd, 2) },
                { label: t("lifetime.hs"), value: format.percent(lifetime.hsPercent, 0) },
                { label: t("lifetime.adr"), value: lifetime.adr === null ? "-" : format.decimal(lifetime.adr, 1) },
                { label: t("lifetime.streak"), value: format.integer(lifetime.longestWinStreak) },
              ].map((entry) => (
                <div key={entry.label} className="flex flex-col gap-0.5">
                  <dt className="text-xs font-semibold text-ink-muted">{entry.label}</dt>
                  <dd className="text-xl font-bold text-ink">{entry.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="panel grid gap-5 p-4 sm:grid-cols-2 sm:p-6">
            <Meter
              label={t("lifetime.entryRate")}
              value={lifetime.entryRate}
              display={percent(lifetime.entryRate)}
              hint={t("lifetime.entryRateHint")}
            />
            <Meter
              label={t("lifetime.entrySuccess")}
              value={lifetime.entrySuccessRate}
              display={percent(lifetime.entrySuccessRate)}
              hint={t("lifetime.entrySuccessHint")}
            />
            <Meter
              label={t("lifetime.clutch1v1")}
              value={lifetime.oneVsOneWinRate}
              display={percent(lifetime.oneVsOneWinRate)}
            />
            <Meter
              label={t("lifetime.clutch1v2")}
              value={lifetime.oneVsTwoWinRate}
              display={percent(lifetime.oneVsTwoWinRate)}
            />
            <Meter
              label={t("lifetime.flash")}
              value={lifetime.flashSuccessRate}
              display={percent(lifetime.flashSuccessRate)}
              hint={t("lifetime.flashHint")}
            />
            <Meter
              label={t("lifetime.sniper")}
              value={lifetime.sniperKillRate}
              display={percent(lifetime.sniperKillRate)}
              hint={t("lifetime.sniperHint")}
            />
            <Meter
              label={t("lifetime.utility")}
              value={lifetime.utilityDamagePerRound}
              max={15}
              display={format.decimal(lifetime.utilityDamagePerRound ?? 0, 1)}
            />
          </div>
        </div>
      ) : (
        <div className="panel">
          <EmptyState icon="chart" title={t("lifetime.empty")} />
        </div>
      )}
    </Section>
  );
};

export default Playstyle;
