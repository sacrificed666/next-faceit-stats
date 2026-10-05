export const EFFECTS = ["auto", "full", "reduced"] as const;

export type Effects = (typeof EFFECTS)[number];

export type EffectsLevel = Exclude<Effects, "auto">;

export const EFFECTS_STORAGE_KEY = "effects";

export const RICH_EFFECTS_DEVICES = /Mac|iPhone|iPad|iPod/u;

export const isEffects = (value: unknown): value is Effects =>
  typeof value === "string" && (EFFECTS as readonly string[]).includes(value);

// Blur and hover lifts only on capable Apple devices
export const prefersRichEffects = (userAgent: string, cores: number): boolean =>
  RICH_EFFECTS_DEVICES.test(userAgent) && cores >= 8;

export const resolveEffects = (effects: Effects, rich: boolean): EffectsLevel => {
  if (effects !== "auto") return effects;
  return rich ? "full" : "reduced";
};
