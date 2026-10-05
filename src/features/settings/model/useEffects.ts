"use client";

import { useSyncExternalStore } from "react";

import {
  EFFECTS_STORAGE_KEY,
  isEffects,
  prefersRichEffects,
  resolveEffects,
  type Effects,
  type EffectsLevel,
} from "@/shared/lib/effects";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): Effects => {
  try {
    const stored = localStorage.getItem(EFFECTS_STORAGE_KEY);
    return isEffects(stored) ? stored : "auto";
  } catch {
    return "auto";
  }
};

const getServerSnapshot = (): Effects => "auto";

const persist = (preference: Effects): void => {
  try {
    if (preference === "auto") localStorage.removeItem(EFFECTS_STORAGE_KEY);
    else localStorage.setItem(EFFECTS_STORAGE_KEY, preference);
  } catch {
    return;
  }
};

export const deviceEffects = (): EffectsLevel =>
  resolveEffects("auto", prefersRichEffects(navigator.userAgent, navigator.hardwareConcurrency));

export const setEffects = (preference: Effects): void => {
  document.documentElement.dataset.effects = preference === "auto" ? deviceEffects() : preference;
  persist(preference);
  for (const listener of listeners) listener();
};

export const useEffects = (): Effects => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export const useDeviceEffects = (): EffectsLevel | null => useSyncExternalStore(subscribe, deviceEffects, () => null);
