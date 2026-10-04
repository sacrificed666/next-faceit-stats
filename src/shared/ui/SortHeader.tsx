"use client";

import type { SortDirection } from "@/shared/hooks/useSort";

import { Icon } from "./Icon";

interface SortHeaderProps {
  label: string;
  title?: string;
  active: boolean;
  direction: SortDirection;
  onSort: () => void;
  align?: "left" | "right";
  className?: string;
}

export function SortHeader({
  label,
  title,
  active,
  direction,
  onSort,
  align = "right",
  className = "",
}: SortHeaderProps) {
  const sort = active ? (direction === "asc" ? "ascending" : "descending") : undefined;
  return (
    <th
      scope="col"
      aria-sort={sort}
      className={`px-3 py-2.5 text-xs font-semibold text-ink-muted ${align === "right" ? "text-right" : "text-left"} ${className}`}
    >
      <button
        type="button"
        onClick={onSort}
        title={title}
        className={`inline-flex items-center gap-1 rounded-md px-1 py-0.5 whitespace-nowrap transition-colors hover:text-ink ${active ? "text-ink" : ""} ${align === "right" ? "flex-row-reverse" : ""}`}
      >
        <span>{label}</span>
        <Icon
          name={active && direction === "asc" ? "chevronUp" : "chevronDown"}
          size={14}
          className={active ? "opacity-100" : "opacity-30"}
        />
        {title ? <span className="sr-only">{`, ${title}`}</span> : null}
      </button>
    </th>
  );
}
