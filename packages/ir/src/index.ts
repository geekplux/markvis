import { z } from "zod";

export const CHART_TYPES = [
  "bar",
  "line",
  "area",
  "scatter",
  "pie",
  "hist",
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

export const ChartTypeSchema = z.enum(CHART_TYPES);

export const TableSchema = z.object({
  columns: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
});

export type Table = z.infer<typeof TableSchema>;

export const ChartIRSchema = z
  .object({
    markvis: z.literal(2),
    type: ChartTypeSchema,
    title: z.string().min(1),
    unit: z.string().min(1).optional(),
    x: z.string().min(1),
    y: z.string().min(1).optional(),
    series: z.string().min(1).optional(),
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
  });

export type ChartIR = z.output<typeof ChartIRSchema>;

export function isChartType(value: string): value is ChartType {
  return (CHART_TYPES as readonly string[]).includes(value);
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
