import { describe, expect, it } from "vitest";
import {
  CHART_TYPES,
  ChartIRSchema,
  columnValues,
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
});
