/** Ledger default SVG look. Tokens only — no `theme:` field. See docs/visual-spec.md. */

export const SVG_WIDTH = 720;
export const SVG_HEIGHT = 480;
export const SVG_HEIGHT_MAX = 640;
export const PLOT_MIN_RATIO = 0.55;

export const FONT =
  'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';

export const PAPER = "#F7F4EF";
export const INK = "#1C1917";
export const MUTE = "#78716C";
export const HAIRLINE = "#E7E5E4";
export const AXIS = "#A8A29E";
export const TICK = "#57534E";

export const TYPE = {
  title: { size: 17, weight: 600, fill: INK },
  unit: { size: 12, weight: 400, fill: MUTE },
  value: { size: 11, weight: 500, fill: INK },
  tick: { size: 10, weight: 400, fill: TICK },
  note: { size: 11, weight: 400, fill: MUTE },
  legend: { size: 11, weight: 400, fill: INK },
} as const;

export const MARGIN = {
  top: 36,
  right: 20,
  bottom: 26,
  left: 48,
} as const;

/** Extra hues only for extra series / pie slices. Cap 8, then reuse at WRAP_OPACITY. */
export const PALETTE = [
  "#2B6CB0",
  "#C65D2E",
  "#2F8F6B",
  "#B08900",
  "#6B5B95",
  "#8B6B4A",
  "#C44C6A",
  "#4A7C8C",
] as const;

export const WRAP_OPACITY = 0.7;
export const SLICE_GAP = PAPER;

export const TITLE_BASELINE = 24;
export const TITLE_TO_PLOT = 12;
export const TICK_TEXT_GAP = 10;
export const TICK_MARK = 4;
export const LABEL_ROTATE_DEG = -55;
export const LABEL_MIN_GAP = 2;
export const ROTATE_LINE_HEIGHT = 12;
export const MAX_INTERIOR_GRID = 4;

export const BAR_GAP_FEW = 0.28;
export const BAR_GAP_MANY = 0.18;
export const GROUP_GAP_PX = 2;
export const BAR_RX = 2;
export const BAR_MAX_WIDTH = 72;
export const BAR_MAX_WIDTH_N = 4;
export const BAR_LABEL_MIN_WIDTH = 14;
export const BAR_LABEL_INSIDE_H = 28;
export const BAR_LABEL_OFFSET = 8;
export const BAR_LABEL_N_ON = 6;
export const BAR_LABEL_N_OFF = 8;
export const BAR_LABEL_MID_MIN_W = 18;

export const LINE_STROKE = 1.75;
export const LINE_POINT_R = 2.5;
export const POINT_SKIP_AFTER = 40;
export const AREA_OPACITY = 0.14;
export const END_LABEL_SERIES_MAX = 4;
export const END_LABEL_GAP = 8;
export const END_LABEL_MIN_SEP = 14;

export const SCATTER_R = 3;
export const SCATTER_OPACITY = 0.85;

export const PIE_RADIUS_RATIO = 0.34;
export const PIE_STROKE = 1.5;
export const PIE_LEADER = 16;
export const PIE_LABEL_GAP = 12;
export const PIE_LABEL_MIN_SEP = 14;
export const PIE_ELBOW = 8;

export const COMPACT_SPAN = 10_000;
