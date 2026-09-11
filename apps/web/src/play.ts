import { PALETTES, THEMES } from "./catalog.js";

const THEME_SET = new Set<string>(THEMES);
const PALETTE_SET = new Set<string>(PALETTES);

export function exampleQuery(search: string): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const value = params.get("example") ?? params.get("id");
  const themeRaw = params.get("theme");
  const paletteRaw = params.get("palette");
  const out = new URLSearchParams();
  if (value) {
    const stem = value.trim().replace(/\.md$/i, "");
    if (stem.length > 0) {
      out.set("example", stem);
    }
  }
  if (themeRaw && THEME_SET.has(themeRaw)) {
    out.set("theme", themeRaw);
  }
  if (paletteRaw && PALETTE_SET.has(paletteRaw)) {
    out.set("palette", paletteRaw);
  }
  const qs = out.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

export function playAppIframeSrc(search: string): string {
  return `/play-app/index.html${exampleQuery(search)}`;
}
