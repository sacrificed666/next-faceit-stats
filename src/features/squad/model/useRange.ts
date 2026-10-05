"use client";

import { setSearchParams, useSearchParam } from "@/shared/hooks/useQuery";

import { DEFAULT_RANGE, parseRange, type Range } from "./range";

export const useRange = (): Range => parseRange(useSearchParam("range")) ?? DEFAULT_RANGE;

export const setRange = (range: Range): void => {
  setSearchParams({ range: range === DEFAULT_RANGE ? null : range });
};

export const withRange = <P extends string>(path: P, range: Range): P | `${P}?range=${Range}` =>
  range === DEFAULT_RANGE ? path : `${path}?range=${range}`;
