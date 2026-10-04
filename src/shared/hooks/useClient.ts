"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

function subscribeNever(): () => void {
  return () => {};
}

function browserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function serverTimeZone(): string {
  return "UTC";
}

export function useTimeZone(): string {
  return useSyncExternalStore(subscribeNever, browserTimeZone, serverTimeZone);
}

let now = 0;

function subscribeMinutes(listener: () => void): () => void {
  now = Date.now();
  const timer = window.setInterval(() => {
    now = Date.now();
    listener();
  }, MINUTE);
  return () => window.clearInterval(timer);
}

function clientNow(): number {
  if (now === 0) now = Date.now();
  return now;
}

function serverNow(): null {
  return null;
}

export function useNow(): number | null {
  return useSyncExternalStore(subscribeMinutes, clientNow, serverNow);
}
