import type { ReactNode } from "react";

import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  children?: ReactNode;
  className?: string;
}

export function EmptyState({ icon = "info", title, children, className = "" }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-2 px-6 py-10 text-center ${className}`}>
      <span className="inline-flex size-10 items-center justify-center rounded-full bg-inset text-ink-muted">
        <Icon name={icon} size={20} />
      </span>
      <p className="font-semibold text-ink">{title}</p>
      {children ? <div className="max-w-md text-sm text-ink-muted">{children}</div> : null}
    </div>
  );
}
