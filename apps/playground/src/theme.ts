import {
  isChartPalette,
  isChartTheme,
  type ChartPalette,
  type ChartTheme,
  PALETTES,
  THEMES,
} from "@markvis/ir";
import { readChartField, setChartField } from "@markvis/parser";

export { THEMES, PALETTES };
export type { ChartTheme, ChartPalette };

export const SURFACES = ["light", "dark", "export"] as const;
export type ChartSurface = (typeof SURFACES)[number];

export function isChartSurface(value: string): value is ChartSurface {
  return (SURFACES as readonly string[]).includes(value);
}

/**
 * Theme, Color, and Surface edit the first chart's own fields, in a fence
 * header or inside a `<!-- chart: … -->` comment, so the copied source
 * always says what the preview shows.
 */
export function readThemeFromFence(source: string): ChartTheme {
  const raw = readChartField(source, "theme");
  return raw && isChartTheme(raw) ? raw : "folio";
}

/** null = omitted (theme default colors). */
export function readPaletteFromFence(source: string): ChartPalette | null {
  const raw = readChartField(source, "palette");
  return raw && isChartPalette(raw) ? raw : null;
}

/** Omitted or unknown reads as light, the SPEC default. */
export function readSurfaceFromFence(source: string): ChartSurface {
  const raw = readChartField(source, "surface");
  return raw && isChartSurface(raw) ? raw : "light";
}

export function rewriteThemeInFence(source: string, theme: ChartTheme): string {
  return isChartTheme(theme) ? setChartField(source, "theme", theme) : source;
}

/** null / undefined removes palette: so the theme default colors apply. */
export function rewritePaletteInFence(
  source: string,
  palette: ChartPalette | null,
): string {
  if (palette !== null && !isChartPalette(palette)) {
    return source;
  }
  return setChartField(source, "palette", palette);
}

/** light removes surface: so the default applies. */
export function rewriteSurfaceInFence(
  source: string,
  surface: ChartSurface,
): string {
  if (!isChartSurface(surface)) {
    return source;
  }
  return setChartField(source, "surface", surface === "light" ? null : surface);
}
