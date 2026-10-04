"use client";

import { useState } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState<K extends string> {
  key: K;
  direction: SortDirection;
}

export function useSort<K extends string>(initial: K, initialDirection: SortDirection = "desc") {
  const [sort, setSort] = useState<SortState<K>>({ key: initial, direction: initialDirection });

  function toggle(key: K): void {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === "desc" ? "asc" : "desc" }
        : { key, direction: "desc" },
    );
  }

  return { sort, toggle };
}

export function compareBy<T>(value: (item: T) => number, direction: SortDirection): (a: T, b: T) => number {
  return (a, b) => (direction === "desc" ? value(b) - value(a) : value(a) - value(b));
}
