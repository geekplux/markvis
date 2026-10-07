import { PAPER, SEMANTIC } from "./tokens.js";

function channels(hex: string): [number, number, number] {
  const body = hex.replace("#", "");
  const full = body.length === 3 ? body.replace(/./g, "$&$&") : body;
  const n = Number.parseInt(full, 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [0, 0, 0];
}

/** WCAG relative luminance of an opaque color. */
function luminance([r, g, b]: [number, number, number]): number {
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(a: number, b: number): number {
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/**
 * Text ink for a label drawn on a filled mark: whichever of the theme's two
 * inks contrasts more with the fill as seen (at its opacity over the paper).
 * One rule for bars, heatmap cells, and treemap tiles, on every surface.
 */
export function readableInk(fill: string, opacity = 1): string {
  const f = channels(fill);
  const p = channels(PAPER);
  const seen = luminance(
    f.map((c, i) => Math.round(c * opacity + p[i]! * (1 - opacity))) as [number, number, number],
  );
  const onLight = ratio(seen, luminance(channels(SEMANTIC.inkOnLight)));
  const onDark = ratio(seen, luminance(channels(SEMANTIC.inkOnDark)));
  return onLight >= onDark ? SEMANTIC.inkOnLight : SEMANTIC.inkOnDark;
}
