import { describe, expect, it } from "vitest";

import { isLocale, localePath, negotiateLocale } from "./locales";

describe("locales", () => {
  it("recognises the supported languages", () => {
    expect(isLocale("pl")).toBe(true);
    expect(isLocale("pt")).toBe(false);
    expect(isLocale(null)).toBe(false);
  });

  it("picks the best supported language from Accept-Language", () => {
    expect(negotiateLocale("uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7")).toBe("uk");
    expect(negotiateLocale("pt-BR,pt;q=0.9,es;q=0.8,en;q=0.5")).toBe("es");
    expect(negotiateLocale("en;q=0.5,de-AT;q=0.9")).toBe("de");
    expect(negotiateLocale("NL-be")).toBe("nl");
  });

  it("falls back to English", () => {
    expect(negotiateLocale(null)).toBe("en");
    expect(negotiateLocale("")).toBe("en");
    expect(negotiateLocale("*")).toBe("en");
    expect(negotiateLocale("pt-BR,ja")).toBe("en");
    expect(negotiateLocale("fr;q=0,it;q=abc")).toBe("en");
  });

  it("prefixes paths with the language", () => {
    expect(localePath("uk")).toBe("/uk");
    expect(localePath("de", "/compare")).toBe("/de/compare");
  });
});
