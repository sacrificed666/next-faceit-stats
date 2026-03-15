import type { SortDirection } from "@/types/faceit";

export default function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction: SortDirection;
}) {
  return (
    <span
      className={`ml-1 text-xs transition-opacity ${active ? "opacity-100" : "opacity-0"}`}
      aria-hidden="true"
    >
      {direction === "asc" ? "▲" : "▼"}
    </span>
  );
}
