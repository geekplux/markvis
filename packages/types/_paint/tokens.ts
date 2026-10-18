/** Named constants for the active look. Source of truth: @markvis/themes via applyThemeTokens. */

import {
  folio,
  type AxisTokens,
  type FrameTokens,
  type GridTokens,
  type HeroTokens,
  type LegendTokens,
  type SemanticColors,
  type ThemeTokens,
  type TitleTokens,
  type TypeRole,
} from "@markvis/themes";
import { paint, seriesPaintName, type ColorMode, type Paint } from "./paint.js";

/** Widened view so the live bindings accept every pack, not only folio literals. */
const base: ThemeTokens = folio;

/** A type role whose fill is a live Paint. */
export type LiveTypeRole = { size: number; weight: number; fill: Paint };
export type LiveType = {
  title: LiveTypeRole;
  unit: LiveTypeRole;
  value: LiveTypeRole;
  tick: LiveTypeRole;
  note: LiveTypeRole;
  legend: LiveTypeRole;
};
/**
 * Semantic colors. The waterfall roles are live Paints, and so is the
 * treemap tile gap, which every pack sets to the surface paper. The heatmap
 * and calendar ramp, missing hatch, and cell rule stay fixed: cell fills are
 * mixes computed from them, so they keep one fixed look together. The
 * on-mark inks stay fixed: they are picked for the fixed fill under them.
 */
export type LiveSemantic = Omit<SemanticColors, "up" | "down" | "total" | "cellGap"> & {
  readonly up: Paint;
  readonly down: Paint;
  readonly total: Paint;
  readonly cellGap: Paint;
};
export type LiveHero = { readonly rule: HeroTokens["rule"]; readonly color: Paint };

function role(r: TypeRole, fill: Paint): LiveTypeRole {
  return { size: r.size, weight: r.weight, fill };
}

/**
 * Title, value, and legend text read as ink; unit, note, and tick text as
 * muted. Each keeps its own fixed hex (a pack or surface may set tick text
 * apart from other muted text); the name is the role a host variable fills.
 */
function liveType(t: ThemeTokens["TYPE"]): LiveType {
  return {
    title: role(t.title, paint("ink", t.title.fill)),
    unit: role(t.unit, paint("muted", t.unit.fill)),
    value: role(t.value, paint("ink", t.value.fill)),
    tick: role(t.tick, paint("muted", t.tick.fill)),
    note: role(t.note, paint("muted", t.note.fill)),
    legend: role(t.legend, paint("ink", t.legend.fill)),
  };
}

function livePalette(list: readonly string[]): readonly Paint[] {
  return list.map((hex, i) => paint(seriesPaintName(i), hex));
}

function liveSemantic(s: SemanticColors): LiveSemantic {
  return {
    ...s,
    up: paint("up", s.up),
    down: paint("down", s.down),
    total: paint("total", s.total),
    cellGap: paint("paper", s.cellGap),
  };
}

function liveHero(h: HeroTokens): LiveHero {
  return { rule: h.rule, color: paint("accent", h.color) };
}

function livePlot(hex: string | null): Paint | null {
  return hex === null ? null : paint("plot", hex);
}

function livePlate(hex: string | null): Paint | null {
  return hex === null ? null : paint("plate", hex);
}

export let SVG_WIDTH: number = base.SVG_WIDTH;
export let SVG_HEIGHT: number = base.SVG_HEIGHT;
export let SVG_HEIGHT_MAX: number = base.SVG_HEIGHT_MAX;
export let PLOT_MIN_RATIO = base.PLOT_MIN_RATIO;

export let FONT = base.FONT;
/** Font for tick and value labels; undefined inherits FONT. */
export let FONT_NUMERIC: string | undefined = base.FONT_NUMERIC ?? undefined;

export let INK: Paint = paint("ink", base.INK);
/** Grid lines: ink drawn at the hairline opacity, named `grid` so a host can set them apart. */
export let GRID_INK: Paint = paint("grid", base.INK);
export let QUIET: Paint = paint("muted", base.QUIET);
export let HAIRLINE_OPACITY: string = base.HAIRLINE_OPACITY;
export let STRUCTURE_OPACITY = base.STRUCTURE_OPACITY;

export let TYPE: LiveType = liveType(base.TYPE);

export let MARGIN = base.MARGIN;

export let PALETTE: readonly Paint[] = livePalette(base.PALETTE);

export let WRAP_OPACITY = base.WRAP_OPACITY;

export let TITLE: TitleTokens = base.TITLE;
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
export let LINE_CURVE = base.LINE_CURVE;
export let MARKER = base.MARKER;
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
export let PIE_SEPARATOR = base.PIE_SEPARATOR;

export let COMPACT_SPAN = base.COMPACT_SPAN;

export let PLOT_BG: Paint | null = livePlot(base.PLOT_BG);
/**
 * Plot border (export surface in the built-in packs). Fixed: it is a solid
 * pale rule, while `grid` is drawn at the hairline opacity, so the two cannot
 * share one host color.
 */
export let PLOT_BORDER: string | null = base.PLOT_BORDER;
export let PLOT_BORDER_WIDTH: number = base.PLOT_BORDER_WIDTH;
export type SurfaceName = "light" | "dark" | "export";
export let SURFACE: SurfaceName = "light";
/** Full-frame plate for the active surface. null = the host page is the paper. */
export let PLATE: Paint | null = livePlate(base.SURFACES.light.PLATE);
export let PAPER: Paint = paint("paper", base.SURFACES.light.PAPER);
export let SEMANTIC: LiveSemantic = liveSemantic(base.SURFACES.light.SEMANTIC);
export let GRID: GridTokens = base.GRID;
export let AXIS: AxisTokens = base.AXIS;
export let LEGEND: LegendTokens = base.LEGEND;
export let FRAME: FrameTokens = base.FRAME;
export let HERO: LiveHero = liveHero(base.HERO);
export let AXIS_TITLES = base.AXIS_TITLES;
export let LEGEND_BELOW = base.LEGEND_BELOW;
export let TITLE_RULE = base.TITLE_RULE;
let SURFACES: ThemeTokens["SURFACES"] = base.SURFACES;
/** How colors are written for the chart being painted. */
export let COLOR_MODE: ColorMode = "host";

/** Apply a theme pack to the live token bindings used by layout/paint. */
export function applyThemeTokens(t: ThemeTokens): void {
  SVG_WIDTH = t.SVG_WIDTH;
  SVG_HEIGHT = t.SVG_HEIGHT;
  SVG_HEIGHT_MAX = t.SVG_HEIGHT_MAX;
  PLOT_MIN_RATIO = t.PLOT_MIN_RATIO;
  FONT = t.FONT;
  FONT_NUMERIC = t.FONT_NUMERIC ?? undefined;
  INK = paint("ink", t.INK);
  GRID_INK = paint("grid", t.INK);
  QUIET = paint("muted", t.QUIET);
  HAIRLINE_OPACITY = t.HAIRLINE_OPACITY;
  STRUCTURE_OPACITY = t.STRUCTURE_OPACITY;
  TYPE = liveType(t.TYPE);
  MARGIN = t.MARGIN;
  PALETTE = livePalette(t.PALETTE);
  WRAP_OPACITY = t.WRAP_OPACITY;
  TITLE = t.TITLE;
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
  LINE_CURVE = t.LINE_CURVE;
  MARKER = t.MARKER;
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
  PIE_SEPARATOR = t.PIE_SEPARATOR;
  COMPACT_SPAN = t.COMPACT_SPAN;
  PLOT_BG = livePlot(t.PLOT_BG);
  PLOT_BORDER = t.PLOT_BORDER;
  PLOT_BORDER_WIDTH = t.PLOT_BORDER_WIDTH;
  AXIS_TITLES = t.AXIS_TITLES;
  LEGEND_BELOW = t.LEGEND_BELOW;
  TITLE_RULE = t.TITLE_RULE;
  GRID = t.GRID;
  AXIS = t.AXIS;
  LEGEND = t.LEGEND;
  FRAME = t.FRAME;
  HERO = liveHero(t.HERO);
  SURFACES = t.SURFACES;
  SURFACE = "light";
  PLATE = livePlate(t.SURFACES.light.PLATE);
  PAPER = paint("paper", t.SURFACES.light.PAPER);
  SEMANTIC = liveSemantic(t.SURFACES.light.SEMANTIC);
}

/** Hard minimum for every theme. A theme owns its ramp above it. */
const TYPE_MIN = {
  title: 15,
  unit: 11,
  value: 11,
  tick: 11,
  note: 11,
  legend: 11,
} as const;

/**
 * Width reflows the frame; type never shrinks below TYPE_MIN. Each theme
 * keeps its own ramp above that. Surface owns ink and paper.
 */
export function applyFrame(opts: {
  width: number;
  surface: SurfaceName;
  colors?: ColorMode | undefined;
}): void {
  SVG_WIDTH = opts.width;
  SURFACE = opts.surface;
  COLOR_MODE = opts.colors ?? "host";
  TYPE = {
    title: { ...TYPE.title, size: Math.max(TYPE.title.size, TYPE_MIN.title) },
    unit: { ...TYPE.unit, size: Math.max(TYPE.unit.size, TYPE_MIN.unit) },
    value: { ...TYPE.value, size: Math.max(TYPE.value.size, TYPE_MIN.value) },
    tick: { ...TYPE.tick, size: Math.max(TYPE.tick.size, TYPE_MIN.tick) },
    note: { ...TYPE.note, size: Math.max(TYPE.note.size, TYPE_MIN.note) },
    legend: { ...TYPE.legend, size: Math.max(TYPE.legend.size, TYPE_MIN.legend) },
  };
  // The first title baseline clears the cap height of the theme's own title.
  TITLE_BASELINE = Math.max(TITLE_BASELINE, TYPE.title.size + 8);
  const s = SURFACES[opts.surface];
  PLATE = livePlate(s.PLATE);
  PAPER = paint("paper", s.PAPER);
  SEMANTIC = liveSemantic(s.SEMANTIC);
  if (s.PLOT_BG !== undefined) PLOT_BG = livePlot(s.PLOT_BG);
  if (s.PLOT_BORDER !== undefined) PLOT_BORDER = s.PLOT_BORDER;
  if (s.PLOT_BORDER_WIDTH !== undefined) PLOT_BORDER_WIDTH = s.PLOT_BORDER_WIDTH;
  if (s.HAIRLINE_OPACITY !== undefined) HAIRLINE_OPACITY = s.HAIRLINE_OPACITY;
  if (s.PALETTE !== undefined) PALETTE = livePalette(s.PALETTE);
  if (s.INK === undefined) {
    return;
  }
  INK = paint("ink", s.INK);
  GRID_INK = paint("grid", s.INK);
  QUIET = s.QUIET === undefined ? QUIET : paint("muted", s.QUIET);
  TYPE = {
    title: { ...TYPE.title, fill: INK },
    unit: { ...TYPE.unit, fill: QUIET },
    value: { ...TYPE.value, fill: INK },
    tick: { ...TYPE.tick, fill: s.TICK === undefined ? QUIET : paint("muted", s.TICK) },
    note: { ...TYPE.note, fill: QUIET },
    legend: { ...TYPE.legend, fill: INK },
  };
}
