/** Vite/VitePress page-figure look as tokens only. Same keys as folio; no vendor deps. */

import { folio, type ThemeTokens } from "./folio.js";

/**
 * Zinc/slate ink, thin ticks, no loud fill — reads native on a docs site page.
 */
export const docs = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: folio.SVG_HEIGHT,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: folio.PLOT_MIN_RATIO,

  FONT: 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',

  /** zinc-900 */
  INK: "#18181B",
  /** slate-500 — muted tick/unit ink for page figures */
  QUIET: "#64748B",
  /** Thin hairlines — barely-there grid on docs paper */
  HAIRLINE_OPACITY: "0.06",
  STRUCTURE_OPACITY: "0.16",

  TYPE: {
    title: { size: 15, weight: 600, fill: "#18181B" },
    unit: { size: 11, weight: 400, fill: "#64748B" },
    value: { size: 10, weight: 500, fill: "#18181B" },
    tick: { size: 10, weight: 400, fill: "#64748B" },
    note: { size: 11, weight: 400, fill: "#64748B" },
    legend: { size: 11, weight: 500, fill: "#18181B" },
  },

  MARGIN: {
    top: 28,
    right: 16,
    bottom: 22,
    left: 40,
  },

  /** Muted zinc/slate series — no loud fills on a docs page */
  PALETTE: [
    "#475569",
    "#64748B",
    "#0F766E",
    "#334155",
    "#78716C",
    "#57534E",
  ],

  WRAP_OPACITY: 0.65,

  TITLE_BASELINE: 20,
  TITLE_TO_PLOT: 12,
  TICK_TEXT_GAP: 8,
  LABEL_ROTATE_DEG: folio.LABEL_ROTATE_DEG,
  LABEL_MIN_GAP: folio.LABEL_MIN_GAP,
  ROTATE_LINE_HEIGHT: folio.ROTATE_LINE_HEIGHT,
  MAX_INTERIOR_GRID: folio.MAX_INTERIOR_GRID,

  BAR_GAP_FEW: 0.3,
  BAR_GAP_MANY: 0.2,
  GROUP_GAP_PX: folio.GROUP_GAP_PX,
  /** Crisp rects — docs figures stay sharp, not card-rounded */
  BAR_RX: 0,
  BAR_MAX_WIDTH: 64,
  BAR_MAX_WIDTH_N: folio.BAR_MAX_WIDTH_N,
  BAR_LABEL_MIN_WIDTH: folio.BAR_LABEL_MIN_WIDTH,
  BAR_LABEL_INSIDE_H: folio.BAR_LABEL_INSIDE_H,
  BAR_LABEL_OFFSET: folio.BAR_LABEL_OFFSET,
  BAR_LABEL_N_ON: folio.BAR_LABEL_N_ON,
  BAR_LABEL_N_OFF: folio.BAR_LABEL_N_OFF,
  BAR_LABEL_MID_MIN_W: folio.BAR_LABEL_MID_MIN_W,

  LINE_STROKE: 1.5,
  LINE_POINT_R: 2,
  POINT_SKIP_AFTER: folio.POINT_SKIP_AFTER,
  /** Quiet area wash — no loud fill */
  AREA_OPACITY: 0.12,
  END_LABEL_SERIES_MAX: folio.END_LABEL_SERIES_MAX,
  END_LABEL_GAP: folio.END_LABEL_GAP,
  END_LABEL_MIN_SEP: folio.END_LABEL_MIN_SEP,

  SCATTER_R: 2.5,
  SCATTER_OPACITY: 0.75,

  PIE_RADIUS_RATIO: folio.PIE_RADIUS_RATIO,
  PIE_STROKE: folio.PIE_STROKE,
  PIE_LEADER: folio.PIE_LEADER,
  PIE_LABEL_GAP: folio.PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP: folio.PIE_LABEL_MIN_SEP,
  PIE_ELBOW: folio.PIE_ELBOW,

  COMPACT_SPAN: folio.COMPACT_SPAN,
} as ThemeTokens;
