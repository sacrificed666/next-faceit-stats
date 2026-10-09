"use client";

import type { ReactNode } from "react";

import { leader } from "@/features/compare/model/compare";
import { useI18n } from "@/shared/i18n/useI18n";

export interface CompareRow {
  key: string;
  label: ReactNode;
  first: number | null;
  second: number | null;
  display: (value: number, side: "first" | "second") => string;
  ranked?: boolean;
}

interface CompareRowsProps {
  caption: string;
  firstName: string;
  secondName: string;
  rows: readonly CompareRow[];
}

// A bar that grows away from the metric names in the middle
const Bar = ({
  value,
  max,
  strong,
  side,
}: {
  value: number | null;
  max: number;
  strong: boolean;
  side: "start" | "end";
}) => {
  const width = value === null || max <= 0 ? 0 : Math.max((value / max) * 100, value > 0 ? 2 : 0);
  return (
    <div
      aria-hidden="true"
      className={`flex h-1.5 w-full rounded-full bg-inset ${side === "start" ? "justify-end" : ""}`}
    >
      <div
        className={`h-full ${side === "start" ? "rounded-l-full" : "rounded-r-full"} ${strong ? "mark bg-data" : "mark-muted bg-data-muted"}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
};

// Two players mirrored around the metric names, the better value in bold
const CompareRows = ({ caption, firstName, secondName, rows }: CompareRowsProps) => {
  const { t } = useI18n();
  return (
    <div className="panel scroll-edges scrollbar-thin relative overflow-x-auto p-2 sm:p-4">
      <table className="w-full min-w-[22rem] text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="text-xs text-ink-muted">
            <th scope="col" className="w-[38%] px-2 pb-2 text-right font-semibold">
              {firstName}
            </th>
            <th scope="col" className="px-2 pb-2 text-center font-semibold">
              <span className="sr-only">{t("compare.metric")}</span>
            </th>
            <th scope="col" className="w-[38%] px-2 pb-2 text-left font-semibold">
              {secondName}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const ahead = row.ranked === false ? null : leader(row.first, row.second);
            const max = Math.max(row.first ?? 0, row.second ?? 0);
            const note =
              ahead === null ? "" : t("compare.better", { player: ahead === "first" ? firstName : secondName });
            return (
              <tr key={row.key} className="border-t border-line first:border-t-0">
                <td className="px-2 py-2.5 text-right">
                  <span
                    className={`block tabular-nums ${ahead === "first" ? "font-extrabold text-ink" : "font-semibold text-ink-secondary"}`}
                  >
                    {row.first === null ? "-" : row.display(row.first, "first")}
                  </span>
                  <Bar value={row.first} max={max} strong={ahead === "first"} side="start" />
                </td>
                <th scope="row" className="px-2 py-2.5 text-center text-xs font-semibold text-ink-muted">
                  {row.label}
                  {note ? <span className="sr-only">{`, ${note}`}</span> : null}
                </th>
                <td className="px-2 py-2.5 text-left">
                  <span
                    className={`block tabular-nums ${ahead === "second" ? "font-extrabold text-ink" : "font-semibold text-ink-secondary"}`}
                  >
                    {row.second === null ? "-" : row.display(row.second, "second")}
                  </span>
                  <Bar value={row.second} max={max} strong={ahead === "second"} side="end" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CompareRows;
