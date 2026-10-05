"use client";

import type { ReactNode } from "react";

import { useI18n } from "@/shared/i18n/useI18n";

import Icon from "../Icon/Icon";

export interface DataTableRow {
  key: string;
  header: ReactNode;
  cells: ReactNode[];
}

interface DataTableProps {
  caption: string;
  columns: readonly string[];
  rows: readonly DataTableRow[];
}

const DataTable = ({ caption, columns, rows }: DataTableProps) => {
  const { t } = useI18n();
  return (
    <details className="group rounded-xl border border-line">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-secondary transition-colors hover:text-ink [&::-webkit-details-marker]:hidden">
        <Icon name="table" size={16} />
        {t("table.show")}
        <Icon name="chevronDown" size={16} className="ml-auto transition-transform group-open:rotate-180" />
      </summary>
      <div className="scrollbar-thin relative overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="text-left text-xs text-ink-muted">
              {columns.map((column, index) => (
                <th key={column} scope="col" className={`px-4 py-2 font-semibold ${index === 0 ? "" : "text-right"}`}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-line">
                <th scope="row" className="px-4 py-2 text-left font-semibold text-ink">
                  {row.header}
                </th>
                {columns.slice(1).map((column, index) => (
                  <td key={column} className="px-4 py-2 text-right whitespace-nowrap text-ink-secondary">
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
