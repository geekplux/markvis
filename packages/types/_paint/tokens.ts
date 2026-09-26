/** Named constants for the active look. Source of truth: @markvis/themes via applyThemeTokens. */

import { folio, type ThemeTokens } from "@markvis/themes";

export let SVG_WIDTH: number = folio.SVG_WIDTH;
export let SVG_HEIGHT: number = folio.SVG_HEIGHT;
export let SVG_HEIGHT_MAX: number = folio.SVG_HEIGHT_MAX;
export let PLOT_MIN_RATIO = folio.PLOT_MIN_RATIO;

export let FONT = folio.FONT;

export let INK: string = folio.INK;
export let QUIET: string = folio.QUIET;
export let HAIRLINE_OPACITY: string = folio.HAIRLINE_OPACITY;
export let STRUCTURE_OPACITY = folio.STRUCTURE_OPACITY;

export let TYPE: {
  title: { size: number; weight: number; fill: string };
  unit: { size: number; weight: number; fill: string };
  value: { size: number; weight: number; fill: string };
  tick: { size: number; weight: number; fill: string };
  note: { size: number; weight: number; fill: string };
  legend: { size: number; weight: number; fill: string };
} = folio.TYPE;

export let MARGIN = folio.MARGIN;

export let PALETTE = folio.PALETTE;

export let WRAP_OPACITY = folio.WRAP_OPACITY;

export let TITLE_BASELINE: number = folio.TITLE_BASELINE;
export let TITLE_TO_PLOT = folio.TITLE_TO_PLOT;
export let TICK_TEXT_GAP = folio.TICK_TEXT_GAP;
export let LABEL_ROTATE_DEG = folio.LABEL_ROTATE_DEG;
export let LABEL_MIN_GAP = folio.LABEL_MIN_GAP;
export let ROTATE_LINE_HEIGHT = folio.ROTATE_LINE_HEIGHT;
export let MAX_INTERIOR_GRID = folio.MAX_INTERIOR_GRID;

export let BAR_GAP_FEW = folio.BAR_GAP_FEW;
export let BAR_GAP_MANY = folio.BAR_GAP_MANY;
export let GROUP_GAP_PX = folio.GROUP_GAP_PX;
export let BAR_RX = folio.BAR_RX;
export let BAR_MAX_WIDTH = folio.BAR_MAX_WIDTH;
export let BAR_MAX_WIDTH_N = folio.BAR_MAX_WIDTH_N;
export let BAR_LABEL_MIN_WIDTH = folio.BAR_LABEL_MIN_WIDTH;
export let BAR_LABEL_INSIDE_H = folio.BAR_LABEL_INSIDE_H;
export let BAR_LABEL_OFFSET = folio.BAR_LABEL_OFFSET;
export let BAR_LABEL_N_ON = folio.BAR_LABEL_N_ON;
export let BAR_LABEL_N_OFF = folio.BAR_LABEL_N_OFF;
export let BAR_LABEL_MID_MIN_W = folio.BAR_LABEL_MID_MIN_W;

export let LINE_STROKE = folio.LINE_STROKE;
export let LINE_POINT_R = folio.LINE_POINT_R;
export let POINT_SKIP_AFTER = folio.POINT_SKIP_AFTER;
export let AREA_OPACITY = folio.AREA_OPACITY;
export let END_LABEL_SERIES_MAX = folio.END_LABEL_SERIES_MAX;
export let END_LABEL_GAP = folio.END_LABEL_GAP;
export let END_LABEL_MIN_SEP = folio.END_LABEL_MIN_SEP;

export let SCATTER_R = folio.SCATTER_R;
export let SCATTER_OPACITY = folio.SCATTER_OPACITY;
export let SCATTER_MARK = folio.SCATTER_MARK;

export let PIE_RADIUS_RATIO = folio.PIE_RADIUS_RATIO;
export let PIE_STROKE = folio.PIE_STROKE;
export let PIE_LEADER = folio.PIE_LEADER;
export let PIE_LABEL_GAP = folio.PIE_LABEL_GAP;
export let PIE_LABEL_MIN_SEP = folio.PIE_LABEL_MIN_SEP;
export let PIE_ELBOW = folio.PIE_ELBOW;
export let PIE_LABEL_MODE = folio.PIE_LABEL_MODE;
export let PIE_INNER_RATIO = folio.PIE_INNER_RATIO;

export let COMPACT_SPAN = folio.COMPACT_SPAN;

export let PLOT_BG: string | null = folio.PLOT_BG;
export let PLOT_BORDER: string | null = folio.PLOT_BORDER;
export let PLOT_BORDER_WIDTH: number = folio.PLOT_BORDER_WIDTH;
export let CANVAS = "#fafaf9";
export type SurfaceName = "light" | "dark" | "export";
export let SURFACE: SurfaceName = "light";
export let AXIS_TITLES = folio.AXIS_TITLES;
export let LEGEND_BELOW = folio.LEGEND_BELOW;
export let TITLE_RULE = folio.TITLE_RULE;
export let VERTICAL_GRID = folio.VERTICAL_GRID;

/** Apply a theme pack to the live token bindings used by layout/paint. */
export function applyThemeTokens(t: ThemeTokens): void {
  SVG_WIDTH = t.SVG_WIDTH;
  SVG_HEIGHT = t.SVG_HEIGHT;
  SVG_HEIGHT_MAX = t.SVG_HEIGHT_MAX;
  PLOT_MIN_RATIO = t.PLOT_MIN_RATIO;
  FONT = t.FONT;
  INK = t.INK;
  QUIET = t.QUIET;
  HAIRLINE_OPACITY = t.HAIRLINE_OPACITY;
  STRUCTURE_OPACITY = t.STRUCTURE_OPACITY;
  TYPE = t.TYPE;
  MARGIN = t.MARGIN;
  PALETTE = t.PALETTE;
  WRAP_OPACITY = t.WRAP_OPACITY;
  TITLE_BASELINE = t.TITLE_BASELINE;
  TITLE_TO_PLOT = t.TITLE_TO_PLOT;
  TICK_TEXT_GAP = t.TICK_TEXT_GAP;
  LABEL_ROTATE_DEG = t.LABEL_ROTATE_DEG;
  LABEL_MIN_GAP = t.LABEL_MIN_GAP;
  ROTATE_LINE_HEIGHT = t.ROTATE_LINE_HEIGHT;
  MAX_INTERIOR_GRID = t.MAX_INTERIOR_GRID;
  BAR_GAP_FEW = t.BAR_GAP_FEW;
  BAR_GAP_MANY = t.BAR_GAP_MANY;
  GROUP_GAP_PX = t.GROUP_GAP_PX;
  BAR_RX = t.BAR_RX;
  BAR_MAX_WIDTH = t.BAR_MAX_WIDTH;
  BAR_MAX_WIDTH_N = t.BAR_MAX_WIDTH_N;
  BAR_LABEL_MIN_WIDTH = t.BAR_LABEL_MIN_WIDTH;
  BAR_LABEL_INSIDE_H = t.BAR_LABEL_INSIDE_H;
  BAR_LABEL_OFFSET = t.BAR_LABEL_OFFSET;
  BAR_LABEL_N_ON = t.BAR_LABEL_N_ON;
  BAR_LABEL_N_OFF = t.BAR_LABEL_N_OFF;
  BAR_LABEL_MID_MIN_W = t.BAR_LABEL_MID_MIN_W;
  LINE_STROKE = t.LINE_STROKE;
  LINE_POINT_R = t.LINE_POINT_R;
  POINT_SKIP_AFTER = t.POINT_SKIP_AFTER;
  AREA_OPACITY = t.AREA_OPACITY;
  END_LABEL_SERIES_MAX = t.END_LABEL_SERIES_MAX;
  END_LABEL_GAP = t.END_LABEL_GAP;
  END_LABEL_MIN_SEP = t.END_LABEL_MIN_SEP;
  SCATTER_R = t.SCATTER_R;
  SCATTER_OPACITY = t.SCATTER_OPACITY;
  SCATTER_MARK = t.SCATTER_MARK;
  PIE_RADIUS_RATIO = t.PIE_RADIUS_RATIO;
  PIE_STROKE = t.PIE_STROKE;
  PIE_LEADER = t.PIE_LEADER;
  PIE_LABEL_GAP = t.PIE_LABEL_GAP;
  PIE_LABEL_MIN_SEP = t.PIE_LABEL_MIN_SEP;
  PIE_ELBOW = t.PIE_ELBOW;
  PIE_LABEL_MODE = t.PIE_LABEL_MODE;
  PIE_INNER_RATIO = t.PIE_INNER_RATIO;
  COMPACT_SPAN = t.COMPACT_SPAN;
  PLOT_BG = t.PLOT_BG;
  PLOT_BORDER = t.PLOT_BORDER;
  PLOT_BORDER_WIDTH = t.PLOT_BORDER_WIDTH;
  AXIS_TITLES = t.AXIS_TITLES;
  LEGEND_BELOW = t.LEGEND_BELOW;
  TITLE_RULE = t.TITLE_RULE;
  VERTICAL_GRID = t.VERTICAL_GRID;
  CANVAS = "#fafaf9";
  SURFACE = "light";
}

const READABLE = {
  title: 21,
  unit: 13,
  value: 13,
  tick: 12,
  note: 12,
  legend: 13,
} as const;

/** Width reflows the frame. Type sizes stay readable. Surface owns ink and paper. */
export function applyFrame(opts: { width: number; surface: SurfaceName }): void {
  SVG_WIDTH = opts.width;
  SURFACE = opts.surface;
  TITLE_BASELINE = Math.max(TITLE_BASELINE, 32);
  TYPE = {
    title: { ...TYPE.title, size: Math.max(TYPE.title.size, READABLE.title) },
    unit: { ...TYPE.unit, size: Math.max(TYPE.unit.size, READABLE.unit) },
    value: { ...TYPE.value, size: Math.max(TYPE.value.size, READABLE.value) },
    tick: { ...TYPE.tick, size: Math.max(TYPE.tick.size, READABLE.tick) },
    note: { ...TYPE.note, size: Math.max(TYPE.note.size, READABLE.note) },
    legend: { ...TYPE.legend, size: Math.max(TYPE.legend.size, READABLE.legend) },
  };
  if (opts.surface === "dark") {
    CANVAS = "#1c1917";
    INK = "#f5f5f4";
    QUIET = "#a8a29e";
    PLOT_BG = "#292524";
    HAIRLINE_OPACITY = "0.22";
    TYPE = {
      title: { ...TYPE.title, fill: "#f5f5f4" },
      unit: { ...TYPE.unit, fill: "#a8a29e" },
      value: { ...TYPE.value, fill: "#f5f5f4" },
      tick: { ...TYPE.tick, fill: "#d6d3d1" },
      note: { ...TYPE.note, fill: "#a8a29e" },
      legend: { ...TYPE.legend, fill: "#f5f5f4" },
    };
    return;
  }
  if (opts.surface === "export") {
    CANVAS = "#ffffff";
    INK = "#171717";
    QUIET = "#525252";
    PLOT_BG = "#ffffff";
    PLOT_BORDER = "#e7e5e4";
    PLOT_BORDER_WIDTH = 1;
    TYPE = {
      title: { ...TYPE.title, fill: "#171717" },
      unit: { ...TYPE.unit, fill: "#525252" },
      value: { ...TYPE.value, fill: "#171717" },
      tick: { ...TYPE.tick, fill: "#525252" },
      note: { ...TYPE.note, fill: "#525252" },
      legend: { ...TYPE.legend, fill: "#171717" },
    };
    return;
  }
  CANVAS = "#fafaf9";
}
