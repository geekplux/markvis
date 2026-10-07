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
/** WCAG AA for text of chart label sizes (under 18px regular / 14px bold). */
export const TEXT_CONTRAST = 4.5;

export function readableInk(fill: string, opacity = 1): string {
  const f = channels(fill);
  const p = channels(PAPER);
  const seen = luminance(
    f.map((c, i) => Math.round(c * opacity + p[i]! * (1 - opacity))) as [number, number, number],
  );
  const onLight = ratio(seen, luminance(channels(SEMANTIC.inkOnLight)));
  const onDark = ratio(seen, luminance(channels(SEMANTIC.inkOnDark)));
  if (Math.max(onLight, onDark) >= TEXT_CONTRAST) {
    return onLight >= onDark ? SEMANTIC.inkOnLight : SEMANTIC.inkOnDark;
  }
  // A mid-tone fill neither theme ink clears: fall back to pure black or white.
  return ratio(seen, 0) >= ratio(seen, 1) ? "#000000" : "#ffffff";
}

function mix(a: [number, number, number], b: [number, number, number], t: number) {
  return a.map((c, i) => Math.round(c + (b[i]! - c) * t)) as [number, number, number];
}

function hex([r, g, b]: [number, number, number]): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * A series color used as text on the paper, moved toward the ink just far
 * enough to read (4.5:1), so the label keeps its hue.
 */
export function legibleOnPaper(color: string, paper: string = PAPER): string {
  const c = channels(color);
  const p = luminance(channels(paper));
  const toward = channels(p > 0.4 ? SEMANTIC.inkOnLight : SEMANTIC.inkOnDark);
  for (let step = 0; step <= 10; step++) {
    const candidate = mix(c, toward, step / 10);
    if (ratio(luminance(candidate), p) >= TEXT_CONTRAST) {
      return step === 0 ? color : hex(candidate);
    }
  }
  return hex(toward);
}
