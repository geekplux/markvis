import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, type ChartIR } from "@markvis/ir";
import {
  PALETTE,
  binHistogram,
  chartId,
  renderSvg,
} from "../src/index.js";
import { niceTicks, formatNumber } from "../src/scale.js";

const here = dirname(fileURLToPath(import.meta.url));

function barChart(overrides: Partial<ChartIR> = {}): ChartIR {
  return ChartIRSchema.parse({
    markvis: 2,
    type: "bar",
    title: "Q3 Revenue",
    unit: "USD k",
    x: "month",
    y: "revenue",
    table: {
      columns: ["month", "revenue"],
      rows: [
        ["Jan", "120"],
        ["Feb", "180"],
        ["Mar", "150"],
      ],
    },
    ...overrides,
  });
}

describe("palette", () => {
  it("has eight colorblind-friendly Okabe–Ito colors, not a red-green pair", () => {
    expect(PALETTE).toEqual([
      "#0072B2",
      "#D55E00",
      "#009E73",
      "#CC79A7",
      "#56B4E9",
      "#E69F00",
      "#000000",
      "#F0E442",
    ]);
    expect(PALETTE).not.toContain("#FF0000");
    expect(PALETTE).not.toContain("#00FF00");
    expect(new Set(PALETTE).size).toBe(8);
  });
});

describe("determinism", () => {
  it("emits identical bytes for the same IR twice", () => {
    const chart = barChart();
    const a = renderSvg(chart);
    const b = renderSvg(chart);
    expect(a).toBe(b);
    expect(a).toContain(chartId(chart));
  });

  it("changes id when IR title changes", () => {
    const a = chartId(barChart({ title: "One" }));
    const b = chartId(barChart({ title: "Two" }));
    expect(a).not.toBe(b);
    expect(a.startsWith("mv-")).toBe(true);
  });
});

describe("svg semantics", () => {
  it("includes figure-like aria, title, and desc", () => {
    const svg = renderSvg(barChart());
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg).toContain('role="img"');
    expect(svg).toContain("aria-label=");
    expect(svg).toContain("aria-labelledby=");
    expect(svg).toContain("aria-describedby=");
    expect(svg).toMatch(/<title id="mv-[a-f0-9]+-title">Q3 Revenue<\/title>/);
    expect(svg).toMatch(/<desc id="mv-[a-f0-9]+-desc">[^<]+<\/desc>/);
    const title = svg.match(/<title\b[^>]*>([^<]*)<\/title>/);
    const desc = svg.match(/<desc\b[^>]*>([^<]*)<\/desc>/);
    expect(title?.[1]?.trim().length).toBeGreaterThan(0);
    expect(desc?.[1]?.trim().length).toBeGreaterThan(0);
    expect(svg).toContain('data-chart-type="bar"');
  });

  it("escapes XML in titles and labels", () => {
    const chart = barChart({
      title: `Q3 <Rev> & "A"`,
      table: {
        columns: ["month", "revenue"],
        rows: [["A&B<C>", "1"]],
      },
    });
    const svg = renderSvg(chart);
    expect(svg).toContain("Q3 &lt;Rev&gt; &amp; &quot;A&quot;");
    expect(svg).toContain("A&amp;B&lt;C&gt;");
    expect(svg).not.toContain("<Rev>");
  });
});

describe("cartesian rules", () => {
  it("keeps unsorted category order", () => {
    const chart = ChartIRSchema.parse({
      markvis: 2,
      type: "line",
      title: "Campaign months",
      x: "month",
      y: "signups",
      table: {
        columns: ["month", "signups"],
        rows: [
          ["Mar", "40"],
          ["Jan", "22"],
          ["Dec", "55"],
          ["Jun", "30"],
        ],
      },
    });
    const svg = renderSvg(chart);
    const labels = [...svg.matchAll(/data-full-label="([^"]+)"/g)].map(
      (m) => m[1],
    );
    expect(labels).toEqual(["Mar", "Jan", "Dec", "Jun"]);
  });

  it("groups bars when series is present", () => {
    const chart = ChartIRSchema.parse({
      markvis: 2,
      type: "bar",
      title: "Seats by plan",
      x: "month",
      y: "seats",
      series: "plan",
      table: {
        columns: ["month", "plan", "seats"],
        rows: [
          ["Jan", "free", "100"],
          ["Jan", "pro", "20"],
          ["Feb", "free", "110"],
          ["Feb", "pro", "28"],
        ],
      },
    });
    const svg = renderSvg(chart);
    expect(svg).toContain('data-series="free"');
    expect(svg).toContain('data-series="pro"');
    expect(svg).toContain('data-legend="free"');
    expect(svg).toContain('data-legend="pro"');
    const rects = [...svg.matchAll(/<rect\b[^>]*data-x=/g)];
    expect(rects).toHaveLength(4);
  });

  it("draws grid, axes, and palette colors on a bar chart", () => {
    const svg = renderSvg(barChart());
    expect(svg).toContain("<line ");
    expect(svg).toContain('data-chart-type="bar"');
    expect(svg).toContain(PALETTE[0]);
  });
});

describe("pie", () => {
  it("uses raw slice values and does not normalize to 100", () => {
    const chart = ChartIRSchema.parse({
      markvis: 2,
      type: "pie",
      title: "Budget overrun",
      x: "bucket",
      y: "pct",
      table: {
        columns: ["bucket", "pct"],
        rows: [
          ["Infra", "45"],
          ["Product", "35"],
          ["Ops", "25"],
        ],
      },
    });
    const svg = renderSvg(chart);
    expect(svg).toContain('data-raw-value="45"');
    expect(svg).toContain('data-raw-value="35"');
    expect(svg).toContain('data-raw-value="25"');
    expect(svg).toContain("not normalized to 100");
    const values = [...svg.matchAll(/data-raw-value="([^"]+)"/g)].map(
      (m) => Number(m[1]),
    );
    expect(values.reduce((sum, n) => sum + n, 0)).toBe(105);
  });
});

describe("hist", () => {
  it("bins with documented Sturges equal-width algorithm", () => {
    const bins = binHistogram(
      [12, 15, 14, 40, 42, 18].map((value) => ({ value, weight: 1 })),
    );
    expect(bins).toHaveLength(4);
    expect(bins[0]?.count).toBe(4);
    expect(bins[1]?.count).toBe(0);
    expect(bins[2]?.count).toBe(0);
    expect(bins[3]?.count).toBe(2);
    expect(bins[0]?.left).toBe(12);
    expect(bins[3]?.right).toBe(42);
  });

  it("uses y as weight", () => {
    const bins = binHistogram([
      { value: 22, weight: 1 },
      { value: 25, weight: 2 },
      { value: 25, weight: 1 },
      { value: 30, weight: 3 },
      { value: 40, weight: 1 },
    ]);
    expect(bins).toHaveLength(4);
    expect(bins.map((bin) => bin.weight)).toEqual([4, 3, 0, 1]);
  });
});

describe("ticks", () => {
  it("formats large numbers without locale", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1500000)).toBe("1.5M");
    expect(formatNumber(45000000000)).toBe("45B");
    expect(formatNumber(12)).toBe("12");
  });

  it("covers a zero-based bar domain", () => {
    const ticks = niceTicks(0, 180);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(180);
  });
});

describe("source discipline", () => {
  it("does not use clocks or random in renderer sources", () => {
    const srcDir = join(here, "../src");
    const files = readdirSync(srcDir).filter((name) => name.endsWith(".ts"));
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(join(srcDir, file), "utf8");
      expect(source, file).not.toMatch(/Date\.now/);
      expect(source, file).not.toMatch(/Math\.random/);
      expect(source, file).not.toMatch(/randomUUID/);
      expect(source, file).not.toMatch(/\bd3\b/);
      expect(source, file).not.toMatch(/jsdom/);
      expect(source, file).not.toMatch(/legacy/);
    }
  });
});
