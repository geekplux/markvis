import { HERO, PALETTE, WRAP_OPACITY } from "./tokens.js";

export { PALETTE };

export type SeriesStyle = {
  color: string;
  opacity: number;
};

export function seriesStyle(index: number): SeriesStyle {
  const color = PALETTE[index % PALETTE.length]!;
  const opacity = index < PALETTE.length ? 1 : WRAP_OPACITY;
  return { color, opacity };
}

export function seriesColor(index: number): string {
  return seriesStyle(index).color;
}

/**
 * Index of the mark that takes the theme's accent: the first largest
 * positive value. -1 when the theme has no accent or nothing is positive.
 */
export function heroIndex(values: readonly (number | null)[]): number {
  if (HERO.rule !== "max") {
    return -1;
  }
  let best = -1;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (typeof value === "number" && value > 0 && (best < 0 || value > values[best]!)) {
      best = i;
    }
  }
  return best;
}

/** Fill for mark `index`: the accent when it is the hero, else the series color. */
export function heroFill(index: number, hero: number, color: string): string {
  return index === hero ? HERO.color : color;
}
