/** shadcn/ui chart look as tokens only. Same keys as folio; no vendor chart deps. */

import { folio, type ThemeTokens } from "./folio.js";

/**
 * Rounded marks, categorical --chart-1..5 hues (light theme oklch → hex),
 * card-quiet axes (muted ticks, soft structure).
 */
export const shadcn = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: folio.SVG_HEIGHT,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: folio.PLOT_MIN_RATIO,

  FONT: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',

  /** Foreground ≈ oklch(0.145 0 0). */
  INK: "#0A0A0A",
  /** Muted-foreground ≈ oklch(0.556 0 0) — card-quiet tick/unit ink. */
  QUIET: "#737373",
  /** Softer than folio so axes sit quiet on a card surface. */
  HAIRLINE_OPACITY: "0.08",
  STRUCTURE_OPACITY: "0.18",

  TYPE: {
    title: { size: 16, weight: 600, fill: "#0A0A0A" },
    unit: { size: 12, weight: 400, fill: "#737373" },
    value: { size: 11, weight: 500, fill: "#0A0A0A" },
    tick: { size: 11, weight: 400, fill: "#737373" },
    note: { size: 11, weight: 400, fill: "#737373" },
    legend: { size: 12, weight: 500, fill: "#0A0A0A" },
  },

  MARGIN: {
    top: 32,
    right: 18,
    bottom: 24,
    left: 44,
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
  MAX_INTERIOR_GRID: folio.MAX_INTERIOR_GRID,

  BAR_GAP_FEW: 0.26,
  BAR_GAP_MANY: 0.16,
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
  LINE_POINT_R: 3,
  POINT_SKIP_AFTER: folio.POINT_SKIP_AFTER,
  AREA_OPACITY: 0.2,
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
