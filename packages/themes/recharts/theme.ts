/** Recharts-inspired look as tokens only. Same keys as folio; no vendor chart deps. */

import { folio, type ThemeTokens } from "../folio/theme.js";

/**
 * Static SVG grammar: Cartesian XY grid, legend below, stroke 2 / r=3, square bars,
 * light plot border. Steal Recharts chrome, not the npm runtime.
 */
export const recharts = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: 450,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: 0.58,

  FONT: folio.FONT,

  INK: "#374151",
  QUIET: "#6B7280",
  HAIRLINE_OPACITY: "0.14",
  STRUCTURE_OPACITY: "0.28",

  TYPE: {
    title: { size: 16, weight: 600, fill: "#374151" },
    unit: { size: 12, weight: 400, fill: "#6B7280" },
    value: { size: 11, weight: 500, fill: "#374151" },
    tick: { size: 11, weight: 400, fill: "#6B7280" },
    note: { size: 11, weight: 400, fill: "#6B7280" },
    legend: { size: 12, weight: 400, fill: "#374151" },
  },

  MARGIN: {
    top: 32,
    right: 20,
    bottom: 36,
    left: 48,
  },

  /** Classic categorical blues / greens / oranges (distinct hex from other packs). */
  PALETTE: [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
  ],

  WRAP_OPACITY: 0.72,

  TITLE_BASELINE: 22,
  TITLE_TO_PLOT: 14,
  TICK_TEXT_GAP: 8,
  LABEL_ROTATE_DEG: folio.LABEL_ROTATE_DEG,
  LABEL_MIN_GAP: folio.LABEL_MIN_GAP,
  ROTATE_LINE_HEIGHT: folio.ROTATE_LINE_HEIGHT,
  MAX_INTERIOR_GRID: 4,

  BAR_GAP_FEW: 0.26,
  BAR_GAP_MANY: 0.16,
  GROUP_GAP_PX: folio.GROUP_GAP_PX,
  BAR_RX: 0,
  BAR_MAX_WIDTH: 60,
  BAR_MAX_WIDTH_N: folio.BAR_MAX_WIDTH_N,
  BAR_LABEL_MIN_WIDTH: folio.BAR_LABEL_MIN_WIDTH,
  BAR_LABEL_INSIDE_H: folio.BAR_LABEL_INSIDE_H,
  BAR_LABEL_OFFSET: folio.BAR_LABEL_OFFSET,
  BAR_LABEL_N_ON: folio.BAR_LABEL_N_ON,
  BAR_LABEL_N_OFF: folio.BAR_LABEL_N_OFF,
  BAR_LABEL_MID_MIN_W: folio.BAR_LABEL_MID_MIN_W,

  LINE_STROKE: 2,
  LINE_POINT_R: 3,
  POINT_SKIP_AFTER: folio.POINT_SKIP_AFTER,
  AREA_OPACITY: 0.2,
  END_LABEL_SERIES_MAX: 0,
  END_LABEL_GAP: folio.END_LABEL_GAP,
  END_LABEL_MIN_SEP: folio.END_LABEL_MIN_SEP,

  SCATTER_R: folio.SCATTER_R,
  SCATTER_OPACITY: folio.SCATTER_OPACITY,

  PIE_RADIUS_RATIO: folio.PIE_RADIUS_RATIO,
  PIE_STROKE: folio.PIE_STROKE,
  PIE_LEADER: folio.PIE_LEADER,
  PIE_LABEL_GAP: folio.PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP: folio.PIE_LABEL_MIN_SEP,
  PIE_ELBOW: folio.PIE_ELBOW,

  COMPACT_SPAN: folio.COMPACT_SPAN,

  PLOT_BG: "#ffffff",
  PLOT_BORDER: "#e2e8f0",
  PLOT_BORDER_WIDTH: 1,
  AXIS_TITLES: false,
  LEGEND_BELOW: true,
  TITLE_RULE: false,
  VERTICAL_GRID: true,
} as ThemeTokens;
