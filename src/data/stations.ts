/**
 * TARS — Station configuration.
 *
 * EVERY playlist URL and ID lives here and only here. Components never
 * hard-code provider URLs.
 *
 * Curation rules (see CLAUDE.md):
 *  - YouTube: prefer official album uploads or auto-generated "Topic"
 *    channel album playlists (IDs starting with OLAK5uy_).
 *  - Verify each video actually allows embedding BEFORE finalising an ID —
 *    some label uploads disable embeds and fail silently.
 *  - Spotify was removed 2026-08-11: its embed only gives 30-second
 *    previews to logged-out listeners, which broke the "radio" promise.
 *
 * An empty ID = placeholder. The UI shows an honest "station not yet
 * tuned" state instead of a broken frame.
 */

export type ViewVariant =
  | "deep-space"
  | "dawn-sea"
  | "desert-night"
  | "inverted-city"
  | "dream-limbo"
  | "wine-dark-sea";

/** How the desk wristwatch behaves on this station — a Nolan time joke. */
export type ClockRule =
  | "normal" // true local time
  | "slow" // Interstellar — time dilation, hands crawl
  | "backward" // Tenet — inverted entropy
  | "frozen" // Oppenheimer — stopped at 05:29, the Trinity test
  | "dream"; // Inception — a faster shadow hand runs beneath

export interface Station {
  id: string;
  name: string;
  film: string;
  description: string;
  /** Main accent — glows, active indicators, view tinting. */
  accentColor: string;
  /** Softer companion tone — gradients, secondary UI. */
  accentSoft: string;
  /** Warm/cold tint of the lamp light pool on the desk. */
  lampTint: string;
  /** Easter-egg location line under EARTH TIME — never a real user location. */
  location: string;
  /** Radio dial frequency label — small per-film nod. */
  radioFrequency: string;
  clockRule: ClockRule;
  /** One-line time rule shown when the wristwatch is clicked. */
  clockRuleLine: string;
  backgroundVariant: ViewVariant;
  youtubePlaylistUrl: string;
  youtubePlaylistId: string;
}

export const STATIONS: Station[] = [
  {
    // id kept stable so returning visitors' saved station still resolves;
    // display name changed twice: NO TIME FOR CAUTION (truncated) → ENDURANCE
    // (rejected) → GARGANTUA
    id: "no-time-for-caution",
    name: "GARGANTUA",
    film: "Interstellar",
    description: "Docking-sequence energy. Peak output.",
    accentColor: "#e8dcc3",
    accentSoft: "#24365c",
    lampTint: "#f0b46a",
    location: "COOPER STATION",
    radioFrequency: "MURPH 90.0",
    clockRule: "slow",
    clockRuleLine: "Time runs slow here. Seven years an hour.",
    backgroundVariant: "deep-space",
    // VERIFIED 2026-08-11 — auto-generated album playlist
    // "Interstellar (Original Motion Picture Soundtrack) [Expanded Edition]";
    // first track oEmbed 200 (embeddable).
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=OLAK5uy_mDWtgeNF9LzujhjNi5DFcX-Lld0_ZMr_s",
    youtubePlaylistId: "OLAK5uy_mDWtgeNF9LzujhjNi5DFcX-Lld0_ZMr_s",
  },
  {
    id: "the-mole",
    name: "ONE HOUR",
    film: "Dunkirk",
    description: "The deadline sprint. One hour in the air.",
    accentColor: "#8ba3b5",
    accentSoft: "#b8a98c",
    lampTint: "#c8d2cc",
    location: "51.03°N 2.37°E",
    radioFrequency: "SEA 1940",
    clockRule: "normal",
    clockRuleLine: "The clock is ticking. It always was.",
    backgroundVariant: "dawn-sea",
    // VERIFIED 2026-08-11 — "Dunkirk (Original Motion Picture Soundtrack)";
    // first track oEmbed 200 (embeddable).
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=OLAK5uy_lECWBkm82utK6TaLwLG5Snsvua5kQHRrE",
    youtubePlaylistId: "OLAK5uy_lECWBkm82utK6TaLwLG5Snsvua5kQHRrE",
  },
  {
    id: "trinity",
    name: "05:29:45",
    film: "Oppenheimer",
    description: "Theory will only take you so far.",
    accentColor: "#d99a4e",
    accentSoft: "#3a3532",
    lampTint: "#e09a50",
    location: "LOS ALAMOS, NM",
    radioFrequency: "05:29 MWT",
    clockRule: "frozen",
    clockRuleLine: "Stopped at 05:29. The moment it worked.",
    backgroundVariant: "desert-night",
    // VERIFIED 2026-08-11 — "Oppenheimer (Original Motion Picture Soundtrack)";
    // first track oEmbed 200 (embeddable).
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=OLAK5uy_mILURVALxTqJ_zGiItm1omaSNWl28HCkw",
    youtubePlaylistId: "OLAK5uy_mILURVALxTqJ_zGiItm1omaSNWl28HCkw",
  },
  {
    id: "the-algorithm",
    name: "INVERSION",
    film: "Tenet",
    description: "Reversed synths for forward progress.",
    accentColor: "#5fb3ad",
    accentSoft: "#3d4a52",
    lampTint: "#7fc4bc",
    location: "OSLO FREEPORT",
    radioFrequency: "TENƎT",
    clockRule: "backward",
    clockRuleLine: "Time runs backward here. Don't try to understand it.",
    backgroundVariant: "inverted-city",
    // VERIFIED 2026-08-11 — "Tenet (Original Motion Picture Soundtrack)
    // (Deluxe Edition)"; first track oEmbed 200 (embeddable).
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=OLAK5uy_n8er07oHS7ucn8gKmAQQSIzOy-4e2sF7s",
    youtubePlaylistId: "OLAK5uy_n8er07oHS7ucn8gKmAQQSIzOy-4e2sF7s",
  },
  {
    id: "limbo",
    name: "LIMBO",
    film: "Inception",
    description: "Fifty years down here. One deadline up there.",
    accentColor: "#c9a86a",
    accentSoft: "#5a6473",
    lampTint: "#e0b070",
    location: "LEVEL 3, SUBLEVEL ∞",
    radioFrequency: "528 · 491",
    clockRule: "dream",
    clockRuleLine: "An hour up there is a lifetime down here.",
    backgroundVariant: "dream-limbo",
    // VERIFIED 2026-08-11 — "Inception (Music from the Motion Picture)";
    // first track oEmbed 200 (embeddable).
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=OLAK5uy_lLmpKhtNs73UW3WXKmsMiEK5p-X96j2h4",
    youtubePlaylistId: "OLAK5uy_lLmpKhtNs73UW3WXKmsMiEK5p-X96j2h4",
  },
  {
    id: "wine-dark-sea",
    name: "TEN YEARS",
    film: "The Odyssey",
    description: "The long haul. No shortcuts home.",
    accentColor: "#9c4a52",
    accentSoft: "#a8845c",
    lampTint: "#d89858",
    location: "ITHACA, VIA EVERYWHERE",
    radioFrequency: "YEAR 10",
    clockRule: "normal",
    clockRuleLine: "Twenty years. The sea doesn't hurry.",
    backgroundVariant: "wine-dark-sea",
    // VERIFIED 2026-08-11 — the score album EXISTS on YouTube:
    // "The Odyssey (Original Motion Picture Soundtrack)";
    // first track oEmbed 200 (embeddable).
    youtubePlaylistUrl:
      "https://www.youtube.com/playlist?list=OLAK5uy_kRTQIEg9CFPcHVIzcKKTJ3TQ_UCrb5dio",
    youtubePlaylistId: "OLAK5uy_kRTQIEg9CFPcHVIzcKKTJ3TQ_UCrb5dio",
  },
];

export const DEFAULT_STATION_ID = STATIONS[0].id;

export function getStation(id: string | null | undefined): Station {
  return STATIONS.find((s) => s.id === id) ?? STATIONS[0];
}
