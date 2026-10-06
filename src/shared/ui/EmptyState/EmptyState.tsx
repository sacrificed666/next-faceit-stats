import type { ReactNode } from "react";

import Icon, { type IconName } from "../Icon/Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  className?: string;
}

// A short note for a section with nothing to show
const EmptyState = ({ icon = "info", title, children, className = "" }: EmptyStateProps) => (
  <div
    className={`flex flex-col items-center justify-center gap-3 px-5 py-6 text-center sm:flex-row sm:text-left ${className}`}
  >
    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-inset text-ink-muted">
      <Icon name={icon} size={20} />
    </span>
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="font-semibold text-ink">{title}</p>
      {children ? <div className="max-w-md text-sm text-ink-muted">{children}</div> : null}
    </div>
  </div>
);

export default EmptyState;
