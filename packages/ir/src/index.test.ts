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
  it("freezes exactly thirteen chart types", () => {
    expect([...CHART_TYPES]).toEqual([
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

  it("rejects donut as a type id", () => {
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
    expect(isChartType("heatmap")).toBe(true);
    expect(isChartType("sankey")).toBe(true);
    expect(isChartType("treemap")).toBe(true);
    expect(isChartType("donut")).toBe(false);
  });

  it("requires series for heatmap", () => {
    const table = {
      columns: ["hour", "weekday", "entries"],
      rows: [
        ["7am", "Mon", "420"],
        ["8am", "Tue", "880"],
      ],
    };
    const ok = ChartIRSchema.parse({
      markvis: 2,
      type: "heatmap",
      title: "Heat",
      x: "hour",
      y: "entries",
      series: "weekday",
      table,
    });
    expect(ok.series).toBe("weekday");
    const missing = ChartIRSchema.safeParse({
      markvis: 2,
      type: "heatmap",
      title: "Heat",
      x: "hour",
      y: "entries",
      table,
    });
    expect(missing.success).toBe(false);
  });

  it("requires series for sankey and accepts optional series on treemap", () => {
    const flow = {
      columns: ["from", "to", "riders"],
      rows: [
        ["A", "B", "10"],
        ["B", "C", "4"],
      ],
    };
    const ok = ChartIRSchema.parse({
      markvis: 2,
      type: "sankey",
      title: "Flow",
      x: "from",
      y: "riders",
      series: "to",
      table: flow,
    });
    expect(ok.series).toBe("to");
    const missing = ChartIRSchema.safeParse({
      markvis: 2,
      type: "sankey",
      title: "Flow",
      x: "from",
      y: "riders",
      table: flow,
    });
    expect(missing.success).toBe(false);
    const flat = ChartIRSchema.parse({
      markvis: 2,
      type: "treemap",
      title: "Areas",
      x: "station",
      y: "boardings",
      table: {
        columns: ["station", "boardings"],
        rows: [
          ["Five Points", "1200"],
          ["Midtown", "800"],
        ],
      },
    });
    expect(flat.series).toBeUndefined();
  });

  it("accepts min/max on gauge and rejects min >= max", () => {
    const table = {
      columns: ["station", "uptime"],
      rows: [["Five Points", "99.4"]],
    };
    const ir = ChartIRSchema.parse({
      markvis: 2,
      type: "gauge",
      title: "Up",
      x: "station",
      y: "uptime",
      min: 90,
      max: 100,
      table,
    });
    expect(ir.min).toBe(90);
    expect(ir.max).toBe(100);
    const inverted = ChartIRSchema.safeParse({
      markvis: 2,
      type: "gauge",
      title: "Up",
      x: "station",
      y: "uptime",
      min: 100,
      max: 10,
      table,
    });
    expect(inverted.success).toBe(false);
    const onBar = ChartIRSchema.safeParse({
      markvis: 2,
      type: "bar",
      title: "B",
      x: "month",
      y: "revenue",
      min: 0,
      table: barTable,
    });
    expect(onBar.success).toBe(false);
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
