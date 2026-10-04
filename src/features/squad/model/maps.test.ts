import { describe, expect, it } from "vitest";

import { mapId, mapKey, mapName } from "./maps";

describe("maps", () => {
  it("uses the official names of known maps", () => {
    expect(mapName("de_dust2")).toBe("Dust II");
    expect(mapName("de_mirage")).toBe("Mirage");
  });

  it("builds readable names for maps it does not know yet", () => {
    expect(mapName("de_eldorado")).toBe("Eldorado");
    expect(mapName("de_some_new_map")).toBe("Some New Map");
  });

  it("matches FACEIT segment labels to match map keys", () => {
    expect(mapId("de_dust2")).toBe(mapId("Dust 2"));
    expect(mapKey("Dust2")).toBe("de_dust2");
    expect(mapKey("Mirage")).toBe("de_mirage");
    expect(mapKey("Poseidon")).toBe("de_poseidon");
  });
});
