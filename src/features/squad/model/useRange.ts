"use client";

import { setSearchParams, useSearchParam } from "@/shared/hooks/useQuery";

import { DEFAULT_RANGE, parseRange, type Range } from "./range";

export function useRange(): Range {
  return parseRange(useSearchParam("range")) ?? DEFAULT_RANGE;
}

export function setRange(range: Range): void {
  setSearchParams({ range: range === DEFAULT_RANGE ? null : range });
}

export function withRange<P extends string>(path: P, range: Range): P | `${P}?range=${Range}` {
  return range === DEFAULT_RANGE ? path : `${path}?range=${range}`;
}
