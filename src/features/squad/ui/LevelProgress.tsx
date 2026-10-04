"use client";

import { levelProgress } from "@/features/squad/model/levels";
import { useI18n } from "@/shared/i18n/useI18n";

interface LevelProgressProps {
  elo: number;
  className?: string;
}

export function LevelProgress({ elo, className = "" }: LevelProgressProps) {
  const { t, format } = useI18n();
  const { current, next, eloToNext } = levelProgress(elo);
  const caption =
    next && eloToNext !== null
      ? t("level.toNext", { elo: format.integer(eloToNext), level: next.level })
      : t("level.above", { elo: format.integer(elo - current.min), level: current.level });
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <meter
        className="meter"
        min={current.min}
        max={next ? next.min : Math.max(elo, current.min + 1)}
        value={elo}
        aria-label={next ? t("level.progress", { level: next.level }) : t("level.label", { level: current.level })}
        aria-valuetext={caption}
        style={{ "--meter-fill": current.color }}
      >
        {caption}
      </meter>
      <p aria-hidden="true" className="text-xs text-ink-muted">
        {caption}
      </p>
    </div>
  );
}
