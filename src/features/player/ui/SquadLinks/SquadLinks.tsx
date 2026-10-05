"use client";

import Link from "next/link";

import type { SquadMate } from "@/features/player/model/profile";
import { useRange, withRange } from "@/features/squad/model/useRange";
import LevelBadge from "@/features/squad/ui/LevelBadge/LevelBadge";
import { useI18n } from "@/shared/i18n/useI18n";
import { homePath, playerPath } from "@/shared/lib/urls";
import Avatar from "@/shared/ui/Avatar/Avatar";
import Icon from "@/shared/ui/Icon/Icon";

interface SquadLinksProps {
  squad: readonly SquadMate[];
  current: string;
}

const SquadLinks = ({ squad, current }: SquadLinksProps) => {
  const { locale, t, format } = useI18n();
  const range = useRange();
  const others = squad.filter((mate) => mate.id !== current).toSorted((a, b) => b.elo - a.elo);
  if (others.length === 0) return null;
  return (
    <nav aria-labelledby="squad-links-title" className="flex flex-col gap-4">
      <h2 id="squad-links-title" className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
        {t("squadLinks.title")}
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {others.map((mate) => (
          <li key={mate.id}>
            <Link
              href={withRange(playerPath(locale, mate.nickname), range)}
              className="panel flex items-center gap-3 p-3 transition-colors hover:border-line-strong"
            >
              <Avatar src={mate.avatar} name={mate.nickname} size={36} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-semibold text-ink">{mate.nickname}</span>
                <span className="text-xs text-ink-muted">{`${format.integer(mate.elo)} ${t("metric.elo")}`}</span>
              </span>
              <LevelBadge level={mate.level} size={28} />
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href={withRange(homePath(locale), range)}
        className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-accent-text hover:underline"
      >
        <Icon name="chevronLeft" size={16} />
        {t("squadLinks.back")}
      </Link>
    </nav>
  );
};

export default SquadLinks;
