import {
  isChartPalette,
  isChartTheme,
  type ChartPalette,
  type ChartTheme,
  PALETTES,
  THEMES,
} from "@markvis/ir";

export { THEMES, PALETTES };
export type { ChartTheme, ChartPalette };

export const SURFACES = ["light", "dark", "export"] as const;
export type ChartSurface = (typeof SURFACES)[number];

export function isChartSurface(value: string): value is ChartSurface {
  return (SURFACES as readonly string[]).includes(value);
}

const FENCE_RE =
  /(```(?:chart|markvis|vis)[ \t]*\r?\n)([\s\S]*?)(\r?\n```)/;

const THEME_HEADER_RE = /^[ \t]*theme:[ \t]*(\S+)[ \t]*$/m;
const PALETTE_HEADER_RE = /^[ \t]*palette:[ \t]*(\S+)[ \t]*$/m;
const SURFACE_HEADER_RE = /^[ \t]*surface:[ \t]*(\S+)[ \t]*$/m;

export function readThemeFromFence(source: string): ChartTheme {
  const body = fenceBodyOrSource(source);
  const match = body.match(THEME_HEADER_RE);
  const raw = match?.[1];
  if (raw && isChartTheme(raw)) {
    return raw;
  }
  return "folio";
}

/** null = omitted (theme default colors). */
export function readPaletteFromFence(source: string): ChartPalette | null {
  const body = fenceBodyOrSource(source);
  const match = body.match(PALETTE_HEADER_RE);
  const raw = match?.[1];
  if (raw && isChartPalette(raw)) {
    return raw;
  }
  return null;
}

/** Omitted or unknown reads as light, the SPEC default. */
export function readSurfaceFromFence(source: string): ChartSurface {
  const body = fenceBodyOrSource(source);
  const raw = body.match(SURFACE_HEADER_RE)?.[1];
  return raw && isChartSurface(raw) ? raw : "light";
}

/** light removes surface: so the default applies. */
export function rewriteSurfaceInFence(
  source: string,
  surface: ChartSurface,
): string {
  if (!isChartSurface(surface)) {
    return source;
  }
  const match = FENCE_RE.exec(source);
  if (!match || match.index === undefined) {
    return rewriteSurfaceInBody(source, surface);
  }
  const [full, open, body, close] = match;
  return (
    source.slice(0, match.index) +
    open +
    rewriteSurfaceInBody(body, surface) +
    close +
    source.slice(match.index + full.length)
  );
}

export function rewriteThemeInFence(
  source: string,
  theme: ChartTheme,
): string {
  if (!isChartTheme(theme)) {
    return source;
  }
  const match = FENCE_RE.exec(source);
  if (!match || match.index === undefined) {
    return rewriteThemeInBody(source, theme);
  }
  const [full, open, body, close] = match;
  const nextBody = rewriteThemeInBody(body, theme);
  return (
    source.slice(0, match.index) +
    open +
    nextBody +
    close +
    source.slice(match.index + full.length)
  );
}

/** null / undefined removes palette: so the theme default colors apply. */
export function rewritePaletteInFence(
  source: string,
  palette: ChartPalette | null,
): string {
  if (palette !== null && !isChartPalette(palette)) {
    return source;
  }
  const match = FENCE_RE.exec(source);
  if (!match || match.index === undefined) {
    return rewritePaletteInBody(source, palette);
  }
  const [full, open, body, close] = match;
  const nextBody = rewritePaletteInBody(body, palette);
  return (
    source.slice(0, match.index) +
    open +
    nextBody +
    close +
    source.slice(match.index + full.length)
  );
}

function fenceBodyOrSource(source: string): string {
  const match = FENCE_RE.exec(source);
  return match?.[2] ?? source;
}

function rewriteThemeInBody(body: string, theme: ChartTheme): string {
  if (THEME_HEADER_RE.test(body)) {
    return body.replace(THEME_HEADER_RE, `theme: ${theme}`);
  }
  if (/^[ \t]*markvis:[ \t]*.*$/m.test(body)) {
    return body.replace(
      /^[ \t]*markvis:[ \t]*.*$/m,
      (line) => `${line}\ntheme: ${theme}`,
    );
  }
  if (body.length === 0) {
    return `theme: ${theme}`;
  }
  return `theme: ${theme}\n${body}`;
}

function rewritePaletteInBody(
  body: string,
  palette: ChartPalette | null,
): string {
  if (palette === null) {
    return body
      .replace(/^[ \t]*palette:[ \t]*\S+[ \t]*\r?\n?/m, "")
      .replace(/\n{3,}/g, "\n\n");
  }
  if (PALETTE_HEADER_RE.test(body)) {
    return body.replace(PALETTE_HEADER_RE, `palette: ${palette}`);
  }
  if (THEME_HEADER_RE.test(body)) {
    return body.replace(
      THEME_HEADER_RE,
      (line) => `${line}\npalette: ${palette}`,
    );
  }
  if (/^[ \t]*markvis:[ \t]*.*$/m.test(body)) {
    return body.replace(
      /^[ \t]*markvis:[ \t]*.*$/m,
      (line) => `${line}\npalette: ${palette}`,
    );
  }
  if (body.length === 0) {
    return `palette: ${palette}`;
  }
  return `palette: ${palette}\n${body}`;
}

function rewriteSurfaceInBody(body: string, surface: ChartSurface): string {
  if (surface === "light") {
    return body
      .replace(/^[ \t]*surface:[ \t]*\S+[ \t]*\r?\n?/m, "")
      .replace(/\n{3,}/g, "\n\n");
  }
  if (SURFACE_HEADER_RE.test(body)) {
    return body.replace(SURFACE_HEADER_RE, `surface: ${surface}`);
  }
  for (const anchor of [PALETTE_HEADER_RE, THEME_HEADER_RE]) {
    if (anchor.test(body)) {
      return body.replace(anchor, (line) => `${line}\nsurface: ${surface}`);
    }
  }
  if (body.length === 0) {
    return `surface: ${surface}`;
  }
  return `surface: ${surface}\n${body}`;
}
