"use client";

import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

const subscribeNever = (): (() => void) => () => {};

const browserTimeZone = (): string => Intl.DateTimeFormat().resolvedOptions().timeZone;

const serverTimeZone = (): string => "UTC";

export const useTimeZone = (): string => useSyncExternalStore(subscribeNever, browserTimeZone, serverTimeZone);

let now = 0;

const subscribeMinutes = (listener: () => void): (() => void) => {
  now = Date.now();
  const timer = window.setInterval(() => {
    now = Date.now();
    listener();
  }, MINUTE);
  return () => window.clearInterval(timer);
};

const clientNow = (): number => {
  if (now === 0) now = Date.now();
  return now;
};

const serverNow = (): null => null;

export const useNow = (): number | null => useSyncExternalStore(subscribeMinutes, clientNow, serverNow);
