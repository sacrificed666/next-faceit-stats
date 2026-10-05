"use client";

import { useId } from "react";

import { pickPair, rivalry, sharedMatches } from "@/features/compare/model/compare";
import { mapName } from "@/features/squad/model/maps";
import { mapCells, viewPlayer, type PlayerView } from "@/features/squad/model/squad";
import type { Player } from "@/features/squad/model/types";
import { useRange } from "@/features/squad/model/useRange";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import LevelProgress from "@/features/squad/ui/LevelProgress/LevelProgress";
import PlayerName from "@/features/squad/ui/PlayerName/PlayerName";
import RangeToolbar from "@/features/squad/ui/RangeToolbar/RangeToolbar";
import { FormGuide } from "@/features/squad/ui/ResultBadge/ResultBadge";
import { setSearchParams, useSearchParam } from "@/shared/hooks/useQuery";
import type { Translate } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";
import type { Formatter } from "@/shared/lib/format";
import Avatar from "@/shared/ui/Avatar/Avatar";
import Icon from "@/shared/ui/Icon/Icon";
import Section from "@/shared/ui/Section/Section";

import CompareRows, { type CompareRow } from "../CompareRows/CompareRows";
import SharedMatches from "../SharedMatches/SharedMatches";

interface ComparePageProps {
  players: Player[];
  updatedAt: number;
}

const perMatch = (view: PlayerView, value: (view: PlayerView) => number): number | null =>
  view.summary.matches > 0 ? value(view) / view.summary.matches : null;

const played = (view: PlayerView, value: number): number | null => (view.summary.matches > 0 ? value : null);

const multiKills = (view: PlayerView): number =>
  view.summary.tripleKills + view.summary.quadroKills + view.summary.pentaKills;

const formRows = (first: PlayerView, second: PlayerView, t: Translate, format: Formatter): CompareRow[] => {
  const decimal = (digits: number) => (value: number) => format.decimal(value, digits);
  const percent = (value: number) => format.percent(value, 1);
  return [
    {
      key: "matches",
      label: t("metric.matches"),
      first: first.summary.matches,
      second: second.summary.matches,
      display: format.integer,
      ranked: false,
    },
    {
      key: "winRate",
      label: t("metric.winRate.name"),
      first: played(first, first.summary.winRate),
      second: played(second, second.summary.winRate),
      display: percent,
    },
    {
      key: "kd",
      label: t("metric.kd.name"),
      first: played(first, first.summary.kd),
      second: played(second, second.summary.kd),
      display: decimal(2),
    },
    {
      key: "kr",
      label: t("metric.kr.name"),
      first: played(first, first.summary.kr),
      second: played(second, second.summary.kr),
      display: decimal(2),
    },
    {
      key: "adr",
      label: t("metric.adr.name"),
      first: played(first, first.summary.adr),
      second: played(second, second.summary.adr),
      display: decimal(1),
    },
    {
      key: "hs",
      label: t("metric.hsPercent.name"),
      first: played(first, first.summary.hsPercent),
      second: played(second, second.summary.hsPercent),
      display: percent,
    },
    {
      key: "kills",
      label: t("metric.killsPerMatch"),
      first: played(first, first.summary.kills),
      second: played(second, second.summary.kills),
      display: decimal(1),
    },
    {
      key: "mvps",
      label: t("metric.mvpsPerMatch"),
      first: perMatch(first, (view) => view.summary.mvps),
      second: perMatch(second, (view) => view.summary.mvps),
      display: decimal(2),
    },
    {
      key: "multi",
      label: t("metric.multiKills"),
      first: played(first, multiKills(first)),
      second: played(second, multiKills(second)),
      display: format.integer,
    },
    {
      key: "aces",
      label: t("metric.aces"),
      first: played(first, first.summary.pentaKills),
      second: played(second, second.summary.pentaKills),
      display: format.integer,
    },
  ];
};

const lifetimeRows = (first: Player, second: Player, t: Translate, format: Formatter): CompareRow[] => {
  const a = first.lifetime;
  const b = second.lifetime;
  const percent = (value: number) => format.percent(value, 0);
  return [
    {
      key: "matches",
      label: t("lifetime.matches"),
      first: a?.matches ?? null,
      second: b?.matches ?? null,
      display: format.integer,
      ranked: false,
    },
    {
      key: "winRate",
      label: t("lifetime.winRate"),
      first: a?.winRate ?? null,
      second: b?.winRate ?? null,
      display: percent,
    },
    {
      key: "kd",
      label: t("lifetime.kd"),
      first: a?.kd ?? null,
      second: b?.kd ?? null,
      display: (value) => format.decimal(value, 2),
    },
    { key: "hs", label: t("lifetime.hs"), first: a?.hsPercent ?? null, second: b?.hsPercent ?? null, display: percent },
    {
      key: "adr",
      label: t("lifetime.adr"),
      first: a?.adr ?? null,
      second: b?.adr ?? null,
      display: (value) => format.decimal(value, 1),
    },
    {
      key: "entry",
      label: t("lifetime.entrySuccess"),
      first: a?.entrySuccessRate ?? null,
      second: b?.entrySuccessRate ?? null,
      display: percent,
    },
    {
      key: "clutch",
      label: t("lifetime.clutch1v1"),
      first: a?.oneVsOneWinRate ?? null,
      second: b?.oneVsOneWinRate ?? null,
      display: percent,
    },
    {
      key: "flash",
      label: t("lifetime.flash"),
      first: a?.flashSuccessRate ?? null,
      second: b?.flashSuccessRate ?? null,
      display: percent,
    },
    {
      key: "utility",
      label: t("lifetime.utility"),
      first: a?.utilityDamagePerRound ?? null,
      second: b?.utilityDamagePerRound ?? null,
      display: (value) => format.decimal(value, 1),
    },
    {
      key: "streak",
      label: t("lifetime.streak"),
      first: a?.longestWinStreak ?? null,
      second: b?.longestWinStreak ?? null,
      display: format.integer,
    },
  ];
};

const mapRows = (first: PlayerView, second: PlayerView, t: Translate, format: Formatter): CompareRow[] => {
  const a = mapCells(first);
  const b = mapCells(second);
  const maps = [...new Set([...a.keys(), ...b.keys()])].toSorted(
    (x, y) =>
      (b.get(y)?.matches ?? 0) + (a.get(y)?.matches ?? 0) - (b.get(x)?.matches ?? 0) - (a.get(x)?.matches ?? 0) ||
      mapName(x).localeCompare(mapName(y)),
  );
  return maps.map((map) => {
    const left = a.get(map);
    const right = b.get(map);
    return {
      key: map,
      label: mapName(map),
      first: left ? left.winRate : null,
      second: right ? right.winRate : null,
      display: (value, side) =>
        `${format.percent(value, 0)} · ${t("count.matches", { count: (side === "first" ? left : right)?.matches ?? 0 })}`,
    };
  });
};

interface PickerProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (nickname: string) => void;
}

const Picker = ({ label, value, options, onChange }: PickerProps) => {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-ink-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-full border border-line bg-inset py-2 pr-8 pl-3 text-sm font-semibold text-ink"
      >
        {options.map((nickname) => (
          <option key={nickname} value={nickname}>
            {nickname}
          </option>
        ))}
      </select>
    </div>
  );
};

const Contender = ({ view, align }: { view: PlayerView; align: "start" | "end" }) => {
  const { t, format } = useI18n();
  const { player } = view;
  return (
    <div className={`flex min-w-0 flex-col gap-3 ${align === "end" ? "sm:items-end sm:text-right" : ""}`}>
      <Avatar src={player.avatar} name={player.nickname} size={72} className="ring-4 ring-accent-soft" />
      <div className={`flex min-w-0 flex-col gap-1 ${align === "end" ? "sm:items-end" : ""}`}>
        <PlayerName player={player} avatar={false} flag className="text-lg" />
        <p className={`flex items-center gap-2 ${align === "end" ? "sm:flex-row-reverse" : ""}`}>
          <LevelBadge level={player.level} size={30} />
          <span className="text-2xl font-extrabold tracking-tight text-ink">{format.integer(player.elo)}</span>
          <span className="text-xs font-semibold text-ink-muted">{t("metric.elo")}</span>
        </p>
      </div>
      <LevelProgress elo={player.elo} className="w-full max-w-64" />
      <FormGuide matches={view.matches.slice(0, 5)} />
    </div>
  );
};

const ComparePage = ({ players, updatedAt }: ComparePageProps) => {
  const { t, format } = useI18n();
  const range = useRange();
  const ordered = players.toSorted((a, b) => b.elo - a.elo);
  const nicknames = ordered.map((player) => player.nickname);
  const pair = pickPair(nicknames, useSearchParam("a"), useSearchParam("b"));
  const first = ordered.find((player) => player.nickname === pair?.[0]);
  const second = ordered.find((player) => player.nickname === pair?.[1]);

  const sections = [
    { id: "stats", label: t("section.stats") },
    { id: "lifetime", label: t("section.lifetime") },
    { id: "maps", label: t("section.maps") },
    { id: "shared", label: t("section.shared") },
  ];

  const header = (
    <header className="flex flex-col gap-3 pt-6 sm:pt-10">
      <p className="text-xs font-bold tracking-[0.18em] text-accent-text uppercase">{t("app.kicker")}</p>
      <h1 className="text-4xl font-extrabold tracking-tight text-balance text-ink sm:text-6xl">{t("compare.title")}</h1>
      <p className="max-w-2xl text-base text-pretty text-ink-secondary sm:text-lg">{t("compare.description")}</p>
    </header>
  );

  if (!first || !second) {
    return (
      <div className="flex flex-col gap-12">
        {header}
        <p className="panel p-6 text-ink-secondary">{t("compare.needTwo")}</p>
      </div>
    );
  }

  const a = viewPlayer(first, range, updatedAt);
  const b = viewPlayer(second, range, updatedAt);
  const shared = sharedMatches(a.matches, b.matches);
  const rival = rivalry(shared);

  const choose = (slot: "a" | "b", nickname: string): void => {
    const taken = slot === "a" ? second.nickname : first.nickname;
    if (nickname !== taken) {
      setSearchParams({ [slot]: nickname });
      return;
    }
    setSearchParams(slot === "a" ? { a: nickname, b: first.nickname } : { a: second.nickname, b: nickname });
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16" data-query-scope="">
      {header}
      <RangeToolbar sections={sections} />

      <section aria-label={t("compare.pick")} className="panel flex flex-col gap-6 p-5 sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-end gap-3 sm:gap-6">
          <Picker
            label={t("compare.first")}
            value={first.nickname}
            options={nicknames}
            onChange={(value) => choose("a", value)}
          />
          <button
            type="button"
            onClick={() => setSearchParams({ a: second.nickname, b: first.nickname })}
            className="inline-flex size-10 items-center justify-center rounded-full border border-line-strong text-ink-secondary transition-colors hover:border-accent hover:text-accent-text"
          >
            <Icon name="swap" size={18} />
            <span className="sr-only">{t("compare.swap")}</span>
          </button>
          <Picker
            label={t("compare.second")}
            value={second.nickname}
            options={nicknames}
            onChange={(value) => choose("b", value)}
          />
        </div>
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center">
          <Contender view={a} align="start" />
          <span
            aria-hidden="true"
            className="hidden size-14 items-center justify-center self-center justify-self-center rounded-full bg-accent text-lg font-extrabold text-accent-ink uppercase sm:inline-flex"
          >
            {t("compare.vs")}
          </span>
          <Contender view={b} align="end" />
        </div>
        <dl className="grid gap-3 border-t border-line pt-5 text-sm sm:grid-cols-2">
          <div className="flex flex-col gap-0.5">
            <dt className="text-xs font-semibold text-ink-muted">{t("compare.together")}</dt>
            <dd className="font-semibold text-ink">
              {rival.together.matches > 0
                ? t("compare.togetherSummary", {
                    count: rival.together.matches,
                    record: `${rival.together.wins}-${rival.together.matches - rival.together.wins}`,
                  })
                : t("compare.never")}
            </dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:items-end sm:text-right">
            <dt className="text-xs font-semibold text-ink-muted">{t("compare.against")}</dt>
            <dd className="font-semibold text-ink">
              {rival.against.matches > 0
                ? t("compare.againstSummary", {
                    first: first.nickname,
                    firstWins: rival.against.firstWins,
                    second: second.nickname,
                    secondWins: rival.against.secondWins,
                  })
                : t("compare.never")}
            </dd>
          </div>
        </dl>
      </section>

      <Section id="stats" title={t("compare.stats")} description={t("compare.statsDescription")}>
        <CompareRows
          caption={t("compare.stats")}
          firstName={first.nickname}
          secondName={second.nickname}
          rows={formRows(a, b, t, format)}
        />
      </Section>

      <Section id="lifetime" title={t("compare.lifetime")} description={t("compare.lifetimeDescription")}>
        <CompareRows
          caption={t("compare.lifetime")}
          firstName={first.nickname}
          secondName={second.nickname}
          rows={lifetimeRows(first, second, t, format)}
        />
      </Section>

      <Section id="maps" title={t("compare.mapsTitle")} description={t("compare.mapsDescription")}>
        <CompareRows
          caption={t("compare.mapsCaption", { first: first.nickname, second: second.nickname })}
          firstName={first.nickname}
          secondName={second.nickname}
          rows={mapRows(a, b, t, format)}
        />
      </Section>

      <SharedMatches shared={shared} firstName={first.nickname} secondName={second.nickname} />
    </div>
  );
};

export default ComparePage;
