"use client";

import { useI18n } from "@/shared/i18n/useI18n";

interface ResultBadgeProps {
  won: boolean;
  score?: string;
  size?: "sm" | "md";
}

export function ResultBadge({ won, score, size = "md" }: ResultBadgeProps) {
  const { t } = useI18n();
  const tone = won ? "bg-good-soft text-good" : "bg-bad-soft text-bad";
  const dimensions = size === "sm" ? "h-5 min-w-5 px-1 text-[0.6875rem]" : "h-6 min-w-6 px-1.5 text-xs";
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 rounded-md font-extrabold whitespace-nowrap tabular-nums ${tone} ${dimensions}`}
    >
      <span aria-hidden="true">{t(won ? "result.winShort" : "result.lossShort")}</span>
      <span className="sr-only">{t(won ? "result.win" : "result.loss")}</span>
      {score ? <span className="font-bold">{score}</span> : null}
    </span>
  );
}

interface FormGuideProps {
  matches: ReadonlyArray<{ id: string; won: boolean }>;
  label?: string;
}

export function FormGuide({ matches, label }: FormGuideProps) {
  const { t, format } = useI18n();
  const name = label ?? t("form.recent");
  if (matches.length === 0) return <span className="text-sm text-ink-muted">{t("form.none")}</span>;
  const results = format.list(matches.map((match) => t(match.won ? "result.win" : "result.loss").toLowerCase()));
  return (
    <span className="inline-flex items-center gap-1" title={t("form.newestFirst", { label: name })}>
      <span className="sr-only">{t("form.spoken", { label: name, results })}</span>
      {matches.map((match) => (
        <span
          key={match.id}
          aria-hidden="true"
          className={`inline-flex size-5 items-center justify-center rounded-[5px] text-[0.625rem] font-extrabold ${match.won ? "bg-good-soft text-good" : "bg-bad-soft text-bad"}`}
        >
          {t(match.won ? "result.winShort" : "result.lossShort")}
        </span>
      ))}
    </span>
  );
}
