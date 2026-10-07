import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, THEMES, type ChartIR } from "@markvis/ir";
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
  recharts,
  ink,
  vivid,
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
/** Bars are path marks; rounded tops use Q. Prefer that over rect rx=. */
function barRxAxis(svg: string): string {
  const barPaths = [...svg.matchAll(/<path\b([^>]*)>/g)].filter((m) =>
    /data-(?:x|series)=/.test(m[1]!),
  );
  if (barPaths.length > 0) {
    const rounded = barPaths.some((m) => {
      const d = m[1]!.match(/\bd="([^"]*)"/)?.[1] ?? "";
      return /\bQ\b/.test(d);
    });
    return rounded ? "round" : "0";
  }
  return (svg.match(/\brx="([0-9.]+)"/) ?? [, "0"])[1]!;
}

/** First figure title element (the one carrying <title>). */
function titleElement(svg: string): string {
  return svg.match(/<text\b[^>]*><title>/)?.[0] ?? "";
}

function markerStyle(svg: string): string {
  const mark = svg.match(/<circle\b[^>]*data-series=[^>]*>/)?.[0];
  if (!mark) return "none";
  if (/stroke-width="1\.5"/.test(mark) && !/fill-opacity/.test(mark)) {
    return /fill="#[0-9a-fA-F]{6}" stroke="#ffffff"/.test(mark) ? "halo" : "hollow";
  }
  return /stroke="none"/.test(mark) ? "filled" : "halo";
}

function swatchShape(svg: string): string {
  const legend = svg.match(/<g\b[^>]*>\s*<(rect|circle)\b[^>]*>\s*<text\b[^>]*data-legend/);
  if (!legend) return "none";
  const el = legend[0];
  if (/<circle/.test(el)) return "circle";
  if (/height="3"/.test(el)) return "line";
  return /rx="3"/.test(el) ? "rounded" : "square";
}

function bwAxes(svg: string) {
  const title = titleElement(svg);
  return {
    legend: /data-legend=/.test(svg),
    endLabel: /data-end-label/.test(svg),
    plotFrame: /data-plot-border=/.test(svg),
    axisTitles: /data-axis-titles=/.test(svg),
    titleRule: /data-title-rule=/.test(svg),
    viewBox: (svg.match(/viewBox="([^"]+)"/) ?? [, ""])[1],
    titleSize: (title.match(/font-size="(\d+(?:\.\d+)?)"/) ?? [, ""])[1],
    markerR: (svg.match(/<circle[^>]*\br="([0-9.]+)"/) ?? [, ""])[1],
    barRx: barRxAxis(svg),
    vGrid: /data-v-grid=/.test(svg),
    titleAlign: (title.match(/text-anchor="([^"]+)"/) ?? [, ""])[1],
    titleTracking: /letter-spacing=/.test(title),
    subtitle: /data-subtitle=/.test(svg),
    gridDash: (svg.match(/<g fill="none" stroke="[^"]+" stroke-opacity="[^"]+" stroke-width="[^"]+" stroke-dasharray="([^"]+)"/) ?? [, ""])[1],
    axisTicks: /data-axis-ticks=/.test(svg),
    yAxisLine: /data-axis-line="y"/.test(svg),
    curve: /<path d="M[^"]* C/.test(svg),
    marker: markerStyle(svg),
    swatch: swatchShape(svg),
    figureFrame: /data-frame=/.test(svg),
    numericFont: (svg.match(/font-family=/g) ?? []).length > 1,
  };
}

/** How many structural switches differ. Color is never counted. */
function bwDiffCount(
  a: ReturnType<typeof bwAxes>,
  b: ReturnType<typeof bwAxes>,
): number {
  let n = 0;
  for (const key of Object.keys(a) as (keyof typeof a)[]) {
    if (a[key] !== b[key]) n += 1;
  }
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
    expect(svg).not.toContain('data-surface="light"');
    expect(svg).not.toContain('width="100%" height="100%"');
    expect(svg).toContain("Q3 Revenue");
    expect(svg).toContain(" · USD k");
    expect(svg).toContain('text-anchor="start"');
    expect(svg).toContain('font-size="21"');
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
    expect(highcharts.TYPE.legend.weight).toBeGreaterThan(folio.TYPE.legend.weight);
    expect(highcharts.TITLE_TO_PLOT).toBeGreaterThan(folio.TITLE_TO_PLOT);
    expect(highcharts.PALETTE[0]).not.toBe(folio.PALETTE[0]);
    expect(highcharts.END_LABEL_SERIES_MAX).toBe(0);
    expect(highcharts.AXIS_TITLES).toBe(true);
    expect(highcharts.TITLE.align).toBe("middle");
    expect(highcharts.TITLE.unit).toBe("subtitle");
    expect(highcharts.AXIS.tick).toBeGreaterThan(0);
    expect(highcharts.PLOT_BG).toBeNull();
    expect(highcharts.LINE_POINT_R).toBeGreaterThan(folio.LINE_POINT_R);
  });

  it("renders a different SVG than folio for the same bar IR", () => {
    const a = renderSvg(barChart({ theme: "folio" }));
    const b = renderSvg(barChart({ theme: "highcharts" }));
    expect(a).not.toBe(b);
    expect(b).toContain(highcharts.PALETTE[0]!);
    expect(b).toContain(
      'font-family="&quot;Lucida Grande&quot;, &quot;Lucida Sans Unicode&quot;, Arial, Helvetica, sans-serif"',
    );
    expect(b).toContain('data-axis-ticks="1"');
    expect(b).toContain('text-anchor="middle" font-size="18"');
    expect(b).not.toContain('data-plot-bg="1"');
    expect(b).toContain('data-axis-titles="1"');
    expect(a).not.toContain('data-axis-ticks="1"');
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
    expect(svg).toContain('data-axis-ticks="1"');
    expect(svg).not.toContain('data-plot-bg="1"');
    expect(svg).toContain('data-legend="A"');
    expect(svg).toContain('data-legend="B"');
    expect(svg).not.toContain("data-end-label");
    expect(svg).toContain('r="4"');
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
    expect(committed).toContain('data-legend="walk-up"');
    expect(committed).toContain('data-legend="member"');
    expect(committed).toContain('data-axis-ticks="1"');
    expect(committed).not.toContain("data-end-label");
    expect(committed).toContain('r="4"');
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
    expect(shadcn.FRAME).toEqual({ radius: 12, stroke: true });
    expect(shadcn.LINE_CURVE).toBe("monotone");
    expect(shadcn.MARKER).toBe("none");
    expect(shadcn.AXIS_TITLES).toBe(false);
    expect(shadcn.BAR_GAP_FEW).toBeGreaterThan(folio.BAR_GAP_FEW);
  });

  it("is not highcharts chrome (soft card, no axis titles, rounder bars)", () => {
    expect(shadcn.FRAME.stroke).toBe(true);
    expect(highcharts.FRAME.stroke).toBe(false);
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
    expect(shSvg).toContain('data-frame="1"');
    expect(hcSvg).not.toContain('data-frame="1"');
    expect(shSvg).not.toContain('data-axis-titles="1"');
    expect(hcSvg).toContain('data-axis-titles="1"');
  });

  it("renders a different SVG than folio for the same bar IR", () => {
    const a = renderSvg(barChart({ theme: "folio" }));
    const b = renderSvg(barChart({ theme: "shadcn" }));
    expect(a).not.toBe(b);
    expect(b).toContain(shadcn.PALETTE[0]!);
    expect(b).toContain(
      'font-family="Geist, Inter, ui-sans-serif, system-ui, -apple-system, &quot;Segoe UI&quot;, sans-serif"',
    );
    expect(b).toContain('data-frame="1"');
    expect(b).toContain('data-subtitle="1"');
    expect(a).not.toContain('data-frame="1"');
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
    expect(svg).toContain('data-frame="1"');
    expect(svg).toContain('data-legend="A"');
    expect(svg).toContain('data-legend="B"');
    expect(svg).not.toContain("data-end-label");
    expect(svg).not.toMatch(/<circle[^>]*data-series/);
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
    expect(committed).toContain('data-legend="walk-up"');
    expect(committed).toContain('data-frame="1"');
    expect(committed).not.toContain("data-end-label");
    expect(committed).not.toMatch(/<circle[^>]*data-series/);
  });
});


describe("ant tokens", () => {
  it("is a technical-axes, teal/brick, tight-padding pack", () => {
    expect(themeTokens("ant")).toBe(ant);
    expect(ant.AXIS_TITLES).toBe(true);
    expect(ant.END_LABEL_SERIES_MAX).toBe(0);
    expect(ant.GRID.dash).toBe("4 4");
    expect(ant.MARKER).toBe("halo");
    expect(ant.AXIS.tick).toBeGreaterThan(0);
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
    expect(ant.MARKER).not.toBe(highcharts.MARKER);
    expect(ant.MARKER).not.toBe(shadcn.MARKER);
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
    expect(a).toContain('data-axis-ticks="1"');
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
    expect(svg).toMatch(/<circle[^>]*stroke="#ffffff" stroke-width="1.5" data-series/);
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
    expect(committed).toContain('data-legend="walk-up"');
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
    // A dotted grid needs more ink than a solid hairline to read.
    expect(docs.GRID.dash).toBe("1 3");
    expect(docs.TITLE.case).toBe("upper");
    expect(docs.FONT_NUMERIC).toMatch(/monospace/);
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



describe("recharts tokens", () => {
  it("is an XY-grid, bottom-legend pack", () => {
    expect(themeTokens("recharts")).toBe(recharts);
    expect(recharts.GRID.axes).toBe("xy");
    expect(folio.GRID.axes).toBe("y");
    expect(recharts.LEGEND_BELOW).toBe(true);
    expect(recharts.END_LABEL_SERIES_MAX).toBe(0);
    expect(recharts.AXIS_TITLES).toBe(false);
    expect(recharts.TITLE_RULE).toBe(false);
    expect(recharts.LINE_STROKE).toBe(2);
    expect(recharts.LINE_POINT_R).toBe(3.5);
    expect(recharts.MARKER).toBe("hollow");
    expect(recharts.LINE_CURVE).toBe("monotone");
    expect(recharts.BAR_RX).toBe(0);
    expect(recharts.SVG_HEIGHT).toBe(450);
    expect(recharts.SVG_HEIGHT).not.toBe(folio.SVG_HEIGHT);
    expect(recharts.SVG_HEIGHT).not.toBe(highcharts.SVG_HEIGHT);
    expect(recharts.SVG_HEIGHT).not.toBe(shadcn.SVG_HEIGHT);
    expect(recharts.SVG_HEIGHT).not.toBe(ant.SVG_HEIGHT);
    expect(recharts.MAX_INTERIOR_GRID).toBe(4);
    expect(recharts.PLOT_BG).toBeNull();
    expect(recharts.GRID.dash).toBe("3 3");
    expect(recharts.AXIS).toEqual({ line: "xy", tick: 6 });
    expect(recharts.PALETTE[0]).toBe("#8884d8");
    expect(recharts.PALETTE[0]).not.toBe(folio.PALETTE[0]);
    expect(recharts.PALETTE[0]).not.toBe(highcharts.PALETTE[0]);
    expect(recharts.PALETTE[0]).not.toBe(shadcn.PALETTE[0]);
    expect(recharts.PALETTE[0]).not.toBe(ant.PALETTE[0]);
    expect(recharts.PALETTE[0]).not.toBe(docs.PALETTE[0]);
    expect(recharts.FONT).toBe(folio.FONT);
  });

  it("B&W: XY grid + bottom legend vs folio ≥3 axes", () => {
    const folioSvg = renderSvg(multiLine("folio"));
    const rcSvg = renderSvg(multiLine("recharts"));
    const folioBar = renderSvg(barChart({ theme: "folio" }));
    const rcBar = renderSvg(barChart({ theme: "recharts" }));
    expect(folioSvg).toContain("data-end-label");
    expect(rcSvg).not.toContain("data-end-label");
    expect(rcSvg).toContain('data-legend="A"');
    expect(rcSvg).toContain('data-legend="B"');
    expect(rcSvg).toContain('data-v-grid="1"');
    expect(folioSvg).not.toContain('data-v-grid="1"');
    expect(rcBar).toContain('data-v-grid="1"');
    expect(rcBar).toContain('data-axis-line="y"');
    expect(rcBar).toContain('stroke-dasharray="3 3"');
    expect(rcBar).not.toContain('data-axis-titles="1"');
    const n = Math.max(
      bwDiffCount(bwAxes(folioSvg), bwAxes(rcSvg)),
      bwDiffCount(bwAxes(folioBar), bwAxes(rcBar)),
    );
    expect(n).toBeGreaterThanOrEqual(3);
    expect(stripPaint(rcSvg)).not.toBe(stripPaint(folioSvg));
  });

  it("matches examples/out/themes/recharts/01-bar-basic.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "recharts" });
    const svg = renderSvg(chart);
    const outDir = join(repoRoot, "examples/out/themes/recharts");
    const outPath = join(outDir, "01-bar-basic.svg");
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
    expect(committed).toContain('data-v-grid="1"');
  });

  it("matches examples/out/themes/recharts/02-line-multi.svg", () => {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/02-line-multi.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "02-line-multi.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const chart = ChartIRSchema.parse({ ...result.chart, theme: "recharts" });
    const svg = renderSvg(chart);
    const outPath = join(
      repoRoot,
      "examples/out/themes/recharts/02-line-multi.svg",
    );
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(join(repoRoot, "examples/out/themes/recharts"), {
        recursive: true,
      });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
    expect(committed).toContain('data-legend="walk-up"');
    expect(committed).not.toContain("data-end-label");
    expect(committed).toContain('data-v-grid="1"');
  });
});

describe("B&W theme skeletons", () => {
  it("every pair of themes differs on at least 4 structural switches", () => {
    const skeleton = Object.fromEntries(
      THEMES.map((theme) => [
        theme,
        {
          line: bwAxes(renderSvg(multiLine(theme))),
          bar: bwAxes(renderSvg(barChart({ theme }))),
        },
      ]),
    );
    for (let i = 0; i < THEMES.length; i++) {
      for (let j = i + 1; j < THEMES.length; j++) {
        const a = skeleton[THEMES[i]!]!;
        const b = skeleton[THEMES[j]!]!;
        const nLine = bwDiffCount(a.line, b.line);
        const nBar = bwDiffCount(a.bar, b.bar);
        expect(
          Math.min(nLine, nBar),
          `${THEMES[i]} vs ${THEMES[j]} (line=${nLine} bar=${nBar})`,
        ).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it("every theme paints its own dark paper", () => {
    const plates = THEMES.map((theme) => themeTokens(theme).SURFACES.dark.PLATE);
    expect(new Set(plates).size).toBe(THEMES.length);
  });

  it("uses dark series colors on dark paper unless the fence sets a palette", () => {
    const dark = renderSvg(
      ChartIRSchema.parse({ ...multiLine("highcharts"), surface: "dark" }),
    );
    expect(dark).not.toContain(highcharts.PALETTE[1]!);
    expect(dark).toContain(highcharts.SURFACES.dark.PALETTE![1]!);
    const picked = renderSvg(
      ChartIRSchema.parse({
        ...multiLine("highcharts"),
        surface: "dark",
        palette: "vivid",
      }),
    );
    expect(picked).not.toContain(highcharts.SURFACES.dark.PALETTE![1]!);
  });

  it("HC / shadcn / ant each differ from folio on ≥3 structural axes", () => {
    const folioLine = renderSvg(multiLine("folio"));
    const folioBar = renderSvg(barChart({ theme: "folio" }));
    for (const theme of ["highcharts", "shadcn", "ant", "recharts"] as const) {
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

  it("recharts differs from each other pack on ≥3 structural axes", () => {
    const rcLine = renderSvg(multiLine("recharts"));
    const rcBar = renderSvg(barChart({ theme: "recharts" }));
    expect(bwAxes(rcBar).barRx).toBe("0");
    expect(bwAxes(rcBar).vGrid).toBe(true);
    for (const theme of [
      "folio",
      "highcharts",
      "shadcn",
      "docs",
      "ant",
    ] as const) {
      const line = renderSvg(multiLine(theme));
      const bar = renderSvg(barChart({ theme }));
      const nLine = bwDiffCount(bwAxes(rcLine), bwAxes(line));
      const nBar = bwDiffCount(bwAxes(rcBar), bwAxes(bar));
      const n = Math.max(nLine, nBar);
      expect(n, `recharts vs ${theme} (line=${nLine} bar=${nBar})`).toBeGreaterThanOrEqual(
        3,
      );
      expect(stripPaint(rcLine), theme).not.toBe(stripPaint(line));
      expect(stripPaint(rcBar), theme).not.toBe(stripPaint(bar));
    }
  });
});


function pieChart(theme: ChartIR["theme"]): ChartIR {
  return ChartIRSchema.parse({
    markvis: 2,
    type: "pie",
    title: "MARTA takes the largest mode share",
    theme,
    x: "name",
    y: "value",
    table: {
      columns: ["name", "value"],
      rows: [
        ["A", "40"],
        ["B", "35"],
        ["C", "30"],
      ],
    },
  });
}

function scatterChart(theme: ChartIR["theme"], multi = false): ChartIR {
  const rows = multi
    ? [
        ["1", "2", "s1"],
        ["2", "3", "s1"],
        ["3", "1", "s2"],
        ["4", "4", "s2"],
      ]
    : [
        ["1", "2"],
        ["2", "3"],
        ["3", "1"],
        ["4", "4"],
      ];
  return ChartIRSchema.parse({
    markvis: 2,
    type: "scatter",
    title: "Scatter",
    theme,
    x: "x",
    y: "y",
    ...(multi ? { series: "series" } : {}),
    table: {
      columns: multi ? ["x", "y", "series"] : ["x", "y"],
      rows,
    },
  });
}

describe("pie + scatter theme forks (THEMES.md)", () => {
  it("folio: leaders, no hole, no legend; scatter solid open sheet", () => {
    expect(folio.PIE_LABEL_MODE).toBe("leaders");
    expect(folio.PIE_INNER_RATIO).toBe(0);
    expect(folio.SCATTER_MARK).toBe("circle");
    const pie = renderSvg(pieChart("folio"));
    expect(pie).toContain('data-pie-label-mode="leaders"');
    expect(pie).toContain('data-pie-inner-ratio="0"');
    expect(pie).toContain("<polyline ");
    expect(pie).not.toContain("data-legend=");
    expect(pie).not.toContain('data-donut="1"');
    expect(pie).not.toContain("data-plot-border=");
    const scatter = renderSvg(scatterChart("folio"));
    expect(scatter).not.toContain('data-scatter-mark="ring"');
    expect(scatter).not.toContain("data-plot-border=");
    expect(scatter).toMatch(/<circle[^>]*\br="3"/);
  });

  it("highcharts: pie legend no leaders + centered title; scatter r≥3.5 + axis ticks", () => {
    expect(highcharts.PIE_LABEL_MODE).toBe("legend");
    expect(highcharts.PIE_INNER_RATIO).toBe(0);
    expect(highcharts.SCATTER_R).toBeGreaterThanOrEqual(3.5);
    expect(Number(highcharts.STRUCTURE_OPACITY)).toBeGreaterThanOrEqual(0.4);
    const pie = renderSvg(pieChart("highcharts"));
    expect(pie).toContain('data-pie-label-mode="legend"');
    expect(pie).toContain("data-legend=");
    expect(pie).not.toContain("<polyline ");
    expect(pie).toContain('text-anchor="middle" font-size="18"');
    expect(pie).not.toContain('data-donut="1"');
    const scatter = renderSvg(scatterChart("highcharts"));
    expect(scatter).toContain("data-axis-ticks=");
    expect(scatter).toContain("data-axis-titles=");
    expect(scatter).toMatch(/<circle[^>]*\br="3\.5"/);
  });

  it("shadcn: donut hole 0.45–0.55 + legend; scatter card + quieter opacity", () => {
    expect(shadcn.PIE_LABEL_MODE).toBe("legend");
    expect(shadcn.PIE_INNER_RATIO).toBeGreaterThanOrEqual(0.45);
    expect(shadcn.PIE_INNER_RATIO).toBeLessThanOrEqual(0.55);
    expect(shadcn.SCATTER_OPACITY).toBeLessThanOrEqual(0.75);
    const pie = renderSvg(pieChart("shadcn"));
    expect(pie).toContain('data-pie-label-mode="legend"');
    expect(pie).toContain('data-pie-inner-ratio="0.5"');
    expect(pie).toContain('data-donut="1"');
    expect(pie).toContain("data-legend=");
    expect(pie).not.toContain("<polyline ");
    const scatter = renderSvg(scatterChart("shadcn"));
    expect(scatter).toContain('data-frame="1"');
    expect(scatter).toContain("data-axis-titles=");
    expect(scatter).toMatch(/fill-opacity="0\.75/);
  });

  it("docs: thin stroke + short leaders; scatter r=2.5 + title rule", () => {
    expect(docs.PIE_STROKE).toBe(1);
    expect(docs.PIE_LEADER).toBeLessThanOrEqual(12);
    expect(docs.PIE_LABEL_MODE).toBe("leaders");
    expect(docs.PIE_INNER_RATIO).toBe(0);
    const pie = renderSvg(pieChart("docs"));
    expect(pie).toContain('data-pie-label-mode="leaders"');
    expect(pie).toContain("<polyline ");
    expect(pie).not.toContain("data-legend=");
    expect(pie).toContain('stroke-width="1"');
    expect(pie).toContain("data-title-rule=");
    const scatter = renderSvg(scatterChart("docs"));
    expect(scatter).toMatch(/<circle[^>]*\br="2\.5"/);
    expect(scatter).toContain("data-title-rule=");
    expect(scatter).not.toContain("data-plot-border=");
  });

  it("ant: donut with leaders; scatter dashed grid + axis ticks", () => {
    expect(ant.PIE_LABEL_MODE).toBe("leaders");
    expect(ant.PIE_INNER_RATIO).toBe(0.6);
    const pie = renderSvg(pieChart("ant"));
    expect(pie).toContain('data-pie-label-mode="leaders"');
    expect(pie).toContain("<polyline ");
    expect(pie).not.toContain("data-legend=");
    expect(pie).toContain('data-donut="1"');
    const scatter = renderSvg(scatterChart("ant"));
    expect(scatter).toContain("data-axis-ticks=");
    expect(scatter).toContain('stroke-dasharray="4 4"');
    expect(scatter).toContain("data-axis-titles=");
  });

  it("recharts: bottom pie legend; scatter rings + XY grid", () => {
    expect(recharts.PIE_LABEL_MODE).toBe("legend");
    expect(recharts.SCATTER_MARK).toBe("ring");
    expect(recharts.LEGEND_BELOW).toBe(true);
    expect(recharts.GRID.axes).toBe("xy");
    const pie = renderSvg(pieChart("recharts"));
    expect(pie).toContain('data-pie-label-mode="legend"');
    expect(pie).toContain("data-legend=");
    expect(pie).not.toContain("<polyline ");
    expect(pie).not.toContain("data-plot-border=");
    const scatter = renderSvg(scatterChart("recharts"));
    expect(scatter).toContain('data-scatter-mark="ring"');
    expect(scatter).toContain("data-v-grid=");
    expect(scatter).toMatch(/stroke-width="1\.5"/);
    const multi = renderSvg(scatterChart("recharts", true));
    expect(multi).toContain("data-legend=");
    expect(multi).toContain('data-scatter-mark="ring"');
  });

  it("B&W: pairwise pie/scatter differ on ≥2 structural axes (not hex alone)", () => {
    const themes = [
      "folio",
      "highcharts",
      "shadcn",
      "docs",
      "ant",
      "recharts",
    ] as const;
    /** THEMES.md acceptance keys + signature tells (stroke, title rule, r, axes). */
    function pieAxes(svg: string) {
      const sliceStroke =
        (svg.match(
          /data-label="[^"]+"[^>]*stroke-width="([0-9.]+)"|stroke-width="([0-9.]+)"[^>]*data-label=/,
        ) ?? [, "", ""])[1] ||
        (svg.match(
          /data-label="[^"]+"[^>]*stroke-width="([0-9.]+)"|stroke-width="([0-9.]+)"[^>]*data-label=/,
        ) ?? [, "", ""])[2] ||
        "";
      return {
        labelMode: (svg.match(/data-pie-label-mode="([^"]+)"/) ?? [, ""])[1]!,
        innerHole:
          /data-donut="1"/.test(svg) ||
          /data-pie-inner-ratio="0\.[1-9]/.test(svg),
        markKind: "n/a" as const,
        legend: /data-legend=/.test(svg),
        leaders: /<polyline /.test(svg),
        vgrid: /data-v-grid=/.test(svg),
        plotFrame: /data-plot-border=/.test(svg),
        titleRule: /data-title-rule=/.test(svg),
        figureFrame: /data-frame=/.test(svg),
        titleCentered: /<text [^>]*text-anchor="middle" font-size="\d+" font-weight/.test(svg),
        sliceStroke,
        viewBox: (svg.match(/viewBox="([^"]+)"/) ?? [, ""])[1]!,
      };
    }
    function scatterAxes(svg: string) {
      return {
        labelMode: "n/a" as const,
        innerHole: false,
        markKind: /data-scatter-mark="ring"/.test(svg) ? "ring" : "circle",
        legend: /data-legend=/.test(svg),
        vgrid: /data-v-grid=/.test(svg),
        plotFrame: /data-plot-border=/.test(svg),
        titleRule: /data-title-rule=/.test(svg),
        markerR: (svg.match(/<circle[^>]*\br="([0-9.]+)"/) ?? [, ""])[1]!,
        axisTitles: /data-axis-titles=/.test(svg),
        quietOpacity: /fill-opacity="0\.75/.test(svg),
        gridDash: (svg.match(/stroke-dasharray="([^"]+)"/) ?? [, ""])[1]!,
        axisTicks: /data-axis-ticks=/.test(svg),
        figureFrame: /data-frame=/.test(svg),
        viewBox: (svg.match(/viewBox="([^"]+)"/) ?? [, ""])[1]!,
      };
    }
    function countDiff(a: Record<string, unknown>, b: Record<string, unknown>): number {
      let n = 0;
      for (const k of Object.keys(a)) {
        if (a[k] !== b[k]) n += 1;
      }
      return n;
    }
    const pies = Object.fromEntries(
      themes.map((t) => [t, pieAxes(renderSvg(pieChart(t)))]),
    );
    const scatters = Object.fromEntries(
      themes.map((t) => [t, scatterAxes(renderSvg(scatterChart(t)))]),
    );
    for (let i = 0; i < themes.length; i++) {
      for (let j = i + 1; j < themes.length; j++) {
        const a = themes[i]!;
        const b = themes[j]!;
        const nPie = countDiff(pies[a]!, pies[b]!);
        const nSc = countDiff(scatters[a]!, scatters[b]!);
        expect(
          Math.max(nPie, nSc),
          `pie/scatter ${a} vs ${b} (pie=${nPie} scatter=${nSc})`,
        ).toBeGreaterThanOrEqual(2);
        expect(stripPaint(renderSvg(pieChart(a))), `pie ${a}/${b}`).not.toBe(
          stripPaint(renderSvg(pieChart(b))),
        );
        expect(
          stripPaint(renderSvg(scatterChart(a))),
          `scatter ${a}/${b}`,
        ).not.toBe(stripPaint(renderSvg(scatterChart(b))));
      }
    }
  });
});


describe("U6 transparent plot fill", () => {
  it("no pack paints an opaque data-plot-bg wallpaper", () => {
    for (const theme of [
      "folio",
      "highcharts",
      "shadcn",
      "docs",
      "ant",
      "recharts",
    ] as const) {
      expect(themeTokens(theme).PLOT_BG, theme).toBeNull();
      const svg = renderSvg(barChart({ theme }));
      expect(svg, theme).not.toContain('data-plot-bg="1"');
    }
    // The card pack outlines the figure; nobody fills the plot.
    expect(renderSvg(barChart({ theme: "shadcn" }))).toContain(
      'data-frame="1"',
    );
    expect(renderSvg(barChart({ theme: "folio" }))).not.toContain(
      'data-frame="1"',
    );
  });

  it("gallery theme SVGs have no opaque plot wallpaper", () => {
    const repoRoot = join(here, "../../..");
    const themesDir = join(repoRoot, "examples/out/themes");
    for (const theme of readdirSync(themesDir)) {
      const dir = join(themesDir, theme);
      for (const name of readdirSync(dir)) {
        if (!name.endsWith(".svg")) continue;
        const svg = readFileSync(join(dir, name), "utf8");
        expect(svg, `${theme}/${name}`).not.toContain('data-plot-bg="1"');
      }
    }
  });
});

describe("U5 palette independence", () => {
  function barChart(theme: ChartIR["theme"], palette?: ChartIR["palette"]): ChartIR {
    const repoRoot = join(here, "../../..");
    const source = readFileSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    if (!result.ok) {
      throw new Error("01-bar-basic must parse");
    }
    return ChartIRSchema.parse({
      ...result.chart,
      theme,
      ...(palette ? { palette } : {}),
    });
  }

  function snapPath(theme: string, palette: string): string {
    return join(
      here,
      "../../../examples/out/palettes",
      `${theme}+${palette}`,
      "01-bar-basic.svg",
    );
  }

  function assertSnap(theme: ChartIR["theme"], palette: ChartIR["palette"]): string {
    const chart = barChart(theme, palette);
    const svg = renderSvg(chart);
    const outPath = snapPath(theme, palette!);
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg).toBe(committed);
    return svg;
  }

  it("matches folio+ink / folio+vivid / highcharts+ink snapshots", () => {
    const folioInk = assertSnap("folio", "ink");
    const folioVivid = assertSnap("folio", "vivid");
    const hcInk = assertSnap("highcharts", "ink");
    expect(folioInk).toContain(ink.SERIES[0]);
    expect(folioVivid).toContain(vivid.SERIES[0]);
    expect(folioInk).not.toContain(vivid.SERIES[0]);
    expect(hcInk).toContain(ink.SERIES[0]);
  });

  it("B&W skeleton same within theme across palettes; fills differ", () => {
    const folioInk = renderSvg(barChart("folio", "ink"));
    const folioVivid = renderSvg(barChart("folio", "vivid"));
    const folioDefault = renderSvg(barChart("folio"));
    expect(stripPaint(folioInk)).toBe(stripPaint(folioVivid));
    expect(stripPaint(folioInk)).toBe(stripPaint(folioDefault));
    expect(folioInk).not.toBe(folioVivid);
    expect(folioInk).toContain(ink.SERIES[0]);
    expect(folioVivid).toContain(vivid.SERIES[0]);
  });

  it("same palette keeps grammar fork across themes", () => {
    const folioInk = renderSvg(barChart("folio", "ink"));
    const hcInk = renderSvg(barChart("highcharts", "ink"));
    expect(stripPaint(folioInk)).not.toBe(stripPaint(hcInk));
    expect(themeTokens("folio", "ink").BAR_RX).toBe(folio.BAR_RX);
    expect(themeTokens("highcharts", "ink").BAR_RX).toBe(highcharts.BAR_RX);
    expect(themeTokens("folio", "ink").PALETTE[0]).toBe(ink.SERIES[0]);
    expect(themeTokens("highcharts", "ink").PALETTE[0]).toBe(ink.SERIES[0]);
  });
});

describe("source discipline", () => {
  it("does not use clocks or random in renderer sources", () => {
    const repoRoot = join(here, "../../..");
    const dirs = [
      join(here, "../src"),
      join(repoRoot, "packages/themes"),
      join(repoRoot, "packages/themes/folio"),
      join(repoRoot, "packages/themes/highcharts"),
      join(repoRoot, "packages/themes/ant"),
      join(repoRoot, "packages/themes/shadcn"),
      join(repoRoot, "packages/themes/docs"),
      join(repoRoot, "packages/themes/recharts"),
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
      expect(source, file).not.toMatch(/from\s+["']recharts["']/);
      expect(source, file).not.toMatch(/require\(\s*["']recharts["']\s*\)/);
    }
  });
});
