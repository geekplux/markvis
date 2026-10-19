/**
 * One way to name and write a color. Every theme color a chart paints is a
 * Paint: its fixed hex value plus the role it plays (ink, a series, the
 * accent). Markup reaches the hex only through `attrs()` / `colorAttr()`, so
 * how a color is written can change in one place.
 */

import { PAINT_NAMES, type PaintName } from "@markvis/themes";

export { PAINT_NAMES, type PaintName };

export type Paint = { readonly hex: string; readonly name: PaintName };

/*
 * What is named, and what stays a fixed color in host mode too (listed for
 * readers under "What does not follow the page" in apps/web/theming.md):
 *
 * - Grid lines, radar rings, and the card outline are `grid`: the ink's
 *   hex, drawn faint (8-32 % opacity), so a page gives `--markvis-grid` a
 *   full-strength color.
 * - The treemap tile gap (`SEMANTIC.cellGap`) is `paper`: every pack sets it
 *   to the surface paper, so gaps follow a dark host page.
 * - Text roles keep their own hex but take the role's name (tick text is
 *   `muted` even where a surface sets `TICK` apart from `QUIET`).
 * - Fixed: `PLOT_BORDER` (a solid pale rule; `grid` is drawn faint, so they
 *   cannot share a host color); `SEMANTIC.rampLow / missing / cellRule` and
 *   every `mixHex` result (heatmap and calendar cells are computed from the
 *   ramp and keep one fixed look together); `readableInk` and
 *   `SEMANTIC.inkOnLight / inkOnDark` (labels on a mark, picked for the fixed
 *   fill under them, which on translucent treemap tiles is not the color a
 *   dark host page shows through).
 * - A line end label darkened for the paper (`legibleOnPaper`) keeps its
 *   series name with the darkened hex as fallback, so a host series color
 *   reaches the label at full strength.
 */

/** A color as paint code passes it around: a named Paint, or a plain value (a computed mix, "none", "url(#…)"). */
export type Color = Paint | string;

/**
 * How colors are written. `static` writes the fixed hex only. `host` also
 * writes a `style` declaration that reads the page's `--markvis-<name>`
 * variable, with the same hex as its fallback, so an inline chart follows the
 * host page and a chart seen as a file (or with styles stripped) still shows
 * the fixed color.
 */
export type ColorMode = "host" | "static";

/** Attributes that carry a color. */
export type ColorKey = "fill" | "stroke" | "stop-color" | "color";

const COLOR_KEYS: ReadonlySet<string> = new Set<ColorKey>([
  "fill",
  "stroke",
  "stop-color",
  "color",
]);

export function paint(name: PaintName, hex: string): Paint {
  return Object.freeze({ hex, name });
}

export function isPaint(value: unknown): value is Paint {
  return typeof value === "object" && value !== null && "hex" in value && "name" in value;
}

/** The fixed value of a color, for color math and comparisons. */
export function hexOf(color: Color): string {
  return typeof color === "string" ? color : color.hex;
}

export function isColorKey(key: string): key is ColorKey {
  return COLOR_KEYS.has(key);
}

/** Paint name of series `index`; palettes cap at eight colors. */
export function seriesPaintName(index: number): PaintName {
  return `series-${(index % 8) + 1}` as PaintName;
}

/** CSS custom property that carries a paint name on the host page. */
export function cssVariable(name: PaintName | "font"): string {
  return `--markvis-${name}`;
}

/**
 * One color as markup: `attr` is `key="#hex"`; in host mode `style` is the
 * matching declaration `key:var(--markvis-<name>,#hex)`, which `attrs()`
 * merges into the element's one `style` attribute.
 */
export function colorAttr(
  key: ColorKey,
  p: Paint,
  mode: ColorMode,
): { attr: string; style: string | undefined } {
  const attr = `${key}="${p.hex}"`;
  return {
    attr,
    style: mode === "host" ? `${key}:var(${cssVariable(p.name)},${p.hex})` : undefined,
  };
}
