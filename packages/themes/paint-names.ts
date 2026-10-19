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

/** A CSS custom property an inline chart reads from its page. */
export type CssVariable = `--markvis-${PaintName}` | "--markvis-font";

/**
 * The CSS custom properties an inline chart reads from its page: one per
 * paint name, in the same order, then `--markvis-font` (opt-in: a chart
 * keeps its theme font unless the page sets it). Each falls back to the
 * chart's fixed value.
 */
export const CSS_VARIABLES: readonly CssVariable[] = Object.freeze([
  ...PAINT_NAMES.map((name): CssVariable => `--markvis-${name}`),
  "--markvis-font",
]);
