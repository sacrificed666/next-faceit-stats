"use client";

interface TooltipEntry {
  name?: string | number;
  value?: string | number | readonly (string | number)[];
  color?: string;
  payload?: Record<string, unknown>;
}

interface Props {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  nameKey?: string;
  labelFormatter?: (label: string | number) => string;
  valueFormatter?: (value: number, name: string, entryPayload?: Record<string, unknown>) => string;
}

export default function CustomTooltip({
  active,
  payload,
  label,
  nameKey,
  labelFormatter,
  valueFormatter,
}: Props): React.ReactElement | null {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-[#141616]/95 border border-white/10 rounded-lg px-3.5 py-2.5 min-w-30">
      {label !== undefined && (
        <p className="text-gray-400 text-xs mb-1.5">
          {labelFormatter ? labelFormatter(label) : String(label)}
        </p>
      )}
      {payload.map((entry, i) => {
        const name = nameKey
          ? String(entry.payload?.[nameKey] ?? entry.name ?? "")
          : String(entry.name ?? "");
        const displayValue = valueFormatter
          ? valueFormatter(Number(entry.value), name, entry.payload)
          : entry.value;

        const dotColor = String(entry.payload?.color ?? entry.color ?? "#fff");

        return (
          <div key={i} className={`flex items-center gap-2 justify-between ${i > 0 ? "mt-1" : ""}`}>
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: dotColor }}
              />
              <span className="text-[13px] text-white/60 truncate">{name}</span>
            </div>
            <span className="text-[13px] text-[#EBEFF3] font-medium tabular-nums ml-3">
              {displayValue}
            </span>
          </div>
        );
      })}
    </div>
  );
}
