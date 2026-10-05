"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
};

const clientSearch = (): string => window.location.search;

const serverSearch = (): string => "";

export const useSearch = (): string => useSyncExternalStore(subscribe, clientSearch, serverSearch);

export const useSearchParam = (name: string): string | null => new URLSearchParams(useSearch()).get(name);

export const setSearchParams = (updates: Readonly<Record<string, string | null>>): void => {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  for (const listener of listeners) listener();
};
