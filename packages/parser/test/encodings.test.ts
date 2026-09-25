import { describe, expect, it } from "vitest";
import { parseMarkdown } from "../src/index.js";

const multi = [
  "```chart",
  "type: bar",
  "title: Seats",
  "x: month",
  "y: seats",
  "series: plan",
  "",
  "month,plan,seats",
  "Jan,free,100",
  "Jan,pro,20",
  "Feb,free,110",
  "Feb,pro,28",
  "```",
].join("\n");

describe("Wave 1 encodings (parser)", () => {
  it("accepts layout on bar/line/area", () => {
    for (const type of ["bar", "line", "area"] as const) {
      for (const layout of ["grouped", "stacked", "percent"] as const) {
        const source = multi.replace("type: bar", `type: ${type}\nlayout: ${layout}`);
        const result = parseMarkdown(source, { filename: "enc.md" });
        expect(result.ok, `${type}/${layout}`).toBe(true);
        if (!result.ok) return;
        expect(result.chart.layout).toBe(layout);
      }
    }
  });

  it("accepts innerRadius on pie", () => {
    const source = [
      "```chart",
      "type: pie",
      "innerRadius: 0.4",
      "title: Share",
      "x: region",
      "y: share",
      "",
      "region,share",
      "East,40",
      "West,60",
      "```",
    ].join("\n");
    const result = parseMarkdown(source, { filename: "pie.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.chart.innerRadius).toBe(0.4);
  });

  it("rejects layout on pie/scatter with E_UNKNOWN_FIELD + table", () => {
    for (const type of ["pie", "scatter"] as const) {
      const source = [
        "```chart",
        `type: ${type}`,
        "layout: stacked",
        "title: Bad",
        "x: a",
        "y: b",
        "",
        "a,b",
        "1,2",
        "3,4",
        "```",
      ].join("\n");
      const result = parseMarkdown(source, { filename: "bad.md" });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe("E_UNKNOWN_FIELD");
      expect(result.table.columns.length).toBeGreaterThan(0);
    }
  });

  it("rejects bad layout / innerRadius values with E_UNKNOWN_FIELD", () => {
    const badLayout = multi.replace("type: bar", "type: bar\nlayout: foo");
    const r1 = parseMarkdown(badLayout, { filename: "bad-layout.md" });
    expect(r1.ok).toBe(false);
    if (!r1.ok) {
      expect(r1.error.code).toBe("E_UNKNOWN_FIELD");
      expect(r1.error.message).toMatch(/layout/);
      expect(r1.table.rows.length).toBeGreaterThan(0);
    }

    const badInner = [
      "```chart",
      "type: pie",
      "innerRadius: 2",
      "title: Share",
      "x: region",
      "y: share",
      "",
      "region,share",
      "East,40",
      "West,60",
      "```",
    ].join("\n");
    const r2 = parseMarkdown(badInner, { filename: "bad-inner.md" });
    expect(r2.ok).toBe(false);
    if (!r2.ok) {
      expect(r2.error.code).toBe("E_UNKNOWN_FIELD");
      expect(r2.error.message).toMatch(/innerRadius/);
    }

    const nonNum = badInner.replace("innerRadius: 2", "innerRadius: nope");
    const r3 = parseMarkdown(nonNum, { filename: "bad-inner2.md" });
    expect(r3.ok).toBe(false);
    if (!r3.ok) expect(r3.error.code).toBe("E_UNKNOWN_FIELD");
  });

  it("still rejects unknown extras like bins on hist", () => {
    const source = [
      "```chart",
      "type: hist",
      "bins: 12",
      "title: Dist",
      "x: value",
      "",
      "value",
      "1.2",
      "2.4",
      "```",
    ].join("\n");
    const result = parseMarkdown(source, { filename: "hist.md" });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe("E_UNKNOWN_FIELD");
  });
});
