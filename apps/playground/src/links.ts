import { isChartTheme, type ChartTheme } from "@markvis/ir";

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

export function galleryHref(id: string, theme?: ChartTheme): string {
  const params = new URLSearchParams();
  params.set("id", stemFromId(id));
  if (theme && theme !== "folio") {
    params.set("theme", theme);
  }
  return `/examples?${params.toString()}`;
}

export function playgroundSearch(id: string, theme?: ChartTheme): string {
  const params = new URLSearchParams();
  params.set("example", stemFromId(id));
  if (theme) {
    params.set("theme", theme);
  }
  return `?${params.toString()}`;
}
