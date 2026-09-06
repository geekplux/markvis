/** Current default SVG look as a named token table. Values match tokens.ts / visual-spec; no redesign. */

export const folio = {
  SVG_WIDTH: 720,
  SVG_HEIGHT: 480,
  SVG_HEIGHT_MAX: 640,
  PLOT_MIN_RATIO: 0.55,

  FONT: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',

  INK: "#171717",
  QUIET: "#737373",
  /** Hairline: ink at this opacity (horizontal grid only). */
  HAIRLINE_OPACITY: "0.10",
  /** Structure: ink at this opacity (baseline, leaders, pie slice separators). */
  STRUCTURE_OPACITY: "0.28",

  TYPE: {
    title: { size: 17, weight: 600, fill: "#171717" },
    unit: { size: 12, weight: 400, fill: "#737373" },
    value: { size: 11, weight: 500, fill: "#171717" },
    tick: { size: 10, weight: 400, fill: "#737373" },
    note: { size: 11, weight: 400, fill: "#737373" },
    legend: { size: 11, weight: 400, fill: "#171717" },
  },

  MARGIN: {
    top: 36,
    right: 20,
    bottom: 26,
    left: 48,
  },

  /** Extra hues only for extra series / pie slices. Cap 8, then reuse at WRAP_OPACITY. */
  PALETTE: [
    "#3B82F6",
    "#F97316",
    "#10B981",
    "#A855F7",
    "#EAB308",
    "#14B8A6",
    "#F43F5E",
    "#64748B",
  ],

  WRAP_OPACITY: 0.7,

  TITLE_BASELINE: 24,
  TITLE_TO_PLOT: 12,
  TICK_TEXT_GAP: 10,
  LABEL_ROTATE_DEG: -55,
  LABEL_MIN_GAP: 2,
  ROTATE_LINE_HEIGHT: 12,
  MAX_INTERIOR_GRID: 3,

  BAR_GAP_FEW: 0.28,
  BAR_GAP_MANY: 0.18,
  GROUP_GAP_PX: 2,
  BAR_RX: 3,
  BAR_MAX_WIDTH: 72,
  BAR_MAX_WIDTH_N: 4,
  BAR_LABEL_MIN_WIDTH: 14,
  BAR_LABEL_INSIDE_H: 28,
  BAR_LABEL_OFFSET: 8,
  BAR_LABEL_N_ON: 6,
  BAR_LABEL_N_OFF: 8,
  BAR_LABEL_MID_MIN_W: 18,

  LINE_STROKE: 1.75,
  LINE_POINT_R: 2.5,
  POINT_SKIP_AFTER: 40,
  AREA_OPACITY: 0.22,
  END_LABEL_SERIES_MAX: 4,
  END_LABEL_GAP: 8,
  END_LABEL_MIN_SEP: 14,

  SCATTER_R: 3,
  SCATTER_OPACITY: 0.85,

  PIE_RADIUS_RATIO: 0.34,
  PIE_STROKE: 1.5,
  PIE_LEADER: 16,
  PIE_LABEL_GAP: 12,
  PIE_LABEL_MIN_SEP: 14,
  PIE_ELBOW: 8,

  COMPACT_SPAN: 10_000,
} as const;

export type ThemeTokens = typeof folio;
