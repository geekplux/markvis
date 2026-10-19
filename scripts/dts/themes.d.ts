export type ThemeTokens = Record<string, unknown>;
export type PaletteTokens = Record<string, unknown>;

export declare const folio: ThemeTokens;
export declare const highcharts: ThemeTokens;
export declare const shadcn: ThemeTokens;
export declare const docs: ThemeTokens;
export declare const ant: ThemeTokens;
export declare const recharts: ThemeTokens;
export declare const graphite: ThemeTokens;
export declare const themeRegistry: Record<string, ThemeTokens>;
export declare function resolveThemePack(id: string): ThemeTokens;
export declare function applyPaletteToTheme(
  theme: ThemeTokens,
  palette: PaletteTokens,
): ThemeTokens;
export declare const cool: PaletteTokens;
export declare const ink: PaletteTokens;
export declare const porcelain: PaletteTokens;
export declare const vivid: PaletteTokens;
export declare const warm: PaletteTokens;
export declare const paletteRegistry: Record<string, PaletteTokens>;
export declare function resolvePalette(id: string): PaletteTokens;

/** The names of the colors a chart paints with, in a fixed order. */
export declare const PAINT_NAMES: readonly [
  "ink",
  "muted",
  "grid",
  "paper",
  "plate",
  "plot",
  "series-1",
  "series-2",
  "series-3",
  "series-4",
  "series-5",
  "series-6",
  "series-7",
  "series-8",
  "accent",
  "up",
  "down",
  "total",
];
export type PaintName = (typeof PAINT_NAMES)[number];
/** A CSS custom property an inline chart reads from its page. */
export type CssVariable = `--markvis-${PaintName}` | "--markvis-font";
/**
 * The CSS custom properties an inline chart reads from its page: one per
 * paint name, then `--markvis-font`. Each falls back to the chart's fixed
 * value.
 */
export declare const CSS_VARIABLES: readonly CssVariable[];
