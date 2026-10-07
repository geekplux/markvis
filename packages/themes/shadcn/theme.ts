/** shadcn/ui chart look as tokens only. Same keys as folio; no vendor chart deps. */

import { SEMANTIC_LIGHT, folio, type ThemeTokens } from "../folio/theme.js";

/**
 * Static SVG grammar: rounded marks, chart-1..5 categorical, card-quiet axes,
 * soft card plot border, legend for series≥2, no loud grid. No shadcn/ui runtime.
 */
export const shadcn = {
  SVG_WIDTH: folio.SVG_WIDTH,
  SVG_HEIGHT: 460,
  SVG_HEIGHT_MAX: folio.SVG_HEIGHT_MAX,
  PLOT_MIN_RATIO: 0.58,

  FONT: 'Geist, Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  FONT_NUMERIC: folio.FONT_NUMERIC,

  /** Foreground ≈ oklch(0.145 0 0). */
  INK: "#0A0A0A",
  /** Muted-foreground ≈ oklch(0.556 0 0) — card-quiet tick/unit ink. */
  QUIET: "#737373",
  /** Softer than folio so axes sit quiet on a card surface. */
  HAIRLINE_OPACITY: "0.08",
  STRUCTURE_OPACITY: "0.14",

  TYPE: {
    title: { size: 16, weight: 600, fill: "#0A0A0A" },
    unit: { size: 13, weight: 400, fill: "#737373" },
    value: { size: 12, weight: 500, fill: "#0A0A0A" },
    tick: { size: 12, weight: 400, fill: "#737373" },
    note: { size: 12, weight: 400, fill: "#737373" },
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

  TITLE: { align: "start", case: "none", tracking: 0, unit: "subtitle" },
  TITLE_BASELINE: 30,
  TITLE_TO_PLOT: 20,
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
  BAR_RX: 8,
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
  AREA_OPACITY: 0.3,
  /** 0 → line/area series≥2 use color legend (not end-labels). */
  END_LABEL_SERIES_MAX: 0,
  END_LABEL_GAP: folio.END_LABEL_GAP,
  END_LABEL_MIN_SEP: folio.END_LABEL_MIN_SEP,
  LINE_CURVE: "monotone",
  MARKER: "none",
  SERIES_DASH: [""],

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
  PIE_SEPARATOR: folio.PIE_SEPARATOR,

  COMPACT_SPAN: folio.COMPACT_SPAN,

  /** Soft card stroke — transparent fill; not highcharts #ccd6eb chrome. */
  PLOT_BG: null,
  PLOT_BORDER: null,
  PLOT_BORDER_WIDTH: 0,
  /** Card figures stay quiet — no IR field titles on axes. */
  AXIS_TITLES: false,
  LEGEND_BELOW: true,
  TITLE_RULE: false,
  GRID: { dash: "", width: 1, axes: "y" },
  AXIS: { line: "none", tick: 0 },
  LEGEND: { swatch: "rounded", align: "middle" },
  FRAME: { radius: 12, stroke: true },
  HERO: folio.HERO,

  SURFACES: {
    light: { PLATE: null, PAPER: "#ffffff", SEMANTIC: { ...SEMANTIC_LIGHT, inkOnLight: "#0A0A0A" } },
    dark: {
      PLATE: "#09090b",
      PAPER: "#09090b",
      INK: "#fafafa",
      QUIET: "#a1a1aa",
      TICK: "#a1a1aa",
      HAIRLINE_OPACITY: "0.12",
      PALETTE: ["#1447E6", "#00BC7D", "#FE9A00", "#AD46FF", "#FF2056"],
      SEMANTIC: {
        ...SEMANTIC_LIGHT,
        up: "#2DD4BF",
        down: "#FB7185",
        total: "#fafafa",
        rampLow: "#18181b",
        missing: "#52525b",
        cellRule: "#27272a",
        cellGap: "#09090b",
      },
    },
    export: { PLATE: "#ffffff", PAPER: "#ffffff", SEMANTIC: { ...SEMANTIC_LIGHT, inkOnLight: "#0A0A0A" } },
  },
} as const satisfies ThemeTokens;
