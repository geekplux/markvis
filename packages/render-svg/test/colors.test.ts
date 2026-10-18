import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, THEMES } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import { PAINT_NAMES as THEME_PAINT_NAMES } from "@markvis/themes";
import {
  PAINT_NAMES,
  colorAttr,
  hexOf,
  paint,
} from "../../types/_paint/paint.js";
import { attrs } from "../../types/_paint/xml.js";
import { stripVars } from "../../../scripts/svg-normalize.js";

const here = dirname(fileURLToPath(import.meta.url));
const validDir = join(here, "../../../examples/valid");
const validFiles = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .sort();
const SURFACES = ["light", "dark", "export"] as const;

/** Every value a color attribute may hold. Theme packs spell hex in either case. */
const COLOR_VALUE = /^(none|currentColor|url\(#[^)]+\)|#[0-9a-fA-F]{6})$/;
const COLOR_ATTR = /(?<![\w-])(fill|stroke|stop-color)="([^"]*)"/g;

function chartOf(file: string) {
  const source = readFileSync(join(validDir, file), "utf8");
  const result = parseMarkdown(source, { filename: file });
  if (!result.ok) {
    throw new Error(`${file} should parse`);
  }
  return result.chart;
}

describe("color attribute grammar", () => {
  it.each(validFiles)("%s: every color attribute is a fixed value", (file) => {
    const base = chartOf(file);
    const bad: string[] = [];
    let seen = 0;
    for (const theme of THEMES) {
      const chart = ChartIRSchema.parse({ ...base, theme });
      for (const surface of SURFACES) {
        const svg = renderSvg(chart, { surface });
        for (const match of svg.matchAll(COLOR_ATTR)) {
          seen++;
          if (!COLOR_VALUE.test(match[2]!)) {
            bad.push(`${theme}/${surface}: ${match[0]}`);
          }
        }
      }
    }
    expect(seen).toBeGreaterThan(0);
    expect(bad).toEqual([]);
  });
});

describe("paint names", () => {
  it("are the eighteen frozen names, in order", () => {
    expect(PAINT_NAMES).toHaveLength(18);
    expect([...PAINT_NAMES]).toEqual([
      "ink",
      "muted",
      "grid",
      "paper",
      "plate",
      "plot",
      "series-1",
      "series-2",
      "series-3",
      "series-4",
      "series-5",
      "series-6",
      "series-7",
      "series-8",
      "accent",
      "up",
      "down",
      "total",
    ]);
    expect(new Set(PAINT_NAMES).size).toBe(18);
  });

  it("are exported from @markvis/themes", () => {
    expect(THEME_PAINT_NAMES).toBe(PAINT_NAMES);
  });
});

describe("paint helper", () => {
  it("writes a Paint as its fixed hex in both modes", () => {
    const p = paint("series-1", "#3B82F6");
    expect(hexOf(p)).toBe("#3B82F6");
    expect(hexOf("none")).toBe("none");
    expect(colorAttr("fill", p, "host")).toBe(' fill="#3B82F6"');
    expect(colorAttr("stroke", p, "static")).toBe(' stroke="#3B82F6"');
    expect(attrs({ x: 1, fill: p, stroke: "none" })).toBe(
      'x="1" fill="#3B82F6" stroke="none"',
    );
  });

  it("renders the same bytes for colors host and static today", () => {
    for (const file of validFiles.slice(0, 12)) {
      const chart = ChartIRSchema.parse(chartOf(file));
      const plain = renderSvg(chart);
      expect(renderSvg(chart, { colors: "host" })).toBe(plain);
      expect(renderSvg(chart, { colors: "static" })).toBe(plain);
    }
  });
});

describe("stripVars", () => {
  it("leaves output without variables unchanged", () => {
    const chart = ChartIRSchema.parse(chartOf(validFiles[0]!));
    const svg = renderSvg(chart);
    expect(stripVars(svg)).toBe(svg);
  });

  it("reduces variable colors to their fallbacks", () => {
    expect(
      stripVars(
        '<rect fill="#3B82F6" style="fill:var(--markvis-series-1,#3B82F6)"/>',
      ),
    ).toBe('<rect fill="#3B82F6"/>');
    expect(
      stripVars(
        '<text fill="#171717" style="fill:var(--markvis-ink,#171717);opacity:0.5"/>',
      ),
    ).toBe('<text fill="#171717" style="opacity:0.5"/>');
    expect(stripVars('<svg style="font-family:var(--markvis-font, serif)">')).toBe(
      "<svg>",
    );
  });

  it("keeps an escaped quote inside a fallback", () => {
    expect(
      stripVars(
        '<svg font-family="x" style="font-family:var(--markvis-font,ui-sans-serif, system-ui, &quot;Segoe UI&quot;, sans-serif)">',
      ),
    ).toBe('<svg font-family="x">');
  });

  it("leaves no trailing semicolon after a later variable declaration", () => {
    expect(
      stripVars(
        '<rect fill="#aaaaaa" style="opacity:0.5;fill:var(--markvis-ink,#aaaaaa)"/>',
      ),
    ).toBe('<rect fill="#aaaaaa" style="opacity:0.5"/>');
  });
});
