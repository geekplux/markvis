/** Named constants for the active look. Source of truth: @markvis/themes via applyThemeTokens. */

import {
  folio,
  type GridTokens,
  type SemanticColors,
  type ThemeTokens,
} from "@markvis/themes";

/** Widened view so the live bindings accept every pack, not only folio literals. */
const base: ThemeTokens = folio;

export let SVG_WIDTH: number = base.SVG_WIDTH;
export let SVG_HEIGHT: number = base.SVG_HEIGHT;
export let SVG_HEIGHT_MAX: number = base.SVG_HEIGHT_MAX;
export let PLOT_MIN_RATIO = base.PLOT_MIN_RATIO;

export let FONT = base.FONT;

export let INK: string = base.INK;
export let QUIET: string = base.QUIET;
export let HAIRLINE_OPACITY: string = base.HAIRLINE_OPACITY;
export let STRUCTURE_OPACITY = base.STRUCTURE_OPACITY;

export let TYPE: {
  title: { size: number; weight: number; fill: string };
  unit: { size: number; weight: number; fill: string };
  value: { size: number; weight: number; fill: string };
  tick: { size: number; weight: number; fill: string };
  note: { size: number; weight: number; fill: string };
  legend: { size: number; weight: number; fill: string };
} = base.TYPE;

export let MARGIN = base.MARGIN;

export let PALETTE = base.PALETTE;

export let WRAP_OPACITY = base.WRAP_OPACITY;

export let TITLE_BASELINE: number = base.TITLE_BASELINE;
export let TITLE_TO_PLOT = base.TITLE_TO_PLOT;
export let TICK_TEXT_GAP = base.TICK_TEXT_GAP;
export let LABEL_ROTATE_DEG = base.LABEL_ROTATE_DEG;
export let LABEL_MIN_GAP = base.LABEL_MIN_GAP;
export let ROTATE_LINE_HEIGHT = base.ROTATE_LINE_HEIGHT;
export let MAX_INTERIOR_GRID = base.MAX_INTERIOR_GRID;

export let BAR_GAP_FEW = base.BAR_GAP_FEW;
export let BAR_GAP_MANY = base.BAR_GAP_MANY;
export let GROUP_GAP_PX = base.GROUP_GAP_PX;
export let BAR_RX = base.BAR_RX;
export let BAR_MAX_WIDTH = base.BAR_MAX_WIDTH;
export let BAR_MAX_WIDTH_N = base.BAR_MAX_WIDTH_N;
export let BAR_LABEL_MIN_WIDTH = base.BAR_LABEL_MIN_WIDTH;
export let BAR_LABEL_INSIDE_H = base.BAR_LABEL_INSIDE_H;
export let BAR_LABEL_OFFSET = base.BAR_LABEL_OFFSET;
export let BAR_LABEL_N_ON = base.BAR_LABEL_N_ON;
export let BAR_LABEL_N_OFF = base.BAR_LABEL_N_OFF;
export let BAR_LABEL_MID_MIN_W = base.BAR_LABEL_MID_MIN_W;

export let LINE_STROKE = base.LINE_STROKE;
export let LINE_POINT_R = base.LINE_POINT_R;
export let POINT_SKIP_AFTER = base.POINT_SKIP_AFTER;
export let AREA_OPACITY = base.AREA_OPACITY;
export let END_LABEL_SERIES_MAX = base.END_LABEL_SERIES_MAX;
export let END_LABEL_GAP = base.END_LABEL_GAP;
export let END_LABEL_MIN_SEP = base.END_LABEL_MIN_SEP;
export let SERIES_DASH: readonly string[] = base.SERIES_DASH;

export let SCATTER_R = base.SCATTER_R;
export let SCATTER_OPACITY = base.SCATTER_OPACITY;
export let SCATTER_MARK = base.SCATTER_MARK;

export let PIE_RADIUS_RATIO = base.PIE_RADIUS_RATIO;
export let PIE_STROKE = base.PIE_STROKE;
export let PIE_LEADER = base.PIE_LEADER;
export let PIE_LABEL_GAP = base.PIE_LABEL_GAP;
export let PIE_LABEL_MIN_SEP = base.PIE_LABEL_MIN_SEP;
export let PIE_ELBOW = base.PIE_ELBOW;
export let PIE_LABEL_MODE = base.PIE_LABEL_MODE;
export let PIE_INNER_RATIO = base.PIE_INNER_RATIO;

export let COMPACT_SPAN = base.COMPACT_SPAN;

export let PLOT_BG: string | null = base.PLOT_BG;
export let PLOT_BORDER: string | null = base.PLOT_BORDER;
export let PLOT_BORDER_WIDTH: number = base.PLOT_BORDER_WIDTH;
export type SurfaceName = "light" | "dark" | "export";
export let SURFACE: SurfaceName = "light";
/** Full-frame plate for the active surface. null = the host page is the paper. */
export let PLATE: string | null = base.SURFACES.light.PLATE;
export let SEMANTIC: SemanticColors = base.SURFACES.light.SEMANTIC;
export let GRID: GridTokens = base.GRID;
export let AXIS_TITLES = base.AXIS_TITLES;
export let LEGEND_BELOW = base.LEGEND_BELOW;
export let TITLE_RULE = base.TITLE_RULE;
let SURFACES: ThemeTokens["SURFACES"] = base.SURFACES;

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
  SERIES_DASH = t.SERIES_DASH;
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
  GRID = t.GRID;
  SURFACES = t.SURFACES;
  SURFACE = "light";
  PLATE = t.SURFACES.light.PLATE;
  SEMANTIC = t.SURFACES.light.SEMANTIC;
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
  const s = SURFACES[opts.surface];
  PLATE = s.PLATE;
  SEMANTIC = s.SEMANTIC;
  if (s.PLOT_BG !== undefined) PLOT_BG = s.PLOT_BG;
  if (s.PLOT_BORDER !== undefined) PLOT_BORDER = s.PLOT_BORDER;
  if (s.PLOT_BORDER_WIDTH !== undefined) PLOT_BORDER_WIDTH = s.PLOT_BORDER_WIDTH;
  if (s.HAIRLINE_OPACITY !== undefined) HAIRLINE_OPACITY = s.HAIRLINE_OPACITY;
  if (s.INK === undefined) {
    return;
  }
  INK = s.INK;
  QUIET = s.QUIET ?? QUIET;
  TYPE = {
    title: { ...TYPE.title, fill: INK },
    unit: { ...TYPE.unit, fill: QUIET },
    value: { ...TYPE.value, fill: INK },
    tick: { ...TYPE.tick, fill: s.TICK ?? QUIET },
    note: { ...TYPE.note, fill: QUIET },
    legend: { ...TYPE.legend, fill: INK },
  };
}
