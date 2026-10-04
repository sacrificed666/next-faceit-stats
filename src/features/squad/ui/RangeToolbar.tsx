"use client";

import { useId } from "react";

import { DAY_RANGES, MATCH_RANGES, rangeSpec, type Range } from "@/features/squad/model/range";
import { setRange, useRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";

type ToolbarSections = ReadonlyArray<{ id: string; label: string }>;

const NO_SECTIONS: ToolbarSections = [];

interface RangeToolbarProps {
  sections?: ToolbarSections;
}

export function RangeToolbar({ sections = NO_SECTIONS }: RangeToolbarProps) {
  const { t } = useI18n();
  const range = useRange();
  const name = useId();

  function option(value: Range) {
    const spec = rangeSpec(value);
    const title = t(spec.unit === "days" ? "range.option.days" : "range.option.matches", { count: spec.count });
    return (
      <label key={value} className="relative shrink-0" title={title}>
        <input
          type="radio"
          name={name}
          value={value}
          checked={range === value}
          onChange={() => setRange(value)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="choice block min-w-8 cursor-pointer rounded-full px-2 py-1 text-center text-xs font-semibold text-ink-secondary transition-colors duration-150 select-none hover:bg-hover hover:text-ink peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
        >
          {spec.count}
        </span>
        <span className="sr-only">{title}</span>
      </label>
    );
  }

  return (
    <div className="sticky top-3 z-20 flex justify-center">
      <div className="flex max-w-full items-center gap-2 rounded-[1.375rem] border border-line bg-surface/85 py-1 pr-1 pl-3 shadow-card backdrop-blur-md">
        <fieldset className="flex min-w-0 flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
          <legend className="sr-only">{t("range.legend")}</legend>
          <span aria-hidden="true" className="text-sm font-semibold text-ink-muted max-sm:hidden">
            {t("range.last")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5 rounded-full bg-inset p-1">{DAY_RANGES.map(option)}</span>
            <span aria-hidden="true" className="text-xs font-semibold text-ink-muted">
              {t("range.days")}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5 rounded-full bg-inset p-1">{MATCH_RANGES.map(option)}</span>
            <span aria-hidden="true" className="pr-1.5 text-xs font-semibold text-ink-muted">
              {t("range.matches")}
            </span>
          </span>
        </fieldset>
        {sections.length > 0 ? (
          <nav aria-label={t("nav.sections")} className="hidden border-l border-line pl-2 xl:block">
            <ul className="flex items-center">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </div>
  );
}
