"use client";

import type { ReactNode } from "react";

import { longestWinStreak, matchRecord, mostAces, type MatchRecordKind } from "@/features/dashboard/model/records";
import { mapName } from "@/features/squad/model/maps";
import { members, playerById, type PlayerView } from "@/features/squad/model/squad";
import type { Match, Player } from "@/features/squad/model/types";
import { PlayerName } from "@/features/squad/ui/PlayerName";
import { ResultBadge } from "@/features/squad/ui/ResultBadge";
import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import type { Formatter } from "@/shared/lib/format";
import { faceitMatchUrl } from "@/shared/lib/urls";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ExternalLink } from "@/shared/ui/ExternalLink";
import { Icon, type IconName } from "@/shared/ui/Icon";
import { Section } from "@/shared/ui/Section";
import { LocalDate } from "@/shared/ui/Time";

const MATCH_RECORDS: ReadonlyArray<{
  kind: MatchRecordKind;
  title: MessageKey;
  icon: IconName;
  format: (format: Formatter, value: number) => string;
}> = [
  { kind: "kills", title: "records.kills", icon: "crosshair", format: (format, value) => format.integer(value) },
  { kind: "adr", title: "records.adr", icon: "bolt", format: (format, value) => format.decimal(value, 1) },
  { kind: "kd", title: "records.kd", icon: "target", format: (format, value) => format.decimal(value, 2) },
  { kind: "headshots", title: "records.headshots", icon: "skull", format: (format, value) => format.percent(value, 0) },
  { kind: "mvps", title: "records.mvps", icon: "star", format: (format, value) => format.integer(value) },
];

interface RecordCardProps {
  title: string;
  icon: IconName;
  value: string;
  player: Player;
  children?: ReactNode;
}

function RecordCard({ title, icon, value, player, children }: RecordCardProps) {
  return (
    <li className="panel flex flex-col gap-3 p-4">
      <p className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink-muted uppercase">
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent-text">
          <Icon name={icon} size={15} />
        </span>
        {title}
      </p>
      <p className="text-3xl font-extrabold tracking-tight text-ink">{value}</p>
      <PlayerName player={player} size={26} />
      {children ? (
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">{children}</div>
      ) : null}
    </li>
  );
}

function MatchContext({ match }: { match: Match }) {
  const { t } = useI18n();
  return (
    <>
      <ResultBadge won={match.won} score={`${match.teamScore}:${match.opponentScore}`} size="sm" />
      <span>{mapName(match.map)}</span>
      <span aria-hidden="true">·</span>
      <LocalDate timestamp={match.finishedAt} format="short" />
      <ExternalLink
        href={faceitMatchUrl(match.id)}
        context={mapName(match.map)}
        className="ml-auto font-semibold text-accent-text hover:underline"
      >
        {t("records.room")}
      </ExternalLink>
    </>
  );
}

interface HighlightsProps {
  views: readonly PlayerView[];
}

export function Highlights({ views }: HighlightsProps) {
  const { t, format } = useI18n();
  const players = playerById(views);
  const squad = members(views);
  const records = MATCH_RECORDS.flatMap((definition) => {
    const record = matchRecord(definition.kind, squad);
    const player = record ? players.get(record.playerId) : undefined;
    return record && player ? [{ definition, record, player }] : [];
  });
  const streak = longestWinStreak(squad);
  const streakPlayer = streak ? players.get(streak.playerId) : undefined;
  const aces = mostAces(squad);
  const acePlayer = aces ? players.get(aces.playerId) : undefined;
  const empty = records.length === 0 && !streakPlayer && !acePlayer;

  return (
    <Section id="records" title={t("records.title")} description={t("records.description")}>
      {empty ? (
        <div className="panel">
          <EmptyState icon="trophy" title={t("records.empty")} />
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {records.map(({ definition, record, player }) => (
            <RecordCard
              key={definition.kind}
              title={t(definition.title)}
              icon={definition.icon}
              value={definition.format(format, record.value)}
              player={player}
            >
              <MatchContext match={record.match} />
            </RecordCard>
          ))}
          {streak && streakPlayer ? (
            <RecordCard
              title={t("records.streak")}
              icon="flame"
              value={t("count.wins", { count: streak.value })}
              player={streakPlayer}
            >
              <span>{t("records.streakHint")}</span>
            </RecordCard>
          ) : null}
          {aces && acePlayer ? (
            <RecordCard
              title={t("records.aces")}
              icon="medal"
              value={t("count.aces", { count: aces.value })}
              player={acePlayer}
            >
              <span>{t("records.acesHint")}</span>
            </RecordCard>
          ) : null}
        </ul>
      )}
    </Section>
  );
}
