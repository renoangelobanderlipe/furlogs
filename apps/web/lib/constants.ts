export const SITE_URL = "https://furlogs.reno-is.dev";

/** Canonical species-to-emoji map. Use `?? '🐾'` as fallback for unknown species. */
export const SPECIES_EMOJI: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  bird: "🦜",
  rabbit: "🐇",
  fish: "🐟",
  hamster: "🐹",
  reptile: "🦎",
  "guinea pig": "🐹",
  other: "🐾",
};
