"use client";

import type { MessageKey } from "@/shared/i18n/translate";
import { useI18n } from "@/shared/i18n/useI18n";

const MEDALS: Partial<Record<number, { tone: string; label: MessageKey }>> = {
  1: { tone: "bg-[#f4c430] text-[#3d2c00] ring-[#c99a00]", label: "medal.1" },
  2: { tone: "bg-[#cfd3d6] text-[#2b2f33] ring-[#9aa1a6]", label: "medal.2" },
  3: { tone: "bg-[#d79a5e] text-[#3a2008] ring-[#a86a32]", label: "medal.3" },
};

interface RankMedalProps {
  rank: number;
  className?: string;
}

const RankMedal = ({ rank, className = "" }: RankMedalProps) => {
  const { t } = useI18n();
  const medal = MEDALS[rank];
  if (!medal) return null;
  const label = t(medal.label);
  return (
    <span
      title={label}
      className={`inline-flex size-4 shrink-0 items-center justify-center rounded-full text-[0.625rem] leading-none font-extrabold ring-1 ring-inset ${medal.tone} ${className}`}
    >
      <span aria-hidden="true">{rank}</span>
      <span className="sr-only">{label}</span>
    </span>
  );
};

export default RankMedal;
