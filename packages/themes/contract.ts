/** The token contract every theme pack fills. A theme is grammar; a palette is series colors only. */

export type TypeRole = {
  readonly size: number;
  readonly weight: number;
  readonly fill: string;
};

/** Colors that carry meaning rather than series identity. */
export type SemanticColors = {
  /** Waterfall step that rises. */
  readonly up: string;
  /** Waterfall step that falls. */
  readonly down: string;
  /** Waterfall total or subtotal bar. */
  readonly total: string;
  /** Low end of the sequential ramp (heatmap). */
  readonly rampLow: string;
  /** Hatch stroke for a missing cell. */
  readonly missing: string;
  /** Rule between heatmap cells. */
  readonly cellRule: string;
  /** Gap between treemap tiles. */
  readonly cellGap: string;
  /** Text drawn on a light fill. */
  readonly inkOnLight: string;
  /** Text drawn on a dark fill. */
  readonly inkOnDark: string;
};

/** What one surface paints. Omitted ink fields keep the theme's light values. */
export type SurfaceTokens = {
  /** Full-frame plate. null paints none: the host page is the paper. */
  readonly PLATE: string | null;
  readonly INK?: string;
  readonly QUIET?: string;
  /** Tick label fill. Defaults to QUIET. */
  readonly TICK?: string;
  readonly PLOT_BG?: string | null;
  readonly PLOT_BORDER?: string;
  readonly PLOT_BORDER_WIDTH?: number;
  readonly HAIRLINE_OPACITY?: string;
  readonly SEMANTIC: SemanticColors;
};

export type GridTokens = {
  /** stroke-dasharray for grid lines. "" draws solid. */
  readonly dash: string;
  readonly width: number;
  /** "y" draws horizontal lines only; "xy" adds vertical lines at x ticks. */
  readonly axes: "y" | "xy";
};

export interface ThemeTokens {
  readonly SVG_WIDTH: number;
  readonly SVG_HEIGHT: number;
  readonly SVG_HEIGHT_MAX: number;
  readonly PLOT_MIN_RATIO: number;

  readonly FONT: string;

  readonly INK: string;
  readonly QUIET: string;
  /** Hairline: ink at this opacity (grid). */
  readonly HAIRLINE_OPACITY: string;
  /** Structure: ink at this opacity (baseline, leaders, pie slice separators). */
  readonly STRUCTURE_OPACITY: string;

  readonly TYPE: {
    readonly title: TypeRole;
    readonly unit: TypeRole;
    readonly value: TypeRole;
    readonly tick: TypeRole;
    readonly note: TypeRole;
    readonly legend: TypeRole;
  };

  readonly MARGIN: {
    readonly top: number;
    readonly right: number;
    readonly bottom: number;
    readonly left: number;
  };

  /** Series colors. Cap 8, then reuse at WRAP_OPACITY. */
  readonly PALETTE: readonly string[];
  readonly WRAP_OPACITY: number;

  readonly TITLE_BASELINE: number;
  readonly TITLE_TO_PLOT: number;
  readonly TICK_TEXT_GAP: number;
  readonly LABEL_ROTATE_DEG: number;
  readonly LABEL_MIN_GAP: number;
  readonly ROTATE_LINE_HEIGHT: number;
  readonly MAX_INTERIOR_GRID: number;

  readonly BAR_GAP_FEW: number;
  readonly BAR_GAP_MANY: number;
  readonly GROUP_GAP_PX: number;
  readonly BAR_RX: number;
  readonly BAR_MAX_WIDTH: number;
  readonly BAR_MAX_WIDTH_N: number;
  readonly BAR_LABEL_MIN_WIDTH: number;
  readonly BAR_LABEL_INSIDE_H: number;
  readonly BAR_LABEL_OFFSET: number;
  readonly BAR_LABEL_N_ON: number;
  readonly BAR_LABEL_N_OFF: number;
  readonly BAR_LABEL_MID_MIN_W: number;

  readonly LINE_STROKE: number;
  readonly LINE_POINT_R: number;
  readonly POINT_SKIP_AFTER: number;
  readonly AREA_OPACITY: number;
  readonly END_LABEL_SERIES_MAX: number;
  readonly END_LABEL_GAP: number;
  readonly END_LABEL_MIN_SEP: number;
  /** stroke-dasharray per series index, cycled. "" draws solid. */
  readonly SERIES_DASH: readonly string[];

  readonly SCATTER_R: number;
  readonly SCATTER_OPACITY: number;
  readonly SCATTER_MARK: "circle" | "ring";

  readonly PIE_RADIUS_RATIO: number;
  readonly PIE_STROKE: number;
  readonly PIE_LEADER: number;
  readonly PIE_LABEL_GAP: number;
  readonly PIE_LABEL_MIN_SEP: number;
  readonly PIE_ELBOW: number;
  /** leaders = outside labels; legend = color legend; none = bare pie. */
  readonly PIE_LABEL_MODE: "leaders" | "legend" | "none";
  /** 0 = solid; ~0.5 = donut hole ratio of outer radius. */
  readonly PIE_INNER_RATIO: number;

  readonly COMPACT_SPAN: number;

  /** Plot chrome. PLOT_BG null = transparent; the border is stroke only. */
  readonly PLOT_BG: string | null;
  readonly PLOT_BORDER: string | null;
  readonly PLOT_BORDER_WIDTH: number;
  readonly GRID: GridTokens;
  /** When true, paint x/y axis titles from IR field names / unit. */
  readonly AXIS_TITLES: boolean;
  /** When true, the color legend sits under the plot (not in the title block). */
  readonly LEGEND_BELOW: boolean;
  /** When true, draw a hairline rule under the title. */
  readonly TITLE_RULE: boolean;

  readonly SURFACES: {
    readonly light: SurfaceTokens;
    readonly dark: SurfaceTokens;
    readonly export: SurfaceTokens;
  };
}
