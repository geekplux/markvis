import { describe, expect, it } from "vitest";
import {
  CHART_TYPES,
  ChartIRSchema,
  PALETTES,
  THEMES,
  columnValues,
  isChartPalette,
  isChartTheme,
  isChartType,
} from "./index.js";

const barTable = {
  columns: ["month", "revenue"],
  rows: [
    ["Jan", "120"],
    ["Feb", "180"],
    ["Mar", "150"],
  ],
};

describe("@markvis/ir", () => {
  it("freezes exactly six chart types", () => {
    expect([...CHART_TYPES]).toEqual([
      "bar",
      "line",
      "area",
      "scatter",
      "pie",
      "hist",
    ]);
  });

  it("accepts a bar Chart IR", () => {
    const ir = ChartIRSchema.parse({
      markvis: 2,
      type: "bar",
      title: "Q3 Revenue",
      unit: "USD k",
      x: "month",
      y: "revenue",
      table: barTable,
    });
    expect(ir.type).toBe("bar");
    expect(ir.markvis).toBe(2);
    expect(columnValues(ir.table, "month")).toEqual(["Jan", "Feb", "Mar"]);
  });

  it("accepts hist without y", () => {
    const ir = ChartIRSchema.parse({
      markvis: 2,
      type: "hist",
      title: "Latency ms",
      x: "ms",
      table: {
        columns: ["ms"],
        rows: [["12"], ["15"], ["14"]],
      },
    });
    expect(ir.y).toBeUndefined();
  });

  it("requires y for non-hist types", () => {
    const result = ChartIRSchema.safeParse({
      markvis: 2,
      type: "pie",
      title: "Share",
      x: "name",
      table: {
        columns: ["name", "value"],
        rows: [
          ["A", "40"],
          ["B", "35"],
        ],
      },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a seventh type", () => {
    const result = ChartIRSchema.safeParse({
      markvis: 2,
      type: "donut",
      title: "No",
      x: "name",
      y: "value",
      table: {
        columns: ["name", "value"],
        rows: [["A", "1"]],
      },
    });
    expect(result.success).toBe(false);
  });

  it("isChartType matches the frozen set only", () => {
    expect(isChartType("bar")).toBe(true);
    expect(isChartType("heatmap")).toBe(false);
  });

  it("does not invent fields", () => {
    const result = ChartIRSchema.safeParse({
      markvis: 2,
      type: "bar",
      title: "Q3",
      x: "month",
      y: "revenue",
      table: barTable,
      engine: "d3",
    });
    expect(result.success).toBe(false);
  });

  it("does not invent table fields", () => {
    const result = ChartIRSchema.safeParse({
      markvis: 2,
      type: "bar",
      title: "Q3",
      x: "month",
      y: "revenue",
      table: { ...barTable, extra: true },
    });
    expect(result.success).toBe(false);
  });

  it("defaults omitted theme to folio", () => {
    const ir = ChartIRSchema.parse({
      markvis: 2,
      type: "bar",
      title: "Q3 Revenue",
      x: "month",
      y: "revenue",
      table: barTable,
    });
    expect(ir.theme).toBe("folio");
  });

  it("accepts the five themes", () => {
    expect([...THEMES]).toEqual(["folio", "highcharts", "shadcn", "docs", "ant", "recharts"]);
    for (const theme of THEMES) {
      const ir = ChartIRSchema.parse({
        markvis: 2,
        type: "bar",
        title: "Q3",
        theme,
        x: "month",
        y: "revenue",
        table: barTable,
      });
      expect(ir.theme).toBe(theme);
      expect(isChartTheme(theme)).toBe(true);
    }
    expect(isChartTheme("neon")).toBe(false);
  });

  it("rejects an unknown theme", () => {
    const result = ChartIRSchema.safeParse({
      markvis: 2,
      type: "bar",
      title: "Q3",
      theme: "neon",
      x: "month",
      y: "revenue",
      table: barTable,
    });
    expect(result.success).toBe(false);
  });

  it("omits palette when not provided", () => {
    const ir = ChartIRSchema.parse({
      markvis: 2,
      type: "bar",
      title: "Q3 Revenue",
      x: "month",
      y: "revenue",
      table: barTable,
    });
    expect(ir.palette).toBeUndefined();
  });

  it("accepts locked palettes", () => {
    expect([...PALETTES]).toEqual(["ink", "porcelain", "warm", "cool", "vivid"]);
    for (const palette of PALETTES) {
      const ir = ChartIRSchema.parse({
        markvis: 2,
        type: "bar",
        title: "Q3",
        theme: "folio",
        palette,
        x: "month",
        y: "revenue",
        table: barTable,
      });
      expect(ir.palette).toBe(palette);
      expect(isChartPalette(palette)).toBe(true);
    }
    expect(isChartPalette("neon")).toBe(false);
  });

  it("rejects an unknown palette", () => {
    const result = ChartIRSchema.safeParse({
      markvis: 2,
      type: "bar",
      title: "Q3",
      palette: "neon",
      x: "month",
      y: "revenue",
      table: barTable,
    });
    expect(result.success).toBe(false);
  });


  it("accepts layout on bar/line/area and rejects on pie", () => {
    for (const type of ["bar", "line", "area"] as const) {
      const ir = ChartIRSchema.parse({
        markvis: 2,
        type,
        title: "L",
        x: "month",
        y: "revenue",
        layout: "stacked",
        table: barTable,
      });
      expect(ir.layout).toBe("stacked");
    }
    const bad = ChartIRSchema.safeParse({
      markvis: 2,
      type: "pie",
      title: "P",
      x: "name",
      y: "value",
      layout: "stacked",
      table: {
        columns: ["name", "value"],
        rows: [["A", "1"], ["B", "2"]],
      },
    });
    expect(bad.success).toBe(false);
  });

  it("accepts innerRadius on pie and rejects on bar", () => {
    const ir = ChartIRSchema.parse({
      markvis: 2,
      type: "pie",
      title: "P",
      x: "name",
      y: "value",
      innerRadius: 0.4,
      table: {
        columns: ["name", "value"],
        rows: [["A", "1"], ["B", "2"]],
      },
    });
    expect(ir.innerRadius).toBe(0.4);
    const bad = ChartIRSchema.safeParse({
      markvis: 2,
      type: "bar",
      title: "B",
      x: "month",
      y: "revenue",
      innerRadius: 0.4,
      table: barTable,
    });
    expect(bad.success).toBe(false);
    const outOfRange = ChartIRSchema.safeParse({
      markvis: 2,
      type: "pie",
      title: "P",
      x: "name",
      y: "value",
      innerRadius: 1.5,
      table: {
        columns: ["name", "value"],
        rows: [["A", "1"]],
      },
    });
    expect(outOfRange.success).toBe(false);
  });

});
