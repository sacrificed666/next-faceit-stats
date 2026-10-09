"use client";

import { useId } from "react";

import { pickPair, rivalry, sharedMatches } from "@/features/compare/model/compare";
import { mapName } from "@/features/squad/model/maps";
import { mapCells, viewPlayer, type PlayerView } from "@/features/squad/model/squad";
import type { Player } from "@/features/squad/model/types";
import { useRange } from "@/features/squad/model/useRange";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import LevelProgress from "@/features/squad/ui/LevelProgress/LevelProgress";
import MapThumb, { MapImagesProvider } from "@/features/squad/ui/MapThumb/MapThumb";
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
import Select from "@/shared/ui/Select/Select";

import CompareRows, { type CompareRow } from "../CompareRows/CompareRows";
import SharedMatches from "../SharedMatches/SharedMatches";

interface ComparePageProps {
  players: Player[];
  updatedAt: number;
  mapImages: Readonly<Record<string, string>>;
}

// A total divided by the matches played, or nothing without matches
const perMatch = (view: PlayerView, value: (view: PlayerView) => number): number | null =>
  view.summary.matches > 0 ? value(view) / view.summary.matches : null;

// The value only when the player has matches in the range
const played = (view: PlayerView, value: number): number | null => (view.summary.matches > 0 ? value : null);

// 3K, 4K and 5K rounds in the range
const multiKills = (view: PlayerView): number =>
  view.summary.tripleKills + view.summary.quadroKills + view.summary.pentaKills;

// Form rows: averages over the range plus per-match counts
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
      key: "rating",
      label: t("metric.rating.name"),
      first: played(first, first.summary.rating),
      second: played(second, second.summary.rating),
      display: decimal(2),
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
      key: "survival",
      label: t("metric.survival.name"),
      first: played(first, first.summary.survival),
      second: played(second, second.summary.survival),
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

// Lifetime rows from the all-time FACEIT statistics
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

// Win rate on every map either player played, the busiest maps first
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
      label: (
        <span className="inline-flex items-center gap-2">
          <MapThumb map={map} />
          {mapName(map)}
        </span>
      ),
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
  players: readonly Player[];
  onChange: (nickname: string) => void;
}

// A labelled select for one of the two players, with their avatar and ELO
const Picker = ({ label, value, players, onChange }: PickerProps) => {
  const id = useId();
  const { format } = useI18n();
  const selected = players.find((player) => player.nickname === value);
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-ink-muted">
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        leading={<Avatar src={selected?.avatar ?? null} name={value} size={26} />}
      >
        {players.map((player) => (
          <option key={player.id} value={player.nickname}>
            {`${player.nickname} · ${format.integer(player.elo)}`}
          </option>
        ))}
      </Select>
    </div>
  );
};

// One player's card: avatar, level, ELO and the last five results
const Contender = ({ view, align }: { view: PlayerView; align: "start" | "end" }) => {
  const { t, format } = useI18n();
  const { player } = view;
  return (
    <div className={`flex min-w-0 flex-col gap-3 ${align === "end" ? "items-end text-right" : ""}`}>
      <Avatar
        src={player.avatar}
        name={player.nickname}
        size={72}
        className="ring-4 ring-accent-soft max-sm:size-14!"
      />
      <div className={`flex min-w-0 max-w-full flex-col gap-1 ${align === "end" ? "items-end" : ""}`}>
        <PlayerName player={player} avatar={false} flag className="max-w-full text-base sm:text-lg" />
        <p className={`flex items-center gap-2 ${align === "end" ? "flex-row-reverse" : ""}`}>
          <LevelBadge level={player.level} size={30} />
          <span className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            {format.integer(player.elo)}
          </span>
          <span className="text-xs font-semibold text-ink-muted">{t("metric.elo")}</span>
        </p>
      </div>
      <LevelProgress elo={player.elo} className="w-full max-w-64" />
      <FormGuide matches={view.matches.slice(0, 5)} />
    </div>
  );
};

// Two players side by side, picked in the address so the page can be shared
const ComparePage = ({ players, updatedAt, mapImages }: ComparePageProps) => {
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

  // Picks a player; picking the other side's player swaps the two
  const choose = (slot: "a" | "b", nickname: string): void => {
    const taken = slot === "a" ? second.nickname : first.nickname;
    if (nickname !== taken) {
      setSearchParams({ [slot]: nickname });
      return;
    }
    setSearchParams(slot === "a" ? { a: nickname, b: first.nickname } : { a: second.nickname, b: nickname });
  };

  return (
    <MapImagesProvider images={mapImages}>
      <div className="flex flex-col gap-12 sm:gap-16" data-query-scope="">
        {header}
        <RangeToolbar sections={sections} />

        <section aria-label={t("compare.pick")} className="panel flex flex-col gap-6 p-5 sm:p-8">
          {/* Phones stack the pickers so whole nicknames fit */}
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-6">
            <Picker
              label={t("compare.first")}
              value={first.nickname}
              players={ordered}
              onChange={(value) => choose("a", value)}
            />
            <button
              type="button"
              onClick={() => setSearchParams({ a: second.nickname, b: first.nickname })}
              className="inline-flex size-10 items-center justify-center justify-self-center rounded-full border border-line-strong text-ink-secondary transition-colors hover:border-accent hover:text-accent-text"
            >
              <Icon name="swap" size={18} className="max-sm:rotate-90" />
              <span className="sr-only">{t("compare.swap")}</span>
            </button>
            <Picker
              label={t("compare.second")}
              value={second.nickname}
              players={ordered}
              onChange={(value) => choose("b", value)}
            />
          </div>
          {/* The two players face each other on every screen, like a scoreboard */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:items-center sm:gap-6">
            <Contender view={a} align="start" />
            <span
              aria-hidden="true"
              className="hidden size-14 items-center justify-center self-center justify-self-center rounded-full bg-accent text-lg font-extrabold text-accent-ink uppercase sm:inline-flex"
            >
              {t("compare.vs")}
            </span>
            <Contender view={b} align="end" />
          </div>
          <dl className="grid grid-cols-2 gap-3 border-t border-line pt-5 text-sm">
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
            <div className="flex flex-col items-end gap-0.5 text-right">
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

        <div className="grid grid-cols-1 gap-12 sm:gap-16 xl:grid-cols-2 xl:gap-6">
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
        </div>

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
    </MapImagesProvider>
  );
};

export default ComparePage;
