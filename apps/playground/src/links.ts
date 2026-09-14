import {
  isChartPalette,
  isChartTheme,
  type ChartPalette,
  type ChartTheme,
} from "@markvis/ir";

export function stemFromId(value: string): string {
  return value.replace(/\.md$/i, "");
}

export function exampleIdFromSearch(search: string): string | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const value = params.get("example") ?? params.get("id");
  if (!value) {
    return null;
  }
  const stem = stemFromId(value.trim());
  return stem.length > 0 ? stem : null;
}

export function themeFromSearch(search: string): ChartTheme | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const value = params.get("theme");
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return isChartTheme(trimmed) ? trimmed : null;
}

export function paletteFromSearch(search: string): ChartPalette | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const value = params.get("palette");
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return isChartPalette(trimmed) ? trimmed : null;
}

export function galleryHref(
  id: string,
  theme?: ChartTheme,
  palette?: ChartPalette | null,
): string {
  const params = new URLSearchParams();
  params.set("id", stemFromId(id));
  if (theme && theme !== "folio") {
    params.set("theme", theme);
  }
  if (palette) {
    params.set("palette", palette);
  }
  return `/examples?${params.toString()}`;
}

export function playgroundSearch(
  id: string,
  theme?: ChartTheme,
  palette?: ChartPalette | null,
): string {
  const params = new URLSearchParams();
  params.set("example", stemFromId(id));
  if (theme) {
    params.set("theme", theme);
  }
  if (palette) {
    params.set("palette", palette);
  }
  return `?${params.toString()}`;
}
