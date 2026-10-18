/**
 * The names of the colors a chart paints with, in a fixed order. Each live
 * color token carries one of these names next to its hex value, so a
 * renderer can tie a painted color to the role it plays.
 */
export const PAINT_NAMES = [
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
] as const;

export type PaintName = (typeof PAINT_NAMES)[number];
