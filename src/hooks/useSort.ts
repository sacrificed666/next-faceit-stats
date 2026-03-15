import { useState } from "react";
import type { SortDirection } from "@/types/faceit";

interface UseSortReturn<T> {
  sortCol: T;
  sortDir: SortDirection;
  handleSort: (col: T) => void;
  resetSort: (col: T, dir?: SortDirection) => void;
}

/**
 * Manages column sort state with toggle and reset support.
 * Clicking the active column flips direction; clicking a new column resets to `desc`.
 */
export function useSort<T extends string>(
  defaultCol: T,
  defaultDir: SortDirection = "desc",
): UseSortReturn<T> {
  const [sortCol, setSortCol] = useState<T>(defaultCol);
  const [sortDir, setSortDir] = useState<SortDirection>(defaultDir);

  function handleSort(col: T): void {
    if (sortCol === col) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortCol(col);
      setSortDir("desc");
    }
  }

  function resetSort(col: T, dir: SortDirection = "desc"): void {
    setSortCol(col);
    setSortDir(dir);
  }

  return { sortCol, sortDir, handleSort, resetSort };
}
