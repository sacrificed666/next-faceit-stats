import type { ReactNode, SelectHTMLAttributes } from "react";

import Icon from "../Icon/Icon";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> {
  leading?: ReactNode;
  className?: string;
}

// A native select as a pill with a chevron and an optional picture at the start
const Select = ({ leading, className = "", children, ...props }: SelectProps) => (
  <span className={`relative flex min-w-0 items-center ${className}`}>
    {leading ? (
      <span aria-hidden="true" className="pointer-events-none absolute left-1.5 flex items-center">
        {leading}
      </span>
    ) : null}
    <select
      {...props}
      className={`h-9 w-full min-w-0 cursor-pointer appearance-none truncate rounded-full border border-line bg-inset pr-9 text-sm font-semibold text-ink transition-colors hover:border-line-strong focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${leading ? "pl-11" : "pl-4"}`}
    >
      {children}
    </select>
    <Icon name="chevronDown" size={16} className="pointer-events-none absolute right-3 text-ink-muted" />
  </span>
);

export default Select;
