/** Ant Design Charts–inspired look as tokens only. Same keys as folio; no @antv/g2 dep. */

import { SEMANTIC_LIGHT, folio, type ThemeTokens } from "../folio/theme.js";

/**
 * Static SVG grammar: technical axes, muted teal/brick categorical, tight padding,
 * annotation-friendly title. Steal Ant Design Charts chrome, not G2 runtime.
 */
export const ant = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: 420,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: 0.6,

  FONT: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  FONT_NUMERIC: folio.FONT_NUMERIC,

  INK: "#262626",
  QUIET: "#8C8C8C",
  HAIRLINE_OPACITY: "0.2",
  STRUCTURE_OPACITY: "0.32",

  TYPE: {
    title: { size: 17, weight: 600, fill: "#262626" },
    unit: { size: 12, weight: 400, fill: "#8C8C8C" },
    value: { size: 12, weight: 400, fill: "#262626" },
    tick: { size: 12, weight: 400, fill: "#8C8C8C" },
    note: { size: 12, weight: 400, fill: "#8C8C8C" },
    legend: { size: 12, weight: 400, fill: "#262626" },
  },

  /** Tight padding; room for axis titles + legend. */
  MARGIN: {
    top: 28,
    right: 14,
    bottom: 28,
    left: 48,
  },

  /** Muted teal / brick categorical (Ant Design Charts demo hues). */
  PALETTE: [
    "#5AD8A6",
    "#E8684A",
    "#5D7092",
    "#F6BD16",
    "#6DC8EC",
    "#9270CA",
    "#FF9D4D",
    "#269A99",
  ],

  WRAP_OPACITY: 0.7,

  TITLE: folio.TITLE,
  TITLE_BASELINE: 26,
  TITLE_TO_PLOT: 20,
  TICK_TEXT_GAP: 8,
  LABEL_ROTATE_DEG: folio.LABEL_ROTATE_DEG,
  LABEL_MIN_GAP: folio.LABEL_MIN_GAP,
  ROTATE_LINE_HEIGHT: folio.ROTATE_LINE_HEIGHT,
  MAX_INTERIOR_GRID: 4,

  BAR_GAP_FEW: 0.24,
  BAR_GAP_MANY: 0.14,
  GROUP_GAP_PX: folio.GROUP_GAP_PX,
  BAR_RX: 2,
  BAR_MAX_WIDTH: 56,
  BAR_MAX_WIDTH_N: folio.BAR_MAX_WIDTH_N,
  BAR_LABEL_MIN_WIDTH: folio.BAR_LABEL_MIN_WIDTH,
  BAR_LABEL_INSIDE_H: folio.BAR_LABEL_INSIDE_H,
  BAR_LABEL_OFFSET: folio.BAR_LABEL_OFFSET,
  BAR_LABEL_N_ON: folio.BAR_LABEL_N_ON,
  BAR_LABEL_N_OFF: folio.BAR_LABEL_N_OFF,
  BAR_LABEL_MID_MIN_W: folio.BAR_LABEL_MID_MIN_W,

  LINE_STROKE: 2,
  LINE_POINT_R: 3.5,
  POINT_SKIP_AFTER: folio.POINT_SKIP_AFTER,
  AREA_OPACITY: 0.25,
  END_LABEL_SERIES_MAX: 0,
  END_LABEL_GAP: folio.END_LABEL_GAP,
  END_LABEL_MIN_SEP: folio.END_LABEL_MIN_SEP,
  LINE_CURVE: folio.LINE_CURVE,
  MARKER: "halo",
  SERIES_DASH: [""],

  SCATTER_R: folio.SCATTER_R,
  SCATTER_OPACITY: folio.SCATTER_OPACITY,
  SCATTER_MARK: "circle",

  PIE_RADIUS_RATIO: folio.PIE_RADIUS_RATIO,
  PIE_STROKE: folio.PIE_STROKE,
  PIE_LEADER: folio.PIE_LEADER,
  PIE_LABEL_GAP: folio.PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP: folio.PIE_LABEL_MIN_SEP,
  PIE_ELBOW: folio.PIE_ELBOW,
  PIE_LABEL_MODE: "leaders",
  PIE_INNER_RATIO: 0,

  COMPACT_SPAN: folio.COMPACT_SPAN,

  PLOT_BG: null,
  PLOT_BORDER: null,
  PLOT_BORDER_WIDTH: 0,
  AXIS_TITLES: true,
  LEGEND_BELOW: false,
  TITLE_RULE: false,
  GRID: { dash: "4 4", width: 1, axes: "y" },
  AXIS: { line: "baseline", tick: 4 },
  LEGEND: { swatch: "circle", align: "start" },
  FRAME: folio.FRAME,

  SURFACES: {
    light: { PLATE: null, PAPER: "#ffffff", SEMANTIC: { ...SEMANTIC_LIGHT, inkOnLight: "#262626" } },
    dark: {
      PLATE: "#141414",
      PAPER: "#141414",
      INK: "#e8e8e8",
      QUIET: "#8c8c8c",
      TICK: "#a6a6a6",
      HAIRLINE_OPACITY: "0.16",
      SEMANTIC: {
        ...SEMANTIC_LIGHT,
        up: "#2DD4BF",
        down: "#FB7185",
        total: "#e8e8e8",
        rampLow: "#1f1f1f",
        missing: "#434343",
        cellRule: "#303030",
        cellGap: "#141414",
      },
    },
    export: { PLATE: "#ffffff", PAPER: "#ffffff", SEMANTIC: { ...SEMANTIC_LIGHT, inkOnLight: "#262626" } },
  },
} as const satisfies ThemeTokens;
