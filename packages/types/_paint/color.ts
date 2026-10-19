import { hexOf, type Color } from "./paint.js";
import { seriesStyle } from "./palette.js";
import { SEMANTIC } from "./tokens.js";

function hexChannels(color: Color): [number, number, number] {
  const body = hexOf(color).replace("#", "");
  const n = Number.parseInt(body.length === 3 ? body.split("").map((c) => c + c).join("") : body, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * Straight RGB mix from `from` to `to` at t in [0, 1]. A t that is not a
 * number (a value range that overflowed to Infinity) takes the `to` end,
 * as a flat range does; ±Infinity clamps to its own end.
 */
export function mixHex(from: Color, to: Color, t: number): string {
  const a = hexChannels(from);
  const b = hexChannels(to);
  const u = Number.isNaN(t) ? 1 : Math.max(0, Math.min(1, t));
  const ch = (i: number) => Math.round(a[i]! + (b[i]! - a[i]!) * u);
  return `#${[ch(0), ch(1), ch(2)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

/** Sequential ramp shared by heatmap and calendar: the theme's low color to the first series color. */
export function rampFill(t: number): string {
  return mixHex(SEMANTIC.rampLow, seriesStyle(0).color, 0.16 + 0.84 * t);
}
