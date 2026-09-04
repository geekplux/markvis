/**
 * Okabe–Ito qualitative palette (8 colors), colorblind-friendly.
 * Yellow is last so lines/bars on white keep contrast.
 * Source: Okabe & Ito, "Color Universal Design" (2002/2008).
 */
export const PALETTE = [
  "#0072B2",
  "#D55E00",
  "#009E73",
  "#CC79A7",
  "#56B4E9",
  "#E69F00",
  "#000000",
  "#F0E442",
] as const;

export function seriesColor(index: number): string {
  return PALETTE[index % PALETTE.length]!;
}
