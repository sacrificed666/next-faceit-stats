"use client";

import { useId } from "react";

import { DAY_RANGES, MATCH_RANGES, rangeSpec, type Range } from "@/features/squad/model/range";
import { setRange, useRange } from "@/features/squad/model/useRange";
import { useI18n } from "@/shared/i18n/useI18n";
import Icon from "@/shared/ui/Icon/Icon";

type ToolbarSections = ReadonlyArray<{ id: string; label: string }>;

const NO_SECTIONS: ToolbarSections = [];

interface RangeToolbarProps {
  sections?: ToolbarSections;
}

// Floating toolbar with the range and links to the sections
const RangeToolbar = ({ sections = NO_SECTIONS }: RangeToolbarProps) => {
  const { t } = useI18n();
  const range = useRange();
  const name = useId();
  const menuId = `sections-${useId().replaceAll(":", "")}`;

  // One range as a radio with its full name for screen readers
  const option = (value: Range) => {
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
          className="choice block min-w-7 cursor-pointer rounded-full px-1.5 py-1 text-center text-xs font-semibold max-[24rem]:min-w-6 max-[24rem]:px-1 sm:min-w-8 sm:px-2 text-ink-secondary transition-colors duration-150 select-none hover:bg-hover hover:text-ink peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
        >
          {spec.count}
        </span>
        <span className="sr-only">{title}</span>
      </label>
    );
  };

  return (
    <div className="sticky top-3 z-20 flex justify-center">
      <div className="flex max-w-full items-center gap-1.5 rounded-[1.375rem] border border-line bg-surface/85 py-1 pr-1 pl-2 shadow-card sm:gap-2 sm:pl-3 backdrop-blur-md reduced:bg-surface reduced:backdrop-blur-none">
        <fieldset className="flex min-w-0 flex-wrap items-center justify-center gap-x-1 gap-y-1 sm:gap-x-1.5">
          <legend className="sr-only">{t("range.legend")}</legend>
          <span aria-hidden="true" className="text-sm font-semibold text-ink-muted max-sm:hidden">
            {t("range.last")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5 rounded-full bg-inset p-0.5 sm:p-1">{DAY_RANGES.map(option)}</span>
            <span aria-hidden="true" className="text-[0.6875rem] font-semibold text-ink-muted sm:text-xs">
              {t("range.days")}
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex gap-0.5 rounded-full bg-inset p-0.5 sm:p-1">{MATCH_RANGES.map(option)}</span>
            <span
              aria-hidden="true"
              className="pr-1 text-[0.6875rem] font-semibold text-ink-muted sm:pr-1.5 sm:text-xs"
            >
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
        {/* Below xl the links fold into a menu, so the toolbar stays one row on phones */}
        {sections.length > 0 ? (
          <div className="shrink-0 border-l border-line pl-1 xl:hidden">
            <button
              type="button"
              popoverTarget={menuId}
              aria-label={t("nav.sections")}
              title={t("nav.sections")}
              className="sections-anchor inline-flex size-8 items-center sm:size-9 justify-center rounded-full text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
            >
              <Icon name="list" size={18} />
            </button>
            <nav id={menuId} popover="auto" aria-label={t("nav.sections")} className="sections-panel panel">
              <ul className="flex flex-col">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      onClick={() => document.getElementById(menuId)?.hidePopover()}
                      className="block rounded-[1.125rem] px-3 py-2.5 text-sm font-semibold text-ink-secondary transition-colors hover:bg-hover hover:text-ink"
                    >
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RangeToolbar;
