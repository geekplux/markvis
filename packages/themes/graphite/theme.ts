/** Editorial mono look as tokens only. Inspired by the lieflat-charts style; no code or token tables copied. */

import type { SemanticColors, SurfaceTokens, ThemeTokens } from "../contract.js";
import { folio } from "../folio/theme.js";

const INK = "#1B1B19";
const QUIET = "#8E8D87";
const PAPER = "#EFEEEA";
const ACCENT = "#E4572E";

const SEMANTIC_LIGHT: SemanticColors = {
  up: INK,
  down: "#9A9993",
  total: ACCENT,
  rampLow: "#F2F1ED",
  missing: "#B5B4AE",
  cellRule: "#E2E1DB",
  cellGap: "#ffffff",
  inkOnLight: INK,
  inkOnDark: "#F4F3EF",
};

/**
 * Light is transparent (the host page is the paper). Export is a warm paper
 * card; dark inverts paper and ink and reverses the gray ladder.
 */
const GRAPHITE_SURFACES: {
  readonly light: SurfaceTokens;
  readonly dark: SurfaceTokens;
  readonly export: SurfaceTokens;
} = {
  light: { PLATE: null, PAPER: "#ffffff", SEMANTIC: SEMANTIC_LIGHT },
  dark: {
    PLATE: INK,
    PAPER: INK,
    INK: PAPER,
    QUIET: "#8E8D87",
    TICK: "#B5B4AE",
    HAIRLINE_OPACITY: "0.18",
    PALETTE: ["#EFEEEA", "#CFCEC8", "#AEADA7", "#8E8D87", "#6E6D68", "#55544F", "#43423E"],
    SEMANTIC: {
      ...SEMANTIC_LIGHT,
      up: PAPER,
      down: "#6E6D68",
      rampLow: "#2A2A27",
      missing: "#55544F",
      cellRule: "#33332F",
      cellGap: INK,
      inkOnLight: INK,
      inkOnDark: PAPER,
    },
  },
  export: { PLATE: PAPER, PAPER, SEMANTIC: { ...SEMANTIC_LIGHT, cellGap: PAPER } },
};

/**
 * Charcoal on warm paper with no hue. Lightness carries the order of the
 * series; one accent marks the largest value. Tight bold title over a quiet
 * subtitle, heavy numbers, hairline grid, pill-capped bars, generous air.
 */
export const graphite = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: 480,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: 0.55,

  FONT: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  FONT_NUMERIC: null,

  INK,
  QUIET,
  HAIRLINE_OPACITY: "0.22",
  STRUCTURE_OPACITY: "0.6",

  TYPE: {
    title: { size: 19, weight: 700, fill: INK },
    unit: { size: 12, weight: 400, fill: QUIET },
    value: { size: 12, weight: 800, fill: INK },
    tick: { size: 11, weight: 600, fill: QUIET },
    note: { size: 11, weight: 400, fill: QUIET },
    legend: { size: 11, weight: 500, fill: INK },
  },

  MARGIN: {
    top: 36,
    right: 28,
    bottom: 30,
    left: 52,
  },

  /** Seven grays, darkest first: the first series matters most. */
  PALETTE: ["#1B1B19", "#4A4945", "#6E6D68", "#8E8D87", "#AEADA7", "#C8C7C1", "#DCDBD5"],
  WRAP_OPACITY: 0.7,

  TITLE: { align: "start", case: "none", tracking: -0.02, unit: "subtitle" },
  TITLE_BASELINE: 30,
  TITLE_TO_PLOT: 22,
  TICK_TEXT_GAP: 10,
  LABEL_ROTATE_DEG: folio.LABEL_ROTATE_DEG,
  LABEL_MIN_GAP: folio.LABEL_MIN_GAP,
  ROTATE_LINE_HEIGHT: folio.ROTATE_LINE_HEIGHT,
  MAX_INTERIOR_GRID: 3,

  BAR_GAP_FEW: 0.42,
  BAR_GAP_MANY: 0.3,
  GROUP_GAP_PX: 3,
  /** Clamped to half the bar width: a pill cap away from the baseline. */
  BAR_RX: 999,
  BAR_MAX_WIDTH: 44,
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
  AREA_OPACITY: 0.14,
  END_LABEL_SERIES_MAX: 4,
  END_LABEL_GAP: folio.END_LABEL_GAP,
  END_LABEL_MIN_SEP: folio.END_LABEL_MIN_SEP,
  LINE_CURVE: "linear",
  MARKER: "none",
  SERIES_DASH: [""],

  SCATTER_R: 3.5,
  SCATTER_OPACITY: 0.8,
  SCATTER_MARK: "circle",

  PIE_RADIUS_RATIO: folio.PIE_RADIUS_RATIO,
  PIE_STROKE: 2,
  PIE_LEADER: folio.PIE_LEADER,
  PIE_LABEL_GAP: folio.PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP: folio.PIE_LABEL_MIN_SEP,
  PIE_ELBOW: folio.PIE_ELBOW,
  PIE_LABEL_MODE: "leaders",
  PIE_INNER_RATIO: 0.6,
  PIE_SEPARATOR: "paper",

  COMPACT_SPAN: folio.COMPACT_SPAN,

  PLOT_BG: null,
  PLOT_BORDER: null,
  PLOT_BORDER_WIDTH: 0,
  AXIS_TITLES: false,
  LEGEND_BELOW: false,
  TITLE_RULE: false,
  GRID: { dash: "", width: 0.5, axes: "y" },
  AXIS: { line: "baseline", tick: 0 },
  LEGEND: { swatch: "circle", align: "start" },
  FRAME: { radius: 24, stroke: false },
  HERO: { rule: "max", color: ACCENT },

  SURFACES: GRAPHITE_SURFACES,
} as const satisfies ThemeTokens;
