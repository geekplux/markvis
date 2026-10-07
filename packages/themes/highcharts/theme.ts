/** Highcharts-demo-inspired look as tokens only. Same keys as folio; no vendor deps. */

import { SEMANTIC_LIGHT, folio, type ThemeTokens } from "../folio/theme.js";

/**
 * Static SVG grammar (START §3.1): denser grid, plot border/bg, axis titles,
 * legend for series≥2 (END_LABEL_SERIES_MAX: 0), line markers. No Highcharts runtime.
 */
export const highcharts = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: 440,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: 0.62,

  FONT: '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif',
  FONT_NUMERIC: folio.FONT_NUMERIC,

  INK: "#333333",
  QUIET: "#666666",
  /** Stronger horizontal grid than folio hairline. */
  HAIRLINE_OPACITY: "0.14",
  STRUCTURE_OPACITY: "0.42",

  TYPE: {
    title: { size: 18, weight: 400, fill: "#333333" },
    unit: { size: 12, weight: 400, fill: "#666666" },
    value: { size: 11, weight: 700, fill: "#333333" },
    tick: { size: 11, weight: 400, fill: "#666666" },
    note: { size: 11, weight: 400, fill: "#666666" },
    legend: { size: 12, weight: 700, fill: "#333333" },
  },

  /** Legend-friendly + room for axis titles. */
  MARGIN: {
    top: 36,
    right: 20,
    bottom: 36,
    left: 56,
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

  TITLE: { align: "middle", case: "none", tracking: 0, unit: "subtitle" },
  TITLE_BASELINE: 26,
  TITLE_TO_PLOT: 18,
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
  LINE_POINT_R: 4,
  POINT_SKIP_AFTER: folio.POINT_SKIP_AFTER,
  AREA_OPACITY: 0.28,
  /** 0 → line/area series≥2 use color legend (not end-labels). */
  END_LABEL_SERIES_MAX: 0,
  END_LABEL_GAP: folio.END_LABEL_GAP,
  END_LABEL_MIN_SEP: folio.END_LABEL_MIN_SEP,
  LINE_CURVE: folio.LINE_CURVE,
  MARKER: "filled",
  SERIES_DASH: [""],

  SCATTER_R: 3.5,
  SCATTER_OPACITY: folio.SCATTER_OPACITY,
  SCATTER_MARK: "circle",

  PIE_RADIUS_RATIO: folio.PIE_RADIUS_RATIO,
  PIE_STROKE: folio.PIE_STROKE,
  PIE_LEADER: folio.PIE_LEADER,
  PIE_LABEL_GAP: folio.PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP: folio.PIE_LABEL_MIN_SEP,
  PIE_ELBOW: folio.PIE_ELBOW,
  PIE_LABEL_MODE: "legend",
  PIE_INNER_RATIO: 0,
  PIE_SEPARATOR: folio.PIE_SEPARATOR,

  COMPACT_SPAN: folio.COMPACT_SPAN,

  PLOT_BG: null,
  PLOT_BORDER: null,
  PLOT_BORDER_WIDTH: 0,
  AXIS_TITLES: true,
  LEGEND_BELOW: true,
  TITLE_RULE: false,
  GRID: { dash: "", width: 1, axes: "y" },
  AXIS: { line: "baseline", tick: 6 },
  LEGEND: { swatch: "circle", align: "middle" },
  FRAME: folio.FRAME,
  HERO: folio.HERO,

  SURFACES: {
    light: { PLATE: null, PAPER: "#ffffff", SEMANTIC: { ...SEMANTIC_LIGHT, inkOnLight: "#333333" } },
    dark: {
      PLATE: "#1f2433",
      PAPER: "#1f2433",
      INK: "#e0e0e3",
      QUIET: "#a0a0a8",
      TICK: "#c4c4cc",
      HAIRLINE_OPACITY: "0.16",
      PALETTE: ["#2b908f", "#90ee7e", "#f45b5b", "#7798BF", "#aaeeee", "#ff0066", "#eeaaee", "#55BF3B"],
      SEMANTIC: {
        ...SEMANTIC_LIGHT,
        up: "#2DD4BF",
        down: "#FB7185",
        total: "#e0e0e3",
        rampLow: "#2b3145",
        missing: "#5a6178",
        cellRule: "#3a4158",
        cellGap: "#1f2433",
      },
    },
    export: { PLATE: "#ffffff", PAPER: "#ffffff", SEMANTIC: { ...SEMANTIC_LIGHT, inkOnLight: "#333333" } },
  },
} as const satisfies ThemeTokens;
