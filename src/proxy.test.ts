import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { proxy } from "./proxy";

const ORIGIN = "https://stats.example.com";

const visit = (path: string, headers: Record<string, string> = {}) =>
  proxy(new NextRequest(new URL(path, ORIGIN), { headers }));

describe("proxy", () => {
  beforeEach(() => {
    vi.stubEnv("FACEIT_PLAYERS", "sacrificed,JACKSONGG");
  });

  it("sends an address without a language to the browser language and keeps the query", () => {
    const response = visit("/players/sacrificed?range=50", { "accept-language": "uk-UA,uk;q=0.9,en;q=0.8" });
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/uk/players/sacrificed?range=50`);
    expect(response.headers.get("vary")).toBe("Accept-Language, Cookie");
  });

  it("prefers the language chosen earlier", () => {
    const response = visit("/", { cookie: "locale=pl", "accept-language": "de-DE" });
    expect(response.headers.get("location")).toBe(`${ORIGIN}/pl`);
  });

  it("ignores a cookie with an unknown language", () => {
    const response = visit("/compare", { cookie: "locale=ru", "accept-language": "fr" });
    expect(response.headers.get("location")).toBe(`${ORIGIN}/fr/compare`);
  });

  it("lowercases the language of the address", () => {
    const response = visit("/EN/compare?a=sacrificed");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/en/compare?a=sacrificed`);
  });

  it("redirects a nickname to its exact spelling", () => {
    const response = visit("/de/players/jacksongg?range=7d");
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(`${ORIGIN}/de/players/JACKSONGG?range=7d`);
  });

  it("answers nicknames outside the squad with the not-found page", () => {
    const response = visit("/en/players/ghost");
    expect(response.headers.get("x-middleware-rewrite")).toBe(`${ORIGIN}/en/__missing__`);
  });

  it("lets every other address through", () => {
    for (const path of ["/en", "/uk/compare", "/pl/players/sacrificed"]) {
      expect(visit(path).headers.get("x-middleware-next")).toBe("1");
    }
  });
});
