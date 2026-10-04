"use client";

import { useEffect } from "react";

export function QueryReady() {
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      delete document.documentElement.dataset.pending;
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return null;
}
