import { MEDAL_COLORS } from "@/lib/colors";
import { UNRANKED } from "@/lib/constants";

interface RankedEntry {
  nickname: string;
  rank: number;
}

interface Props {
  /** Injected by Recharts via element cloning */
  x?: number;
  /** Injected by Recharts via element cloning */
  y?: number;
  /** Injected by Recharts via element cloning */
  payload?: { value: string };
  /** Chart data entries with rank info for medal rendering */
  data: RankedEntry[];
  isMobile: boolean;
}

/**
 * Custom Recharts YAxis tick that renders player names with medal indicators.
 * Pass as a React element to Recharts `tick` prop — Recharts clones and injects x/y/payload.
 */
export default function RankedYAxisTick({
  x = 0,
  y = 0,
  payload,
  data,
  isMobile,
}: Props): React.ReactElement {
  const entry = data.find((d) => d.nickname === payload?.value);
  const rank = entry?.rank ?? UNRANKED;
  const medalColor = rank <= 3 ? MEDAL_COLORS[rank as 1 | 2 | 3] : undefined;

  return (
    <g transform={`translate(${x},${y})`}>
      {medalColor && <circle cx={isMobile ? -88 : -138} cy={0} r={4} fill={medalColor} />}
      <text x={-6} y={0} dy={4} textAnchor="end" fill="#e5e7eb" fontSize={isMobile ? 11 : 13}>
        {payload?.value}
      </text>
    </g>
  );
}
