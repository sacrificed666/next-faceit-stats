"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/shared/i18n/useI18n";

import Icon from "../Icon/Icon";

export interface DataTableColumn {
  label: string;
  align?: "start" | "end";
}

export interface DataTableRow {
  key: string;
  header: ReactNode;
  cells: ReactNode[];
}

interface DataTableProps {
  caption: string;
  columns: readonly DataTableColumn[];
  rows: readonly DataTableRow[];
}

// Numbers sit at the end of a column, text at the start
const alignment = (column: DataTableColumn) => (column.align === "start" ? "text-left" : "text-right");

// The numbers behind a chart in a table that opens on demand, header kept in view
const DataTable = ({ caption, columns, rows }: DataTableProps) => {
  const { t } = useI18n();
  return (
    <details className="group overflow-hidden rounded-lg border border-line bg-surface">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-colors select-none hover:text-ink [&::-webkit-details-marker]:hidden">
        <Icon name="table" size={16} />
        <span className="group-open:hidden">{t("table.show")}</span>
        <span className="hidden group-open:inline">{t("table.hide")}</span>
        <Icon name="chevronDown" size={16} className="ml-auto transition-transform group-open:rotate-180" />
      </summary>
      <div className="scrollbar-thin relative max-h-[30rem] overflow-auto border-t border-line">
        <table className="w-full text-sm tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.label}
                  scope="col"
                  className={`sticky top-0 z-10 bg-surface px-4 py-2 text-xs font-semibold whitespace-nowrap text-ink-muted shadow-[inset_0_-1px_0_var(--line)] ${index === 0 ? "text-left" : alignment(column)}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-line first:border-t-0 hover:bg-hover">
                <th scope="row" className="px-4 py-2 text-left font-semibold whitespace-nowrap text-ink">
                  {row.header}
                </th>
                {columns.slice(1).map((column, index) => (
                  <td
                    key={column.label}
                    className={`px-4 py-2 font-semibold whitespace-nowrap text-ink-secondary ${alignment(column)}`}
                  >
                    {row.cells[index]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
};

export default DataTable;
