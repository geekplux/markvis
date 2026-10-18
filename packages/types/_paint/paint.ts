/**
 * One way to name and write a color. Every theme color a chart paints is a
 * Paint: its fixed hex value plus the role it plays (ink, a series, the
 * accent). Markup reaches the hex only through `attrs()` / `colorAttr()`, so
 * how a color is written can change in one place.
 */

import { PAINT_NAMES, type PaintName } from "@markvis/themes";

export { PAINT_NAMES, type PaintName };

export type Paint = { readonly hex: string; readonly name: PaintName };

/** A color as paint code passes it around: a named Paint, or a plain value (a computed mix, "none", "url(#…)"). */
export type Color = Paint | string;

/** How colors are written. Both modes write the fixed hex today. */
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

/** ` key="#hex"`, with a leading space, ready to follow an element name or another attribute. */
export function colorAttr(key: ColorKey, p: Paint, mode: ColorMode): string {
  void mode;
  return ` ${key}="${p.hex}"`;
}
