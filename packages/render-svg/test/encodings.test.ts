import { describe, expect, it } from "vitest";
import { ChartIRSchema } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "../src/index.js";

function mustParse(source: string) {
  const result = parseMarkdown(source, { filename: "enc.md" });
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error("parse failed");
  return ChartIRSchema.parse(result.chart);
}

const multiBar = [
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

describe("Wave 1 encodings (render)", () => {
  it("omit layout matches explicit grouped (byte-identical)", () => {
    const omit = mustParse(multiBar);
    const grouped = mustParse(multiBar.replace("type: bar", "type: bar\nlayout: grouped"));
    expect(renderSvg(omit)).toBe(renderSvg(grouped));
  });

  it("stacked bar differs from grouped and is deterministic", () => {
    const grouped = mustParse(multiBar);
    const stacked = mustParse(multiBar.replace("type: bar", "type: bar\nlayout: stacked"));
    const a = renderSvg(stacked);
    const b = renderSvg(stacked);
    expect(a).toBe(b);
    expect(a).not.toBe(renderSvg(grouped));
    expect(a).toContain('data-layout="stacked"');
  });

  it("percent bar uses 100-scale segments", () => {
    const percent = mustParse(multiBar.replace("type: bar", "type: bar\nlayout: percent"));
    const svg = renderSvg(percent);
    expect(svg).toContain('data-layout="percent"');
    // Jan free 100/120 → ~83.333..., pro 20/120 → ~16.666...
    expect(svg).toMatch(/data-y="83\.3/);
  });

  it("stacked area (or line) is cumulative and deterministic", () => {
    const source = multiBar.replace("type: bar", "type: area\nlayout: stacked");
    const chart = mustParse(source);
    const a = renderSvg(chart);
    expect(a).toBe(renderSvg(chart));
    expect(a).toContain('data-layout="stacked"');
  });

  it("pie innerRadius: omit keeps theme; explicit 0 forces full pie; 0.4 donut", () => {
    const base = [
      "```chart",
      "type: pie",
      "theme: shadcn",
      "title: Share",
      "x: region",
      "y: share",
      "",
      "region,share",
      "East,40",
      "West,60",
      "```",
    ].join("\n");
    const omit = renderSvg(mustParse(base));
    const zero = renderSvg(
      mustParse(base.replace("type: pie", "type: pie\ninnerRadius: 0")),
    );
    const hole = renderSvg(
      mustParse(base.replace("type: pie", "type: pie\ninnerRadius: 0.4")),
    );
    expect(omit).toContain("data-pie-inner-ratio");
    // shadcn default hole is 0.5 — omit should keep it
    expect(omit).toContain('data-pie-inner-ratio="0.5"');
    expect(zero).toContain('data-pie-inner-ratio="0"');
    expect(hole).toContain('data-pie-inner-ratio="0.4"');
    expect(zero).not.toBe(omit);
    expect(hole).not.toBe(omit);
  });
});
