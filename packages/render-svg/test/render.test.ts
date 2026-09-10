import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, type ChartIR } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import {
  PALETTE,
  binHistogram,
  chartId,
  folio,
  highcharts,
  shadcn,
  docs,
  ant,
  renderSvg,
  themeTokens,
} from "../src/index.js";
import { niceTicks, formatNumber } from "../src/scale.js";

const here = dirname(fileURLToPath(import.meta.url));


function stripPaint(svg: string): string {
  return svg
    .replace(/#[0-9a-fA-F]{3,8}/g, "#X")
    .replace(/rgba?\([^)]+\)/g, "#X")
    .replace(/\s+/g, " ");
}

/** Structural axes for B&W theme naming (THEMES.md). Hex ignored. */
function bwAxes(svg: string) {
  return {
    legend: /data-legend=/.test(svg),
    endLabel: /data-end-label/.test(svg),
    plotFrame: /data-plot-border=/.test(svg),
    axisTitles: /data-axis-titles=/.test(svg),
    viewBox: (svg.match(/viewBox="([^"]+)"/) ?? [, ""])[1],
    titleSize: (svg.match(/font-size="(\d+(?:\.\d+)?)"[^>]*font-weight="6/) ??
      svg.match(/font-weight="6\d*"[^>]*font-size="(\d+(?:\.\d+)?)"/) ?? [, ""])[1],
    markerR: (svg.match(/<circle[^>]*\br="([0-9.]+)"/) ?? [, ""])[1],
    barRx: (svg.match(/\brx="([0-9.]+)"/) ?? [, "0"])[1],
  };
}

function bwDiffCount(
  a: ReturnType<typeof bwAxes>,
  b: ReturnType<typeof bwAxes>,
): number {
  let n = 0;
  if (a.legend !== b.legend) n += 1;
  if (a.endLabel !== b.endLabel) n += 1;
  if (a.plotFrame !== b.plotFrame) n += 1;
  if (a.axisTitles !== b.axisTitles) n += 1;
  if (a.viewBox !== b.viewBox) n += 1;
  if (a.titleSize !== b.titleSize) n += 1;
  if (a.markerR !== b.markerR) n += 1;
  if (a.barRx !== b.barRx) n += 1;
  return n;
}

function multiLine(theme: ChartIR["theme"]): ChartIR {
  return ChartIRSchema.parse({
    markvis: 2,
    type: "line",
    title: "Multi",
    theme,
    x: "month",
    y: "value",
    series: "kind",
    table: {
      columns: ["month", "value", "kind"],
      rows: [
        ["Jan", "1", "A"],
        ["Feb", "2", "A"],
        ["Jan", "3", "B"],
        ["Feb", "4", "B"],
      ],
    },
  });
}

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
  it("has eight series hues, not a red-green pair", () => {
    expect(PALETTE).toEqual([
      "#3B82F6",
      "#F97316",
      "#10B981",
      "#A855F7",
      "#EAB308",
      "#14B8A6",
      "#F43F5E",
      "#64748B",
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
    const marks = [...svg.matchAll(/<(?:rect|path)\b[^>]*data-x=/g)];
    expect(marks).toHaveLength(4);
  });

  it("draws baseline, no axis box, and palette colors on a bar chart", () => {
    const svg = renderSvg(barChart());
    expect(svg).not.toContain("<line ");
    expect(svg).toContain('stroke="#171717"');
    expect(svg).toContain('stroke-opacity="0.28"');
    expect(svg).toContain('data-chart-type="bar"');
    expect(svg).toContain(PALETTE[0]);
    expect(svg).not.toContain('shape-rendering="crispEdges"');
    expect(svg).not.toContain('fill="#F7F4EF"');
    expect(svg).not.toMatch(/<rect width="100%" height="100%"/);
    expect(svg).toContain("Q3 Revenue");
    expect(svg).toContain(" · USD k");
    expect(svg).toContain('text-anchor="start"');
    expect(svg).toContain('font-size="17"');
    expect(svg).not.toContain("revenue (USD k)");
    expect(svg).not.toContain("rotate(-90");
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
  it("formats integers ≥ 1000 with thousands separators, not compact suffixes", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(12)).toBe("12");
    expect(formatNumber(1200)).toBe("1,200");
    expect(formatNumber(1500000)).toBe("1,500,000");
    expect(formatNumber(45000000000)).toBe("45,000,000,000");
    expect(formatNumber(420000)).toBe("420,000");
  });

  it("covers a zero-based bar domain", () => {
    const ticks = niceTicks(0, 180);
    expect(ticks[0]).toBe(0);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(180);
  });
});

describe("folio tokens", () => {
  it("is the current default look", () => {
    expect(folio.INK).toBe("#171717");
    expect(folio.PALETTE).toEqual(PALETTE);
    expect(themeTokens("folio")).toBe(folio);
  });

  it("matches examples/out/themes/folio/01-bar-basic.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "folio" });
    const svg = renderSvg(chart);
    const outDir = join(repoRoot, "examples/out/themes/folio");
    const outPath = join(outDir, "01-bar-basic.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
  });
});

describe("highcharts tokens", () => {
  it("is a denser, stronger-grid, legend-friendly pack", () => {
    expect(themeTokens("highcharts")).toBe(highcharts);
    expect(highcharts.PLOT_MIN_RATIO).toBeGreaterThan(folio.PLOT_MIN_RATIO);
    expect(Number(highcharts.HAIRLINE_OPACITY)).toBeGreaterThan(
      Number(folio.HAIRLINE_OPACITY),
    );
    expect(highcharts.MAX_INTERIOR_GRID).toBeGreaterThan(
      folio.MAX_INTERIOR_GRID,
    );
    expect(highcharts.TYPE.legend.size).toBeGreaterThan(folio.TYPE.legend.size);
    expect(highcharts.TITLE_TO_PLOT).toBeGreaterThan(folio.TITLE_TO_PLOT);
    expect(highcharts.PALETTE[0]).not.toBe(folio.PALETTE[0]);
    expect(highcharts.END_LABEL_SERIES_MAX).toBe(0);
    expect(highcharts.AXIS_TITLES).toBe(true);
    expect(highcharts.PLOT_BORDER_WIDTH).toBeGreaterThan(0);
    expect(highcharts.PLOT_BG).toBeTruthy();
    expect(highcharts.LINE_POINT_R).toBeGreaterThan(folio.LINE_POINT_R);
  });

  it("renders a different SVG than folio for the same bar IR", () => {
    const a = renderSvg(barChart({ theme: "folio" }));
    const b = renderSvg(barChart({ theme: "highcharts" }));
    expect(a).not.toBe(b);
    expect(b).toContain(highcharts.PALETTE[0]!);
    expect(b).toContain(
      'font-family="Arial, Helvetica, &quot;Segoe UI&quot;, sans-serif"',
    );
    expect(b).toContain('data-plot-border="1"');
    expect(b).toContain('data-plot-bg="1"');
    expect(b).toContain('data-axis-titles="1"');
    expect(a).not.toContain('data-plot-border="1"');
  });

  it("uses color legend for multi-series line (not end-labels)", () => {
    const chart = ChartIRSchema.parse({
      markvis: 2,
      type: "line",
      title: "Multi",
      theme: "highcharts",
      x: "month",
      y: "value",
      series: "kind",
      table: {
        columns: ["month", "value", "kind"],
        rows: [
          ["Jan", "1", "A"],
          ["Feb", "2", "A"],
          ["Jan", "3", "B"],
          ["Feb", "4", "B"],
        ],
      },
    });
    const svg = renderSvg(chart);
    expect(svg).toContain('data-plot-border="1"');
    expect(svg).toContain('data-plot-bg="1"');
    expect(svg).toContain('data-legend="A"');
    expect(svg).toContain('data-legend="B"');
    expect(svg).not.toContain("data-end-label");
    expect(svg).toContain('r="3.5"');
  });

  it("matches examples/out/themes/highcharts/02-line-multi.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/02-line-multi.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "02-line-multi.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "highcharts" });
    const svg = renderSvg(chart);
    const outPath = join(
      repoRoot,
      "examples/out/themes/highcharts/02-line-multi.svg",
    );
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(join(repoRoot, "examples/out/themes/highcharts"), {
        recursive: true,
      });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
    expect(committed).toContain('data-legend="free"');
    expect(committed).toContain('data-legend="pro"');
    expect(committed).toContain('data-plot-border="1"');
    expect(committed).not.toContain("data-end-label");
    expect(committed).toContain('r="3.5"');
  });

  it("matches examples/out/themes/highcharts/01-bar-basic.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "highcharts" });
    const svg = renderSvg(chart);
    const outPath = join(repoRoot, "examples/out/themes/highcharts/01-bar-basic.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(join(repoRoot, "examples/out/themes/highcharts"), { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
  });
});


describe("shadcn tokens", () => {
  it("is a rounded, chart-1..5, card-quiet pack", () => {
    expect(themeTokens("shadcn")).toBe(shadcn);
    expect(shadcn.BAR_RX).toBeGreaterThan(folio.BAR_RX);
    expect(shadcn.PALETTE).toHaveLength(5);
    expect(shadcn.PALETTE[0]).not.toBe(folio.PALETTE[0]);
    expect(Number(shadcn.STRUCTURE_OPACITY)).toBeLessThan(
      Number(folio.STRUCTURE_OPACITY),
    );
    expect(Number(shadcn.HAIRLINE_OPACITY)).toBeLessThan(
      Number(folio.HAIRLINE_OPACITY),
    );
    expect(shadcn.TYPE.tick.fill).toBe(shadcn.QUIET);
    expect(shadcn.MAX_INTERIOR_GRID).toBeLessThan(folio.MAX_INTERIOR_GRID);
    expect(shadcn.END_LABEL_SERIES_MAX).toBe(0);
    expect(shadcn.PLOT_BORDER).toBe("#e5e5e5");
    expect(shadcn.PLOT_BORDER_WIDTH).toBeGreaterThan(0);
    expect(shadcn.AXIS_TITLES).toBe(false);
    expect(shadcn.BAR_GAP_FEW).toBeGreaterThan(folio.BAR_GAP_FEW);
  });

  it("is not highcharts chrome (soft card, no axis titles, rounder bars)", () => {
    expect(shadcn.PLOT_BORDER).not.toBe(highcharts.PLOT_BORDER);
    expect(shadcn.PLOT_BORDER).toBe("#e5e5e5");
    expect(highcharts.PLOT_BORDER).toBe("#ccd6eb");
    expect(shadcn.AXIS_TITLES).toBe(false);
    expect(highcharts.AXIS_TITLES).toBe(true);
    expect(shadcn.BAR_RX).toBeGreaterThan(highcharts.BAR_RX);
    expect(shadcn.SVG_HEIGHT).not.toBe(highcharts.SVG_HEIGHT);
    expect(shadcn.SVG_HEIGHT).not.toBe(folio.SVG_HEIGHT);
    expect(shadcn.PALETTE[0]).not.toBe(highcharts.PALETTE[0]);
    const folioSvg = renderSvg(barChart({ theme: "folio" }));
    const hcSvg = renderSvg(barChart({ theme: "highcharts" }));
    const shSvg = renderSvg(barChart({ theme: "shadcn" }));
    expect(shSvg).not.toBe(folioSvg);
    expect(shSvg).not.toBe(hcSvg);
    expect(shSvg).toContain("#e5e5e5");
    expect(shSvg).not.toContain("#ccd6eb");
    expect(shSvg).not.toContain('data-axis-titles="1"');
    expect(hcSvg).toContain('data-axis-titles="1"');
  });

  it("renders a different SVG than folio for the same bar IR", () => {
    const a = renderSvg(barChart({ theme: "folio" }));
    const b = renderSvg(barChart({ theme: "shadcn" }));
    expect(a).not.toBe(b);
    expect(b).toContain(shadcn.PALETTE[0]!);
    expect(b).toContain(
      'font-family="Inter, ui-sans-serif, system-ui, -apple-system, &quot;Segoe UI&quot;, sans-serif"',
    );
    expect(b).toContain('data-plot-border="1"');
    expect(b).toContain("#e5e5e5");
    expect(a).not.toContain('data-plot-border="1"');
  });

  it("uses color legend for multi-series line (not end-labels)", () => {
    const chart = ChartIRSchema.parse({
      markvis: 2,
      type: "line",
      title: "Multi",
      theme: "shadcn",
      x: "month",
      y: "value",
      series: "kind",
      table: {
        columns: ["month", "value", "kind"],
        rows: [
          ["Jan", "1", "A"],
          ["Feb", "2", "A"],
          ["Jan", "3", "B"],
          ["Feb", "4", "B"],
        ],
      },
    });
    const svg = renderSvg(chart);
    expect(svg).toContain('data-plot-border="1"');
    expect(svg).toContain("#e5e5e5");
    expect(svg).toContain('data-legend="A"');
    expect(svg).toContain('data-legend="B"');
    expect(svg).not.toContain("data-end-label");
    expect(svg).toContain('r="3.5"');
    expect(svg).not.toContain("data-axis-titles");
  });

  it("matches examples/out/themes/shadcn/01-bar-basic.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "shadcn" });
    const svg = renderSvg(chart);
    const outDir = join(repoRoot, "examples/out/themes/shadcn");
    const outPath = join(outDir, "01-bar-basic.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
  });

  it("matches examples/out/themes/shadcn/02-line-multi.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/02-line-multi.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "02-line-multi.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "shadcn" });
    const svg = renderSvg(chart);
    const outPath = join(
      repoRoot,
      "examples/out/themes/shadcn/02-line-multi.svg",
    );
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(join(repoRoot, "examples/out/themes/shadcn"), {
        recursive: true,
      });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
    expect(committed).toContain('data-legend="free"');
    expect(committed).toContain('data-plot-border="1"');
    expect(committed).not.toContain("data-end-label");
    expect(committed).toContain('r="3.5"');
  });
});


describe("ant tokens", () => {
  it("is a technical-axes, teal/brick, tight-padding pack", () => {
    expect(themeTokens("ant")).toBe(ant);
    expect(ant.AXIS_TITLES).toBe(true);
    expect(ant.END_LABEL_SERIES_MAX).toBe(0);
    expect(ant.PLOT_BORDER).toBe("#d9d9d9");
    expect(ant.PLOT_BORDER_WIDTH).toBeGreaterThan(0);
    expect(ant.TYPE.title.size).toBeGreaterThan(folio.TYPE.title.size);
    expect(ant.TITLE_TO_PLOT).toBeGreaterThan(folio.TITLE_TO_PLOT);
    expect(ant.MAX_INTERIOR_GRID).toBeGreaterThan(folio.MAX_INTERIOR_GRID);
    expect(ant.SVG_HEIGHT).toBeLessThan(folio.SVG_HEIGHT);
    expect(ant.SVG_HEIGHT).not.toBe(highcharts.SVG_HEIGHT);
    expect(ant.SVG_HEIGHT).not.toBe(shadcn.SVG_HEIGHT);
    expect(ant.BAR_RX).toBe(2);
    expect(ant.PALETTE[0]).toBe("#5AD8A6");
    expect(ant.PALETTE[0]).not.toBe(folio.PALETTE[0]);
    expect(ant.PALETTE[0]).not.toBe(highcharts.PALETTE[0]);
    expect(ant.PALETTE[0]).not.toBe(shadcn.PALETTE[0]);
    expect(ant.PLOT_BORDER).not.toBe(highcharts.PLOT_BORDER);
    expect(ant.PLOT_BORDER).not.toBe(shadcn.PLOT_BORDER);
  });

  it("renders geometry distinct from folio / highcharts / shadcn", () => {
    const f = renderSvg(barChart({ theme: "folio" }));
    const h = renderSvg(barChart({ theme: "highcharts" }));
    const s = renderSvg(barChart({ theme: "shadcn" }));
    const a = renderSvg(barChart({ theme: "ant" }));
    expect(a).not.toBe(f);
    expect(a).not.toBe(h);
    expect(a).not.toBe(s);
    expect(a).toContain(ant.PALETTE[0]!);
    expect(a).toContain('data-plot-border="1"');
    expect(a).toContain("#d9d9d9");
    expect(a).toContain('data-axis-titles="1"');
    expect(s).not.toContain('data-axis-titles="1"');
  });

  it("uses color legend for multi-series line", () => {
    const chart = ChartIRSchema.parse({
      markvis: 2,
      type: "line",
      title: "Multi",
      theme: "ant",
      x: "month",
      y: "value",
      series: "kind",
      table: {
        columns: ["month", "value", "kind"],
        rows: [
          ["Jan", "1", "A"],
          ["Feb", "2", "A"],
          ["Jan", "3", "B"],
          ["Feb", "4", "B"],
        ],
      },
    });
    const svg = renderSvg(chart);
    expect(svg).toContain('data-legend="A"');
    expect(svg).toContain('data-legend="B"');
    expect(svg).not.toContain("data-end-label");
    expect(svg).toContain('data-plot-border="1"');
  });

  it("matches examples/out/themes/ant/01-bar-basic.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "ant" });
    const svg = renderSvg(chart);
    const outDir = join(repoRoot, "examples/out/themes/ant");
    const outPath = join(outDir, "01-bar-basic.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
  });

  it("matches examples/out/themes/ant/02-line-multi.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/02-line-multi.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "02-line-multi.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "ant" });
    const svg = renderSvg(chart);
    const outPath = join(repoRoot, "examples/out/themes/ant/02-line-multi.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(join(repoRoot, "examples/out/themes/ant"), { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
    expect(committed).toContain('data-legend="free"');
    expect(committed).not.toContain("data-end-label");
  });

  it("matches examples/out/themes/ant/05-pie-raw.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/05-pie-raw.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "05-pie-raw.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "ant" });
    const svg = renderSvg(chart);
    const outPath = join(repoRoot, "examples/out/themes/ant/05-pie-raw.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(join(repoRoot, "examples/out/themes/ant"), { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    expect(svg).toBe(readFileSync(outPath, "utf8"));
    expect(svg).toContain(ant.PALETTE[0]!);
  });
});

describe("docs tokens", () => {
  it("is a zinc/slate, thin-tick, quiet-fill pack for VitePress page figures", () => {
    expect(themeTokens("docs")).toBe(docs);
    expect(docs.INK).toBe("#18181B");
    expect(docs.QUIET).toBe("#64748B");
    expect(docs.TYPE.tick.fill).toBe(docs.QUIET);
    expect(Number(docs.HAIRLINE_OPACITY)).toBeLessThan(
      Number(folio.HAIRLINE_OPACITY),
    );
    expect(Number(docs.STRUCTURE_OPACITY)).toBeLessThan(
      Number(folio.STRUCTURE_OPACITY),
    );
    expect(docs.AREA_OPACITY).toBeLessThan(folio.AREA_OPACITY);
    expect(docs.BAR_RX).toBe(0);
    expect(docs.PALETTE[0]).not.toBe(folio.PALETTE[0]);
    // THEMES.md: leave folio twin — legend policy + tight inset
    expect(docs.END_LABEL_SERIES_MAX).toBe(0);
    expect(docs.MARGIN.left).toBeLessThanOrEqual(40);
    expect(docs.MARGIN.top).toBeLessThanOrEqual(28);
    expect(docs.LINE_STROKE).toBeLessThan(folio.LINE_STROKE);
  });

  it("B&W: multi-series uses bottom legend, not folio end-labels", () => {
    const folioSvg = renderSvg(multiLine("folio"));
    const docsSvg = renderSvg(multiLine("docs"));
    expect(folioSvg).toContain("data-end-label");
    expect(docsSvg).not.toContain("data-end-label");
    expect(docsSvg).toContain('data-legend="A"');
    expect(docsSvg).toContain('data-legend="B"');
    expect(bwDiffCount(bwAxes(folioSvg), bwAxes(docsSvg))).toBeGreaterThanOrEqual(
      3,
    );
    expect(stripPaint(folioSvg)).not.toBe(stripPaint(docsSvg));
  });

  it("renders a different SVG than folio for the same bar IR", () => {
    const a = renderSvg(barChart({ theme: "folio" }));
    const b = renderSvg(barChart({ theme: "docs" }));
    expect(a).not.toBe(b);
    expect(b).toContain(docs.PALETTE[0]!);
    expect(b).toContain(
      'font-family="Inter, ui-sans-serif, system-ui, -apple-system, &quot;Segoe UI&quot;, sans-serif"',
    );
    expect(bwDiffCount(bwAxes(a), bwAxes(b))).toBeGreaterThanOrEqual(1);
  });

  it("matches examples/out/themes/docs/01-bar-basic.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "docs" });
    const svg = renderSvg(chart);
    const outDir = join(repoRoot, "examples/out/themes/docs");
    const outPath = join(outDir, "01-bar-basic.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
  });
});


describe("B&W theme skeletons", () => {
  it("HC / shadcn / ant each differ from folio on ≥3 structural axes", () => {
    const folioLine = renderSvg(multiLine("folio"));
    const folioBar = renderSvg(barChart({ theme: "folio" }));
    for (const theme of ["highcharts", "shadcn", "ant"] as const) {
      const line = renderSvg(multiLine(theme));
      const bar = renderSvg(barChart({ theme }));
      const n = Math.max(
        bwDiffCount(bwAxes(folioLine), bwAxes(line)),
        bwDiffCount(bwAxes(folioBar), bwAxes(bar)),
      );
      expect(n, theme).toBeGreaterThanOrEqual(3);
      expect(stripPaint(line)).not.toBe(stripPaint(folioLine));
    }
  });
});

describe("source discipline", () => {
  it("does not use clocks or random in renderer sources", () => {
    const repoRoot = join(here, "../../..");
    const dirs = [
      join(here, "../src"),
      join(here, "../themes"),
      join(repoRoot, "packages/themes"),
      join(repoRoot, "packages/themes/folio"),
      join(repoRoot, "packages/themes/highcharts"),
      join(repoRoot, "packages/themes/ant"),
      join(repoRoot, "packages/themes/shadcn"),
      join(repoRoot, "packages/themes/docs"),
    ];
    const files: string[] = [];
    for (const dir of dirs) {
      for (const name of readdirSync(dir).filter((n) => n.endsWith(".ts"))) {
        files.push(join(dir, name));
      }
    }
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, file).not.toMatch(/Date\.now/);
      expect(source, file).not.toMatch(/Math\.random/);
      expect(source, file).not.toMatch(/randomUUID/);
      expect(source, file).not.toMatch(/\bd3\b/);
      expect(source, file).not.toMatch(/jsdom/);
      expect(source, file).not.toMatch(/legacy/);
      expect(source, file).not.toMatch(/highcharts\.com/);
      expect(source, file).not.toMatch(/\bunovis\b/i);
      expect(source, file).not.toMatch(/\brecharts\b/i);
    }
  });
});
