import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { PALETTE, renderSvg } from "../src/index.js";
import { compactScale, formatTick } from "../src/scale.js";
import { showBarValueLabels } from "../src/layout.js";
import {
  FONT,
  HAIRLINE_OPACITY,
  INK,
  PLOT_MIN_RATIO,
  STRUCTURE_OPACITY,
  TYPE,
} from "../src/tokens.js";
import { barSlot } from "../src/cartesian.js";

const here = dirname(fileURLToPath(import.meta.url));
const validDir = join(here, "../../../examples/valid");

function svgOf(file: string): string {
  const source = readFileSync(join(validDir, file), "utf8");
  const result = parseMarkdown(source, { filename: file });
  if (!result.ok) {
    throw new Error(`${file} should parse`);
  }
  return renderSvg(ChartIRSchema.parse(result.chart));
}

function afterTitleDesc(svg: string): string {
  return svg.replace(/^[\s\S]*?<\/desc>\n/, "");
}

function frameHeight(svg: string): number {
  const m = svg.match(/\bheight="(\d+(?:\.\d+)?)"/);
  return m ? Number(m[1]) : NaN;
}

function plotBox(svg: string): {
  left: number;
  top: number;
  bottom: number;
  right: number;
  height: number;
  share: number;
} {
  const m = svg.match(/<path d="M([\d.]+) ([\d.]+) L([\d.]+) \2"/);
  if (!m) {
    throw new Error("baseline path not found");
  }
  const left = Number(m[1]);
  const bottom = Number(m[2]);
  const right = Number(m[3]);
  const yPos = [
    ...svg.matchAll(
      /<text x="[\d.]+" y="([\d.]+)" text-anchor="end" dominant-baseline="middle">/g,
    ),
  ].map((x) => Number(x[1]));
  if (yPos.length === 0) {
    throw new Error("y ticks not found");
  }
  const top = Math.min(...yPos);
  const height = frameHeight(svg);
  return {
    left,
    top,
    bottom,
    right,
    height,
    share: (bottom - top) / height,
  };
}

function firstBarWidth(svg: string): number {
  const m = svg.match(/<path d="([^"]+)" fill="#[0-9A-Fa-f]+" data-x=/);
  if (!m) {
    throw new Error("bar path not found");
  }
  const nums = [...m[1].matchAll(/[-+]?\d*\.?\d+/g)].map((x) => Number(x[0]));
  const xs = nums.filter((_, i) => i % 2 === 0);
  return Math.max(...xs) - Math.min(...xs);
}

function titleEl(svg: string): { x: number; anchor: string; size: string } {
  const m = svg.match(
    /<text x="([\d.]+)" y="[\d.]+" text-anchor="([^"]+)" font-size="(\d+)" font-weight="600"/,
  );
  if (!m) {
    throw new Error("visible title not found");
  }
  return { x: Number(m[1]), anchor: m[2]!, size: m[3]! };
}

describe("visual-spec tokens", () => {
  it("keeps a transparent canvas and the frozen font stack", () => {
    const svg = svgOf("01-bar-basic.md");
    const rest = afterTitleDesc(svg);
    expect(rest).not.toMatch(/<rect width="100%" height="100%"/);
    expect(rest.trimStart().startsWith("<text ")).toBe(true);
    expect(svg).toContain(`font-family="${FONT.replace(/"/g, "&quot;")}"`);
    expect(svg).toContain('role="img"');
    expect(svg).toMatch(/<title id="mv-[a-f0-9]+-title">/);
    expect(svg).toMatch(/<desc id="mv-[a-f0-9]+-desc">/);
    expect(svg).not.toContain("theme");
    expect(TYPE.title).toEqual({ size: 17, weight: 600, fill: INK });
    expect(svg).toContain(`stroke="${INK}"`);
    expect(svg).toContain(`stroke-opacity="${STRUCTURE_OPACITY}"`);
  });

  it("01 bar: conclusion title, 17/600 left, 72px cap, labels XOR grid", () => {
    const svg = svgOf("01-bar-basic.md");
    const plot = plotBox(svg);
    const title = titleEl(svg);
    expect(svg).toContain("Feb led Q3 at 180");
    expect(svg).not.toMatch(/>bar</i);
    expect(title.size).toBe("17");
    expect(title.anchor).toBe("start");
    expect(title.x).toBeCloseTo(plot.left, 2);
    expect(svg).toContain(PALETTE[0]);
    expect(svg).not.toContain(PALETTE[1]);
    expect(svg).toContain(" · USD k");
    expect(svg).not.toContain('data-legend=');
    expect(svg).not.toContain('shape-rendering="crispEdges"');
    expect(svg).not.toContain("rotate(-90");
    expect(svg).toContain('data-value-label="Jan"');
    expect(svg).toContain('data-value-label="Feb"');
    expect(svg).toContain('data-value-label="Mar"');
    expect(svg).not.toContain('stroke="#E7E5E4"');
    expect(firstBarWidth(svg)).toBeLessThanOrEqual(72.01);
    expect(plot.share).toBeGreaterThanOrEqual(PLOT_MIN_RATIO);
    expect(svg).not.toContain("revenue (USD k)");
  });

  it("02 line: S1/S2, 1.75px stroke, points, end-labels not a color legend", () => {
    const svg = svgOf("02-line-multi.md");
    const plot = plotBox(svg);
    const title = titleEl(svg);
    expect(svg).toContain("Free still leads pro");
    expect(title.anchor).toBe("start");
    expect(title.x).toBeCloseTo(plot.left, 2);
    expect(svg).toContain(PALETTE[0]);
    expect(svg).toContain(PALETTE[1]);
    expect(svg).toContain('stroke-width="1.75"');
    expect(svg).toContain('r="2.5"');
    expect(svg).toContain('data-end-label="free"');
    expect(svg).toContain('data-end-label="pro"');
    expect(svg).not.toContain('data-legend=');
    expect(plot.share).toBeGreaterThanOrEqual(PLOT_MIN_RATIO);
  });

  it("05 pie: structure slice stroke, outside name · value, conclusion title, no side legend", () => {
    const svg = svgOf("05-pie-raw.md");
    const title = titleEl(svg);
    expect(svg).toContain("A leads at 40");
    expect(svg).not.toContain(">Share<");
    expect(title.anchor).toBe("start");
    expect(title.size).toBe("17");
    expect(svg).toContain(`stroke="${INK}"`);
    expect(svg).toContain(`stroke-opacity="${STRUCTURE_OPACITY}"`);
    expect(svg).toContain("A · 40");
    expect(svg).toContain("B · 35");
    expect(svg).toContain("C · 30");
    expect(svg).toContain('data-raw-value="40"');
    expect(svg).not.toContain('data-legend=');
    expect(svg).toContain("<polyline ");
    expect(svg).toContain("not normalized to 100");
  });

  it("09 twelve categories stay horizontal; value labels off; grid on", () => {
    const svg = svgOf("09-bar-twelve-categories.md");
    const plot = plotBox(svg);
    expect(svg).toContain("Jul peaked at 22");
    expect(svg).not.toContain("rotate(-55");
    expect(svg).not.toContain("…");
    expect(svg).not.toContain("data-value-label=");
    expect(svg).toContain(`stroke="${INK}"`);
    expect(svg).toContain(`stroke-opacity="${HAIRLINE_OPACITY}"`);
    expect(plot.share).toBeGreaterThanOrEqual(PLOT_MIN_RATIO);
    for (const month of [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]) {
      expect(svg).toContain(`data-full-label="${month}"`);
      expect(svg).toContain(`>${month}</text>`);
    }
  });

  it("17 long labels rotate −55° without ellipsis; plot ≥55%; bar ≤72", () => {
    const svg = svgOf("17-bar-long-labels.md");
    const plot = plotBox(svg);
    const title = titleEl(svg);
    expect(svg).toContain("North America leads spend at 420,000");
    expect(title.anchor).toBe("start");
    expect(title.x).toBeCloseTo(plot.left, 2);
    expect(svg).toContain("rotate(-55");
    expect(svg).not.toContain("…");
    expect(svg).toContain("North America enterprise expansion Q3");
    expect(svg).toContain("APAC partner enablement and training program");
    expect(svg).toContain("Legacy platform decommission wave 2");
    expect(svg).toContain("420,000");
    expect(svg).toContain("200,000");
    expect(svg).toContain("400,000");
    expect(svg).toContain(" · USD</tspan>");
    expect(svg).not.toContain(" · USD k");
    expect(svg).not.toContain(">200k<");
    expect(svg).not.toContain(">400k<");
    expect(firstBarWidth(svg)).toBeLessThanOrEqual(72.01);
    expect(plot.height).toBeGreaterThan(480);
    expect(plot.height).toBeLessThanOrEqual(640);
    expect(plot.share).toBeGreaterThanOrEqual(PLOT_MIN_RATIO);
  });
});

describe("Ledger geometry helpers", () => {
  it("caps bar width at 72 when n ≤ 4 and centers in the band", () => {
    const slot = barSlot(3, 1, 200, 0, 0, 0);
    expect(slot.barW).toBe(72);
    expect(slot.x).toBe((200 - 72) / 2);
  });

  it("turns value labels off when n > 8", () => {
    expect(showBarValueLabels(3, 72)).toBe(true);
    expect(showBarValueLabels(12, 40)).toBe(false);
    expect(showBarValueLabels(7, 20)).toBe(true);
    expect(showBarValueLabels(7, 16)).toBe(false);
  });
});

describe("compact ticks", () => {
  it("prefers full numbers over auto-k so title/ticks/values share one scale", () => {
    const ticks = [0, 200000, 400000, 600000];
    const compact = compactScale(ticks, 600000);
    expect(compact).toBeNull();
    expect(ticks.map((n) => formatTick(n, compact))).toEqual([
      "0",
      "200,000",
      "400,000",
      "600,000",
    ]);
    expect(formatTick(420000, null)).toBe("420,000");
  });
});
