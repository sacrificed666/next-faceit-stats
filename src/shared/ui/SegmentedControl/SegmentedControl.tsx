"use client";

import { useId, type ReactNode } from "react";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: ReactNode;
  title?: string;
}

interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  hideLabel?: boolean;
  fill?: boolean;
  className?: string;
}

const SegmentedControl = <T extends string | number>({
  label,
  options,
  value,
  onChange,
  size = "md",
  hideLabel = true,
  fill = false,
  className = "",
}: SegmentedControlProps<T>) => {
  const name = useId();
  const pad = size === "sm" ? "px-2 py-1 text-xs sm:px-2.5" : "px-3 py-1.5 text-sm";
  return (
    <fieldset className={`min-w-0 ${className}`}>
      <legend className={hideLabel ? "sr-only" : "mb-1.5 text-xs font-semibold text-ink-muted"}>{label}</legend>
      <div className="scrollbar-thin relative flex max-w-full gap-0.5 overflow-x-auto rounded-full bg-inset p-1">
        {options.map((option) => (
          <label
            key={String(option.value)}
            className={fill ? "relative flex-1 text-center" : "relative shrink-0"}
            title={option.title}
          >
            <input
              type="radio"
              name={name}
              value={String(option.value)}
              checked={option.value === value}
              onChange={() => onChange(option.value)}
              className="peer sr-only"
            />
            <span
              className={`choice block cursor-pointer select-none whitespace-nowrap rounded-full font-semibold text-ink-secondary transition-colors duration-150 hover:bg-hover hover:text-ink peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${pad}`}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
};

export default SegmentedControl;
