import type { ReactNode } from "react";

export interface BarListItem {
  id: string;
  label: ReactNode;
  value: number;
  display: string;
  detail?: ReactNode;
  emphasis?: boolean;
}

interface BarListProps {
  items: readonly BarListItem[];
  max?: number;
  reference?: { value: number; label: string };
  ordered?: boolean;
  className?: string;
}

export function BarList({ items, max, reference, ordered = true, className = "" }: BarListProps) {
  const limit = Math.max(max ?? 0, ...items.map((item) => item.value), reference?.value ?? 0) || 1;
  const List = ordered ? "ol" : "ul";
  return (
    <div className={`relative ${className}`}>
      <List className="flex flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(0,11rem)_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]"
          >
            <div className="flex min-w-0 items-center gap-2">{item.label}</div>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-6 min-w-0 flex-1">
                <div
                  className={`absolute inset-y-0.5 left-0 rounded-r-[4px] ${item.emphasis === false ? "mark-muted bg-data-muted" : "mark bg-data"}`}
                  style={{ width: `${Math.max((item.value / limit) * 100, item.value > 0 ? 1.5 : 0)}%` }}
                />
                {reference ? (
                  <div
                    aria-hidden="true"
                    className="mark-line absolute inset-y-0 w-px bg-ink-muted"
                    style={{ left: `${(reference.value / limit) * 100}%` }}
                  />
                ) : null}
              </div>
              <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums text-ink">{item.display}</span>
            </div>
            {item.detail ? (
              <div className="col-span-2 -mt-1.5 text-xs text-ink-muted sm:col-start-2">{item.detail}</div>
            ) : null}
          </li>
        ))}
      </List>
      {reference ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-ink-muted">
          <span aria-hidden="true" className="mark-line inline-block h-3 w-px bg-ink-muted" />
          {reference.label}
        </p>
      ) : null}
    </div>
  );
}
