export declare const CHART_TYPES: readonly [
  "bar",
  "line",
  "area",
  "scatter",
  "pie",
  "hist",
  "heatmap",
  "funnel",
  "waterfall",
  "radar",
  "gauge",
  "sankey",
  "treemap",
];
export type ChartType = (typeof CHART_TYPES)[number];

export declare const THEMES: readonly [
  "folio",
  "highcharts",
  "shadcn",
  "docs",
  "ant",
  "recharts",
];
export type ChartTheme = (typeof THEMES)[number];

export declare const PALETTES: readonly [
  "ink",
  "porcelain",
  "warm",
  "cool",
  "vivid",
];
export type ChartPalette = (typeof PALETTES)[number];

export type Table = {
  columns: string[];
  rows: string[][];
};

export type ChartIR = {
  markvis: 2;
  type: ChartType;
  title: string;
  theme: ChartTheme;
  palette?: ChartPalette;
  unit?: string;
  x: string;
  y?: string;
  series?: string;
  layout?: "grouped" | "stacked" | "percent";
  innerRadius?: number;
  min?: number;
  max?: number;
  surface: "light" | "dark" | "export";
  orient?: "horizontal" | "vertical";
  role?: string;
  table: Table;
};

export declare const ChartIRSchema: {
  parse(data: unknown): ChartIR;
  safeParse(
    data: unknown,
  ):
    | { success: true; data: ChartIR }
    | { success: false; error: { issues: unknown[] } };
};
