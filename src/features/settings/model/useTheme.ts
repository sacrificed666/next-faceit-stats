"use client";

import { useSyncExternalStore } from "react";

import { THEME_STORAGE_KEY, themeColorFor, type ThemePreference } from "@/shared/lib/theme";

const listeners = new Set<() => void>();

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const getSnapshot = (): ThemePreference => {
  const theme = document.documentElement.dataset.theme;
  return theme === "light" || theme === "dark" ? theme : "system";
};

const getServerSnapshot = (): ThemePreference => "system";

const persist = (preference: ThemePreference): void => {
  try {
    if (preference === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    return;
  }
};

export const setTheme = (preference: ThemePreference): void => {
  const root = document.documentElement;
  if (preference === "system") delete root.dataset.theme;
  else root.dataset.theme = preference;
  persist(preference);
  for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
    meta.content = themeColorFor(preference, meta.media);
  }
  for (const listener of listeners) listener();
};

export const useTheme = (): ThemePreference => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
