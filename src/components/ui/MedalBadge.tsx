import { MEDAL_COLORS } from "@/lib/colors";

const RANK_LABELS: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };

export default function MedalBadge({ rank }: { rank: number }) {
  if (rank > 3) return null;
  const color = MEDAL_COLORS[rank as 1 | 2 | 3];
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full ml-1.5 shrink-0"
      style={{ backgroundColor: color }}
      role="img"
      aria-label={`${RANK_LABELS[rank]} place`}
    />
  );
}
