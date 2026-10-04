"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function clientSearch(): string {
  return window.location.search;
}

function serverSearch(): string {
  return "";
}

export function useSearch(): string {
  return useSyncExternalStore(subscribe, clientSearch, serverSearch);
}

export function useSearchParam(name: string): string | null {
  return new URLSearchParams(useSearch()).get(name);
}

export function setSearchParams(updates: Readonly<Record<string, string | null>>): void {
  const url = new URL(window.location.href);
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) url.searchParams.delete(key);
    else url.searchParams.set(key, value);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  for (const listener of listeners) listener();
}
