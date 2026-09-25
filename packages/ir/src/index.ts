import { z } from "zod";

export const CHART_TYPES = [
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
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

export const ChartTypeSchema = z.enum(CHART_TYPES);

/** Grammar packs only — mark form, axes, legend, typeface, chrome. Colors live on palette. */
export const THEMES = [
  "folio",
  "highcharts",
  "shadcn",
  "docs",
  "ant",
  "recharts",
] as const;

export type ChartTheme = (typeof THEMES)[number];

export const ChartThemeSchema = z.enum(THEMES);

/** Color tables only — categorical series fills/strokes. Grammar stays on theme. */
export const PALETTES = [
  "ink",
  "porcelain",
  "warm",
  "cool",
  "vivid",
] as const;

export type ChartPalette = (typeof PALETTES)[number];

export const ChartPaletteSchema = z.enum(PALETTES);

export const TableSchema = z
  .object({
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())).min(1),
  })
  .strict();

export type Table = z.infer<typeof TableSchema>;

export const ChartIRSchema = z
  .object({
    markvis: z.literal(2),
    type: ChartTypeSchema,
    title: z.string().min(1),
    theme: ChartThemeSchema.default("folio"),
    /** Omit → theme pack default series colors. */
    palette: ChartPaletteSchema.optional(),
    unit: z.string().min(1).optional(),
    x: z.string().min(1),
    y: z.string().min(1).optional(),
    series: z.string().min(1).optional(),
    /** bar|line|area only. Omit / grouped → Wave 0 look. */
    layout: z.enum(["grouped", "stacked", "percent"]).optional(),
    /** pie only. Fraction in [0, 1]. Omit → theme PIE_INNER_RATIO. */
    innerRadius: z.number().min(0).max(1).optional(),
    /** gauge, heatmap, or radar. Meaning is type-local. */
    min: z.number().optional(),
    /** gauge, heatmap, or radar. Meaning is type-local. */
    max: z.number().optional(),
    /** light paper, dark paper, or opaque export. Omit → light. */
    surface: z.enum(["light", "dark", "export"]).default("light"),
    /** bar only. Omit → vertical. */
    orient: z.enum(["horizontal", "vertical"]).optional(),
    /** waterfall only. Names the column of delta | total | subtotal. */
    role: z.string().min(1).optional(),
    table: TableSchema,
  })
  .strict()
  .superRefine((val, ctx) => {
    if (val.type !== "hist" && val.y === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "y is required unless type is hist",
        path: ["y"],
      });
    }
    if (!val.table.columns.includes(val.x)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "x must name a table column",
        path: ["x"],
      });
    }
    if (val.y !== undefined && !val.table.columns.includes(val.y)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "y must name a table column",
        path: ["y"],
      });
    }
    if (val.series !== undefined && !val.table.columns.includes(val.series)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "series must name a table column",
        path: ["series"],
      });
    }
    if (val.type === "heatmap" && val.series === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "series is required for heatmap",
        path: ["series"],
      });
    }
    if (val.type === "sankey" && val.series === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "series is required for sankey",
        path: ["series"],
      });
    }
    if (val.layout !== undefined && val.type !== "bar" && val.type !== "line" && val.type !== "area") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "layout is only valid for bar, line, or area",
        path: ["layout"],
      });
    }
    if (val.innerRadius !== undefined && val.type !== "pie") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "innerRadius is only valid for pie",
        path: ["innerRadius"],
      });
    }
    const minTypes = val.type === "gauge" || val.type === "heatmap";
    const maxTypes =
      val.type === "gauge" || val.type === "heatmap" || val.type === "radar";
    if (val.min !== undefined && !minTypes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "min is only valid for gauge or heatmap",
        path: ["min"],
      });
    }
    if (val.max !== undefined && !maxTypes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "max is only valid for gauge, heatmap, or radar",
        path: ["max"],
      });
    }
    if (
      (val.type === "gauge" || val.type === "heatmap") &&
      val.min !== undefined &&
      val.max !== undefined &&
      val.min >= val.max
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "min must be less than max",
        path: ["min"],
      });
    }
    if (val.orient !== undefined && val.type !== "bar") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "orient is only valid for bar",
        path: ["orient"],
      });
    }
    if (val.role !== undefined && val.type !== "waterfall") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "role is only valid for waterfall",
        path: ["role"],
      });
    }
  });

export type ChartIR = z.output<typeof ChartIRSchema>;

export function isChartType(value: string): value is ChartType {
  return (CHART_TYPES as readonly string[]).includes(value);
}

export function isChartTheme(value: string): value is ChartTheme {
  return (THEMES as readonly string[]).includes(value);
}

export function isChartPalette(value: string): value is ChartPalette {
  return (PALETTES as readonly string[]).includes(value);
}

export function columnValues(
  table: { columns: string[]; rows: string[][] },
  name: string,
): string[] {
  const index = table.columns.indexOf(name);
  if (index === -1) {
    return [];
  }
  return table.rows.map((row) => row[index] ?? "");
}

export function columnIndex(
  table: { columns: string[] },
  name: string,
): number {
  return table.columns.indexOf(name);
}
