import { PALETTE, WRAP_OPACITY } from "./tokens.js";

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
