"use client";

import Link from "next/link";

import type { Player } from "@/features/squad/model/types";
import { useRange, withRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";
import { playerPath } from "@/shared/lib/urls";
import { Avatar } from "@/shared/ui/Avatar";
import { CountryFlag } from "@/shared/ui/CountryFlag";

interface PlayerNameProps {
  player: Pick<Player, "nickname" | "avatar" | "country">;
  size?: number;
  flag?: boolean;
  link?: boolean;
  avatar?: boolean;
  className?: string;
}

export function PlayerName({
  player,
  size = 28,
  flag = false,
  link = true,
  avatar = true,
  className = "",
}: PlayerNameProps) {
  const { locale } = useI18n();
  const range = useRange();
  const name = <span className="truncate">{player.nickname}</span>;
  return (
    <span className={`flex min-w-0 items-center gap-2 ${className}`}>
      {avatar ? <Avatar src={player.avatar} name={player.nickname} size={size} /> : null}
      {link ? (
        <Link
          href={withRange(playerPath(locale, player.nickname), range)}
          className="inline-flex min-h-6 min-w-0 items-center font-semibold text-ink underline-offset-4 hover:text-accent-text hover:underline"
        >
          {name}
        </Link>
      ) : (
        <span className="min-w-0 truncate font-semibold text-ink">{name}</span>
      )}
      {flag && player.country ? <CountryFlag code={player.country} size={12} /> : null}
    </span>
  );
}
