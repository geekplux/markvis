/** shadcn/ui chart look as tokens only. Same keys as folio; no vendor chart deps. */

import { folio, type ThemeTokens } from "../folio/theme.js";

/**
 * Static SVG grammar: rounded marks, chart-1..5 categorical, card-quiet axes,
 * soft card plot border, legend for series≥2, no loud grid. No shadcn/ui runtime.
 */
export const shadcn = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: 460,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: 0.58,

  FONT: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',

  /** Foreground ≈ oklch(0.145 0 0). */
  INK: "#0A0A0A",
  /** Muted-foreground ≈ oklch(0.556 0 0) — card-quiet tick/unit ink. */
  QUIET: "#737373",
  /** Softer than folio so axes sit quiet on a card surface. */
  HAIRLINE_OPACITY: "0.06",
  STRUCTURE_OPACITY: "0.14",

  TYPE: {
    title: { size: 16, weight: 600, fill: "#0A0A0A" },
    unit: { size: 12, weight: 400, fill: "#737373" },
    value: { size: 11, weight: 500, fill: "#0A0A0A" },
    tick: { size: 11, weight: 400, fill: "#737373" },
    note: { size: 11, weight: 400, fill: "#737373" },
    legend: { size: 12, weight: 500, fill: "#0A0A0A" },
  },

  /** Legend-friendly card margins. */
  MARGIN: {
    top: 36,
    right: 20,
    bottom: 28,
    left: 48,
  },

  /** Light-theme --chart-1..5 (oklch → hex). Extra series wrap at WRAP_OPACITY. */
  PALETTE: [
    "#F54900",
    "#009689",
    "#104E64",
    "#FFB900",
    "#FE9A00",
  ],

  WRAP_OPACITY: 0.72,

  TITLE_BASELINE: 22,
  TITLE_TO_PLOT: 14,
  TICK_TEXT_GAP: 8,
  LABEL_ROTATE_DEG: folio.LABEL_ROTATE_DEG,
  LABEL_MIN_GAP: folio.LABEL_MIN_GAP,
  ROTATE_LINE_HEIGHT: folio.ROTATE_LINE_HEIGHT,
  /** Quieter than folio — no loud grid. */
  MAX_INTERIOR_GRID: 2,

  BAR_GAP_FEW: 0.32,
  BAR_GAP_MANY: 0.2,
  GROUP_GAP_PX: folio.GROUP_GAP_PX,
  /** Rounded marks (shadcn radius language); tops only via roundedBarPath. */
  BAR_RX: 6,
  BAR_MAX_WIDTH: 68,
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
  AREA_OPACITY: 0.18,
  /** 0 → line/area series≥2 use color legend (not end-labels). */
  END_LABEL_SERIES_MAX: 0,
  END_LABEL_GAP: folio.END_LABEL_GAP,
  END_LABEL_MIN_SEP: folio.END_LABEL_MIN_SEP,

  SCATTER_R: folio.SCATTER_R,
  SCATTER_OPACITY: 0.75,
  SCATTER_MARK: "circle",

  PIE_RADIUS_RATIO: folio.PIE_RADIUS_RATIO,
  PIE_STROKE: folio.PIE_STROKE,
  PIE_LEADER: folio.PIE_LEADER,
  PIE_LABEL_GAP: folio.PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP: folio.PIE_LABEL_MIN_SEP,
  PIE_ELBOW: folio.PIE_ELBOW,
  PIE_LABEL_MODE: "legend",
  PIE_INNER_RATIO: 0.5,

  COMPACT_SPAN: folio.COMPACT_SPAN,

  /** Soft card plot — not highcharts #ccd6eb chrome. */
  PLOT_BG: "#ffffff",
  PLOT_BORDER: "#e5e5e5",
  PLOT_BORDER_WIDTH: 1,
  /** Card figures stay quiet — no IR field titles on axes. */
  AXIS_TITLES: false,
  LEGEND_BELOW: false,
  TITLE_RULE: false,
  VERTICAL_GRID: false,
} as ThemeTokens;
