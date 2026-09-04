import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { PALETTE, renderSvg } from "../src/index.js";
import { compactScale, formatTick } from "../src/scale.js";
import { FONT, PAPER } from "../src/tokens.js";

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

describe("visual-spec tokens", () => {
  it("keeps paper as the first painted child and the frozen font stack", () => {
    const svg = svgOf("01-bar-basic.md");
    const rest = afterTitleDesc(svg);
    expect(rest.startsWith(`  <rect width="100%" height="100%" fill="${PAPER}"/>`)).toBe(
      true,
    );
    expect(svg).toContain(`font-family="${FONT.replace(/"/g, "&quot;")}"`);
    expect(svg).toContain('role="img"');
    expect(svg).toMatch(/<title id="mv-[a-f0-9]+-title">/);
    expect(svg).toMatch(/<desc id="mv-[a-f0-9]+-desc">/);
    expect(svg).not.toContain("theme");
  });

  it("01 bar: accent only, unit on the title line, value labels, no legend", () => {
    const svg = svgOf("01-bar-basic.md");
    expect(svg).toContain(PALETTE[0]);
    expect(svg).not.toContain(PALETTE[1]);
    expect(svg).toContain(" · USD k");
    expect(svg).toContain('font-size="18"');
    expect(svg).not.toContain('data-legend=');
    expect(svg).not.toContain('shape-rendering="crispEdges"');
    expect(svg).toContain('data-value-label="Jan"');
    expect(svg).toContain('data-value-label="Feb"');
    expect(svg).toContain('data-value-label="Mar"');
    expect(svg).not.toContain("revenue (USD k)");
  });

  it("02 line: S1/S2, 1.75px stroke, points, legend under title", () => {
    const svg = svgOf("02-line-multi.md");
    expect(svg).toContain(PALETTE[0]);
    expect(svg).toContain(PALETTE[1]);
    expect(svg).toContain('stroke-width="1.75"');
    expect(svg).toContain('r="2.5"');
    expect(svg).toContain('data-legend="free"');
    expect(svg).toContain('data-legend="pro"');
  });

  it("05 pie: paper slice stroke, outside name · value, no side legend", () => {
    const svg = svgOf("05-pie-raw.md");
    expect(svg).toContain(`stroke="${PAPER}"`);
    expect(svg).toContain("A · 40");
    expect(svg).toContain("B · 35");
    expect(svg).toContain("C · 30");
    expect(svg).toContain('data-raw-value="40"');
    expect(svg).not.toContain('data-legend=');
    expect(svg).toContain("<polyline ");
    expect(svg).toContain("not normalized to 100");
  });

  it("09 twelve categories stay horizontal when they fit", () => {
    const svg = svgOf("09-bar-twelve-categories.md");
    expect(svg).not.toContain("rotate(-55");
    expect(svg).not.toContain("…");
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

  it("17 long labels rotate −55° without ellipsis; ticks compact; values full", () => {
    const svg = svgOf("17-bar-long-labels.md");
    expect(svg).toContain("rotate(-55");
    expect(svg).not.toContain("…");
    expect(svg).toContain("North America enterprise expansion Q3");
    expect(svg).toContain("APAC partner enablement and training program");
    expect(svg).toContain("Legacy platform decommission wave 2");
    expect(svg).toContain("420,000");
    expect(svg).not.toContain(">200k<");
    expect(svg).not.toContain(">400k<");
    expect(svg).toContain(" · USD k");
  });
});

describe("compact ticks", () => {
  it("uses k when span ≥ 10,000 and ticks are round thousands", () => {
    const ticks = [0, 200000, 400000, 600000];
    const compact = compactScale(ticks, 600000);
    expect(compact).toEqual({ divisor: 1000, suffix: "k" });
    expect(ticks.map((n) => formatTick(n, compact))).toEqual([
      "0",
      "200",
      "400",
      "600",
    ]);
  });
});
