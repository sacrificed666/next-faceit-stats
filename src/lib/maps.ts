/** Display names for CS2 competitive maps, keyed by internal map name. */
export const MAP_NAMES: Record<string, string> = {
  de_mirage: "Mirage",
  de_dust2: "Dust II",
  de_ancient: "Ancient",
  de_anubis: "Anubis",
  de_nuke: "Nuke",
  de_inferno: "Inferno",
  de_overpass: "Overpass",
  de_train: "Train",
  de_vertigo: "Vertigo",
};

/** Internal map keys for filtering (e.g. `de_mirage`). */
export const VALID_MAPS = Object.keys(MAP_NAMES);

/** `[mapKey, displayName]` pairs for iteration. */
export const MAP_LIST = Object.entries(MAP_NAMES);
