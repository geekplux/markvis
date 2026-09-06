/** Highcharts-demo-inspired look as tokens only. Same keys as folio; no vendor deps. */

import { folio, type ThemeTokens } from "../folio/theme.js";

/** Denser plot, stronger grid, legend-friendly series chrome. */
export const highcharts = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: 440,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: 0.62,

  FONT: 'Arial, Helvetica, "Segoe UI", sans-serif',

  INK: "#333333",
  QUIET: "#666666",
  /** Stronger horizontal grid than folio hairline. */
  HAIRLINE_OPACITY: "0.22",
  STRUCTURE_OPACITY: "0.42",

  TYPE: {
    title: { size: 16, weight: 600, fill: "#333333" },
    unit: { size: 12, weight: 400, fill: "#666666" },
    value: { size: 11, weight: 500, fill: "#333333" },
    tick: { size: 11, weight: 400, fill: "#666666" },
    note: { size: 11, weight: 400, fill: "#666666" },
    legend: { size: 12, weight: 500, fill: "#333333" },
  },

  MARGIN: {
    top: 28,
    right: 16,
    bottom: 22,
    left: 44,
  },

  PALETTE: [
    "#7cb5ec",
    "#434348",
    "#90ed7d",
    "#f7a35c",
    "#8085e9",
    "#f15c80",
    "#e4d354",
    "#2b908f",
  ],

  WRAP_OPACITY: 0.75,

  TITLE_BASELINE: 22,
  TITLE_TO_PLOT: 16,
  TICK_TEXT_GAP: 8,
  LABEL_ROTATE_DEG: folio.LABEL_ROTATE_DEG,
  LABEL_MIN_GAP: folio.LABEL_MIN_GAP,
  ROTATE_LINE_HEIGHT: folio.ROTATE_LINE_HEIGHT,
  MAX_INTERIOR_GRID: 5,

  BAR_GAP_FEW: 0.22,
  BAR_GAP_MANY: 0.14,
  GROUP_GAP_PX: folio.GROUP_GAP_PX,
  BAR_RX: 0,
  BAR_MAX_WIDTH: 64,
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
  AREA_OPACITY: 0.28,
  END_LABEL_SERIES_MAX: folio.END_LABEL_SERIES_MAX,
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
} as ThemeTokens;
