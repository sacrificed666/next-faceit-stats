import { describe, expect, it } from "vitest";

import { isIndexable, siteUrl } from "@/shared/lib/site";
import { makePlayer } from "@/test/factories";

import { decodeNickname, findPlayer } from "./players";

describe("findPlayer", () => {
  const players = [makePlayer({ nickname: "JACKSONGG" }), makePlayer({ nickname: "z0nGa" })];

  it("finds squad members regardless of the case in the address", () => {
    expect(findPlayer(players, "jacksongg")?.nickname).toBe("JACKSONGG");
    expect(findPlayer(players, "Z0NGA")?.nickname).toBe("z0nGa");
    expect(findPlayer(players, "ghost")).toBeNull();
  });

  it("decodes escaped nicknames and tolerates broken escapes", () => {
    expect(decodeNickname("a%20b")).toBe("a b");
    expect(decodeNickname("100%")).toBe("100%");
  });
});

describe("site address", () => {
  it("prefers an explicit address, then the Vercel production domain", () => {
    expect(siteUrl({ SITE_URL: "https://stats.example.com" }).href).toBe("https://stats.example.com/");
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "next-faceit-stats.vercel.app" }).href).toBe(
      "https://next-faceit-stats.vercel.app/",
    );
    expect(siteUrl({ PORT: "3100" }).href).toBe("http://localhost:3100/");
  });

  it("keeps preview deployments out of search results", () => {
    expect(isIndexable({})).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "production" })).toBe(true);
    expect(isIndexable({ VERCEL_ENV: "preview" })).toBe(false);
  });
});
