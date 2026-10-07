/** Current default SVG look as a named token table. Values match tokens.ts / visual-spec; no redesign. */

import type { SemanticColors, SurfaceTokens, ThemeTokens } from "../contract.js";

export type { ThemeTokens } from "../contract.js";

export const SEMANTIC_LIGHT: SemanticColors = {
  up: "#0F766E",
  down: "#BE123C",
  total: "#44403C",
  rampLow: "#f4f1ea",
  missing: "#a8a29e",
  cellRule: "#d6d3d1",
  cellGap: "#ffffff",
  inkOnLight: "#171717",
  inkOnDark: "#fafaf9",
};

/** Warm stone dark paper and a white export card. */
export const FOLIO_SURFACES: {
  readonly light: SurfaceTokens;
  readonly dark: SurfaceTokens;
  readonly export: SurfaceTokens;
} = {
  light: { PLATE: null, PAPER: "#ffffff", SEMANTIC: SEMANTIC_LIGHT },
  dark: {
    PLATE: "#1c1917",
    PAPER: "#1c1917",
    INK: "#f5f5f4",
    QUIET: "#a8a29e",
    TICK: "#d6d3d1",
    PLOT_BG: "#292524",
    HAIRLINE_OPACITY: "0.22",
    SEMANTIC: {
      ...SEMANTIC_LIGHT,
      up: "#2DD4BF",
      down: "#FB7185",
      total: "#e7e5e4",
      rampLow: "#292524",
      missing: "#57534e",
      cellRule: "#44403c",
      cellGap: "#1c1917",
    },
  },
  export: {
    PLATE: "#ffffff",
    PAPER: "#ffffff",
    INK: "#171717",
    QUIET: "#525252",
    PLOT_BG: "#ffffff",
    PLOT_BORDER: "#e7e5e4",
    PLOT_BORDER_WIDTH: 1,
    SEMANTIC: SEMANTIC_LIGHT,
  },
};

export const folio = {
  SVG_WIDTH: 720,
  SVG_HEIGHT: 480,
  SVG_HEIGHT_MAX: 640,
  PLOT_MIN_RATIO: 0.55,

  FONT: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  FONT_NUMERIC: null,

  INK: "#171717",
  QUIET: "#737373",
  /** Hairline: ink at this opacity (horizontal grid only). */
  HAIRLINE_OPACITY: "0.10",
  /** Structure: ink at this opacity (baseline, leaders, pie slice separators). */
  STRUCTURE_OPACITY: "0.28",

  TYPE: {
    title: { size: 21, weight: 600, fill: "#171717" },
    unit: { size: 13, weight: 400, fill: "#737373" },
    value: { size: 13, weight: 500, fill: "#171717" },
    tick: { size: 12, weight: 400, fill: "#737373" },
    note: { size: 12, weight: 400, fill: "#737373" },
    legend: { size: 13, weight: 400, fill: "#171717" },
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

  TITLE: { align: "start", case: "none", tracking: 0, unit: "inline" },
  TITLE_BASELINE: 32,
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
  LINE_CURVE: "linear",
  MARKER: "filled",
  /** Dashes keep series apart in black and white. */
  SERIES_DASH: ["", "6 4", "2 2", "7 3 2 3"],

  SCATTER_R: 3,
  SCATTER_OPACITY: 0.85,
  SCATTER_MARK: "circle",

  PIE_RADIUS_RATIO: 0.34,
  PIE_STROKE: 1.5,
  PIE_LEADER: 16,
  PIE_LABEL_GAP: 12,
  PIE_LABEL_MIN_SEP: 14,
  PIE_ELBOW: 8,
  /** leaders = outside labels; legend = color legend; none = bare pie. */
  PIE_LABEL_MODE: "leaders",
  /** 0 = solid; ~0.5 = donut hole ratio of outer radius. */
  PIE_INNER_RATIO: 0,

  COMPACT_SPAN: 10_000,

  /** Plot chrome (U6: PLOT_BG null = transparent; border optional stroke-only). */
  PLOT_BG: null,
  PLOT_BORDER: null,
  PLOT_BORDER_WIDTH: 0,
  /** When true, paint x/y axis titles from IR field names / unit. */
  AXIS_TITLES: false,
  /** When true, color legend sits under the plot (not in the title block). */
  LEGEND_BELOW: false,
  /** When true, draw a hairline rule under the title. */
  TITLE_RULE: false,
  GRID: { dash: "", width: 1, axes: "y" },
  AXIS: { line: "baseline", tick: 0 },
  LEGEND: { swatch: "square", align: "start" },
  FRAME: { radius: 0, stroke: false },

  SURFACES: FOLIO_SURFACES,
} as const satisfies ThemeTokens;
