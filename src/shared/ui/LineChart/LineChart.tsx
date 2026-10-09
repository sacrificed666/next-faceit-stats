"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";

import { position, type Scale } from "@/shared/lib/scale";

import LocalDate from "../LocalDate/LocalDate";

export type SeriesTone = "data" | "context";

export interface ChartSeries {
  id: string;
  label: string;
  tone: SeriesTone;
  values: ReadonlyArray<number | null>;
}

export interface ChartPoint {
  key: string;
  label: string;
  detail?: string;
  timestamp?: number;
}

interface LineChartProps {
  label: string;
  series: readonly ChartSeries[];
  points: readonly ChartPoint[];
  scale: Scale;
  format: (value: number) => string;
  reference?: { value: number; label: string } | null;
  height?: number;
}

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 100;

const TONES: Record<SeriesTone, { stroke: string; width: number; dot: string }> = {
  data: { stroke: "var(--data)", width: 2, dot: "mark bg-data" },
  context: { stroke: "var(--data-muted)", width: 1.5, dot: "mark-muted bg-data-muted" },
};

// Horizontal position of a point, from 0 to 1
const xRatio = (index: number, count: number): number => (count <= 1 ? 0.5 : index / (count - 1));

// An SVG path through the values, with gaps where a value is missing
const linePath = (values: ReadonlyArray<number | null>, count: number, domain: [number, number]): string => {
  let path = "";
  let drawing = false;
  values.forEach((value, index) => {
    if (value === null) {
      drawing = false;
      return;
    }
    const x = xRatio(index, count) * VIEW_WIDTH;
    const y = (1 - position(value, domain)) * VIEW_HEIGHT;
    path += `${drawing ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`;
    drawing = true;
  });
  return path;
};

// The line sample of a legend entry
const LineKey = ({ tone }: { tone: SeriesTone | "reference" }) => {
  if (tone === "reference") {
    return <span aria-hidden="true" className="inline-block w-3 border-t border-dashed border-ink-muted" />;
  }
  return <span aria-hidden="true" className={`inline-block h-0.5 w-3 rounded-full ${TONES[tone].dot}`} />;
};

// A label under the chart, as a date when the point has a time
const AxisLabel = ({ point, align = "start" }: { point: ChartPoint; align?: "start" | "end" }) => {
  const className = `truncate ${align === "end" ? "text-right" : ""}`;
  return point.timestamp === undefined ? (
    <span className={className}>{point.label}</span>
  ) : (
    <LocalDate timestamp={point.timestamp} className={className} />
  );
};

// Legend of the series and the reference line
export const ChartLegend = ({
  series,
  reference,
}: {
  series: ReadonlyArray<{ id: string; label: string; tone: SeriesTone }>;
  reference?: string | null;
}) => (
  <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-secondary">
    {series.map((entry) => (
      <li key={entry.id} className="flex items-center gap-1.5">
        <LineKey tone={entry.tone} />
        {entry.label}
      </li>
    ))}
    {reference ? (
      <li className="flex items-center gap-1.5">
        <LineKey tone="reference" />
        {reference}
      </li>
    ) : null}
  </ul>
);

// SVG line chart with a crosshair, a readout above the plot and a keyboard slider
const LineChart = ({ label, series, points, scale, format, reference = null, height = 220 }: LineChartProps) => {
  const [active, setActive] = useState<number | null>(null);
  const plotRef = useRef<HTMLDivElement>(null);
  const count = points.length;
  const last = Math.max(count - 1, 0);
  const { domain, ticks } = scale;

  // A reading picked by touch stays until the next touch somewhere else
  useEffect(() => {
    if (active === null) return;
    // Clears the reading when a touch lands outside the plot
    const dismiss = (event: globalThis.PointerEvent): void => {
      const inside = event.target instanceof Node && plotRef.current?.contains(event.target);
      if (event.pointerType === "touch" && !inside) setActive(null);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [active]);

  // Moves the crosshair to the match nearest to the pointer
  const onPointer = (event: PointerEvent<HTMLDivElement>): void => {
    if (count === 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = rect.width === 0 ? 0 : (event.clientX - rect.left) / rect.width;
    setActive(Math.min(Math.max(Math.round(ratio * last), 0), last));
  };

  // The spoken value of every series at one match
  const describe = (index: number): string => {
    const target = points[index];
    if (!target) return "";
    const values = series.flatMap((entry) => {
      const value = entry.values[index] ?? null;
      return value === null ? [] : [`${entry.label} ${format(value)}`];
    });
    return `${target.label}${target.detail ? `, ${target.detail}` : ""}: ${values.join(", ")}`;
  };

  const point = active === null ? null : points[active];
  const first = points[0];
  const final = points[count - 1];
  const left = active === null ? 0 : xRatio(active, count) * 100;
  const readings = series.flatMap((entry) => {
    const value = active === null ? null : (entry.values[active] ?? null);
    return value === null ? [] : [{ entry, value }];
  });
  const tooltipAlign = left < 18 ? "translate-x-0" : left > 82 ? "-translate-x-full" : "-translate-x-1/2";

  return (
    <figure className="flex min-w-0 flex-col gap-1.5">
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2">
        <div
          aria-hidden="true"
          className="relative text-right text-[0.6875rem] tabular-nums text-ink-muted"
          style={{ height }}
        >
          {ticks.map((tick) => (
            <span
              key={tick}
              className="absolute right-0 -translate-y-1/2 leading-none"
              style={{ top: `${(1 - position(tick, domain)) * 100}%` }}
            >
              {format(tick)}
            </span>
          ))}
        </div>
        <div className="relative" style={{ height }}>
          <input
            type="range"
            min={0}
            max={last}
            step={1}
            value={active ?? last}
            disabled={count === 0}
            aria-label={label}
            aria-valuetext={describe(active ?? last)}
            onChange={(event) => setActive(Number(event.target.value))}
            onFocus={() => setActive((current) => current ?? last)}
            onBlur={() => setActive(null)}
            className="peer sr-only"
          />
          <div
            ref={plotRef}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={(event) => {
              if (event.pointerType !== "touch") setActive(null);
            }}
            className="absolute inset-0 touch-pan-y rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-accent"
          >
            <svg
              viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full overflow-visible"
            >
              {ticks.map((tick) => {
                const y = (1 - position(tick, domain)) * VIEW_HEIGHT;
                return (
                  <line
                    key={tick}
                    x1={0}
                    x2={VIEW_WIDTH}
                    y1={y}
                    y2={y}
                    stroke={tick === domain[0] ? "var(--axis)" : "var(--grid)"}
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
              {reference ? (
                <line
                  x1={0}
                  x2={VIEW_WIDTH}
                  y1={(1 - position(reference.value, domain)) * VIEW_HEIGHT}
                  y2={(1 - position(reference.value, domain)) * VIEW_HEIGHT}
                  stroke="var(--ink-muted)"
                  strokeWidth={1}
                  strokeDasharray="4 4"
                  vectorEffect="non-scaling-stroke"
                />
              ) : null}
              {series.map((entry) => (
                <path
                  key={entry.id}
                  d={linePath(entry.values, count, domain)}
                  fill="none"
                  stroke={TONES[entry.tone].stroke}
                  strokeWidth={TONES[entry.tone].width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
            {count === 1 && !point
              ? series.flatMap((entry) => {
                  const value = entry.values[0] ?? null;
                  return value === null
                    ? []
                    : [
                        <span
                          key={entry.id}
                          aria-hidden="true"
                          className={`pointer-events-none absolute left-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface ${TONES[entry.tone].dot}`}
                          style={{ top: `${(1 - position(value, domain)) * 100}%` }}
                        />,
                      ];
                })
              : null}
            {point ? (
              <>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 w-px bg-axis"
                  style={{ left: `${left}%` }}
                />
                {readings.map(({ entry, value }) => (
                  <span
                    key={entry.id}
                    aria-hidden="true"
                    className={`pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-surface ${TONES[entry.tone].dot}`}
                    style={{ left: `${left}%`, top: `${(1 - position(value, domain)) * 100}%` }}
                  />
                ))}
                {/* The readout floats above the plot, so it never hides the lines it describes */}
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute bottom-full z-10 mb-1.5 w-max max-w-64 rounded-lg border border-line bg-raised px-2.5 py-1.5 shadow-card ${tooltipAlign}`}
                  style={{ left: `${left}%` }}
                >
                  <p className="truncate text-[0.6875rem] font-semibold text-ink">
                    {point.label}
                    {point.detail ? <span className="font-medium text-ink-muted"> · {point.detail}</span> : null}
                  </p>
                  <ul className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    {readings.map(({ entry, value }) => (
                      <li key={entry.id} className="flex items-center gap-1.5 text-sm font-bold tabular-nums text-ink">
                        <LineKey tone={entry.tone} />
                        {format(value)}
                      </li>
                    ))}
                    {reference ? (
                      <li className="flex items-center gap-1.5 text-xs font-semibold tabular-nums text-ink-secondary">
                        <LineKey tone="reference" />
                        {format(reference.value)}
                      </li>
                    ) : null}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </div>
        <span />
        <div aria-hidden="true" className="mt-1.5 flex justify-between gap-2 text-[0.6875rem] text-ink-muted">
          {first ? <AxisLabel point={first} /> : null}
          {count > 1 && final ? <AxisLabel point={final} align="end" /> : null}
        </div>
      </div>
    </figure>
  );
};

export default LineChart;
