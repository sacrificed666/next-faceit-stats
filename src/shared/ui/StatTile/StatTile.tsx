import type { ReactNode } from "react";

interface StatTileProps {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  delta?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

// A label and a value with an optional difference and detail
const StatTile = ({ label, value, detail, delta, icon, className = "" }: StatTileProps) => (
  <div className={`panel flex min-w-0 flex-col gap-1 p-4 ${className}`}>
    <dt className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
      {icon}
      {label}
    </dt>
    <dd className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="truncate text-2xl font-bold tracking-tight text-ink sm:text-[1.625rem]">{value}</span>
      {delta}
    </dd>
    {detail ? <dd className="text-xs text-pretty text-ink-muted">{detail}</dd> : null}
  </div>
);

export default StatTile;
