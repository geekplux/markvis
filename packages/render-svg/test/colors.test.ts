import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, THEMES } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import { CSS_VARIABLES, PAINT_NAMES as THEME_PAINT_NAMES } from "@markvis/themes";
import {
  PAINT_NAMES,
  colorAttr,
  hexOf,
  paint,
} from "../../types/_paint/paint.js";
import { attrs } from "../../types/_paint/xml.js";
import { stripVars } from "../../../scripts/svg-normalize.js";
import { scanSvg, shapeUnder } from "./svg-scan.js";

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
  it("writes a Paint as its fixed hex, plus a variable declaration in host mode", () => {
    const p = paint("series-1", "#3B82F6");
    expect(hexOf(p)).toBe("#3B82F6");
    expect(hexOf("none")).toBe("none");
    expect(colorAttr("fill", p, "host")).toEqual({
      attr: 'fill="#3B82F6"',
      style: "fill:var(--markvis-series-1,#3B82F6)",
    });
    expect(colorAttr("stroke", p, "static")).toEqual({
      attr: 'stroke="#3B82F6"',
      style: undefined,
    });
  });

  it("merges every declaration into one style attribute, after a caller's own style", () => {
    const ink = paint("ink", "#171717");
    const grid = paint("grid", "#171717");
    expect(attrs({ x: 1, fill: ink, stroke: grid, "data-k": "v" })).toBe(
      'x="1" fill="#171717" stroke="#171717" data-k="v" style="fill:var(--markvis-ink,#171717);stroke:var(--markvis-grid,#171717)"',
    );
    expect(attrs({ fill: ink, style: "opacity:0.5", x: 2 })).toBe(
      'fill="#171717" style="opacity:0.5;fill:var(--markvis-ink,#171717)" x="2"',
    );
    expect(attrs({ fill: "none", x: 1 })).toBe('fill="none" x="1"');
  });
});

/** Color attributes in host output that stay fixed on purpose (see apps/web/theming.md). Line end labels are not among them. */
const FIXED_ON_PURPOSE = {
  /** The export surface's plot border, and calendar cells and their key, mixed from a fixed ramp. */
  element: /\sdata-(?:plot-border|date|key-step)=/,
  /** Labels on a mark pick black or white for the fixed fill under them: fixed only when a mark is under them. */
  onMark: /\sdata-(?:value-label|cell-label|label-text)=/,
  /** Heatmap cells and ramp, and the missing-cell hatch (not the labels drawn on them). */
  ancestor: /^<(?:pattern\b|g [^>]*data-(?:heatmap|color-scale)=)/,
};

type ColorUse = { key: string; value: string; style: string; fixed: boolean; tag: string };

/** Every hex color attribute in an SVG, with its element's style and whether it is fixed on purpose. */
function colorUses(svg: string): ColorUse[] {
  const scan = scanSvg(svg);
  const onMark = scan.labels.filter((label) => shapeUnder(scan, label)).map((label) => label.line);
  const uses: ColorUse[] = [];
  const open: boolean[] = [];
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z]+)\b([^>]*?)(\/?)>/g)) {
    const [whole, closing, tag, body, selfClosing] = m as unknown as [string, string, string, string, string];
    if (closing) {
      open.pop();
      continue;
    }
    const inFixed = open.some(Boolean);
    const style = /\sstyle="([^"]*)"/.exec(body)?.[1] ?? "";
    const fixed =
      (inFixed && tag !== "text") ||
      FIXED_ON_PURPOSE.element.test(body) ||
      (tag === "text" && FIXED_ON_PURPOSE.onMark.test(body) && onMark.some((line) => line.includes(whole)));
    for (const a of body.matchAll(/(?<![\w-])(fill|stroke|stop-color)="(#[0-9a-fA-F]{6})"/g)) {
      uses.push({ key: a[1]!, value: a[2]!, style, fixed, tag });
    }
    if (!selfClosing) {
      open.push(inFixed || FIXED_ON_PURPOSE.ancestor.test(whole));
    }
  }
  return uses;
}

describe("host colors", () => {
  it.each(validFiles)(
    "%s: every theme color has a variable whose fallback is the attribute",
    (file) => {
      const base = chartOf(file);
      const bad: string[] = [];
      let named = 0;
      for (const theme of THEMES) {
        for (const surface of SURFACES) {
          const chart = ChartIRSchema.parse({ ...base, theme });
          const svg = renderSvg(chart, { surface, colors: "host" });
          for (const use of colorUses(svg)) {
            const decl = `${use.key}:var(--markvis-`;
            const declared = use.style
              .split(";")
              .find((d) => d.startsWith(decl));
            if (declared === undefined) {
              if (!use.fixed) bad.push(`${theme}/${surface} <${use.tag} ${use.key}="${use.value}">`);
              continue;
            }
            named++;
            if (!declared.endsWith(`,${use.value})`)) {
              bad.push(`${theme}/${surface} <${use.tag}> ${declared} vs ${use.value}`);
            }
          }
        }
      }
      expect(named).toBeGreaterThan(0);
      expect(bad.slice(0, 10)).toEqual([]);
    },
  );

  it("uses only the published variable names", () => {
    const used = new Set<string>();
    for (const file of validFiles) {
      const base = chartOf(file);
      for (const theme of THEMES) {
        for (const surface of SURFACES) {
          const chart = ChartIRSchema.parse({ ...base, theme });
          const svg = renderSvg(chart, { surface, colors: "host" });
          for (const m of svg.matchAll(/var\((--[a-z0-9-]+)/g)) used.add(m[1]!);
        }
      }
    }
    const published = new Set<string>(CSS_VARIABLES);
    expect([...used].filter((name) => !published.has(name))).toEqual([]);
    // Not vacuous: the names that carry structure all appear.
    for (const name of ["--markvis-font", "--markvis-grid", "--markvis-paper", "--markvis-ink"]) {
      expect(used.has(name), name).toBe(true);
    }
  });

  it("lists the eighteen paint names, then font, as CSS variables", () => {
    expect(CSS_VARIABLES).toEqual([
      ...PAINT_NAMES.map((name) => `--markvis-${name}`),
      "--markvis-font",
    ]);
  });

  it.each(validFiles)("%s: static colors are host colors without the variables", (file) => {
    const base = chartOf(file);
    for (const theme of THEMES) {
      for (const surface of SURFACES) {
        const chart = ChartIRSchema.parse({ ...base, theme });
        const host = renderSvg(chart, { surface, colors: "host" });
        const fixed = renderSvg(chart, { surface, colors: "static" });
        expect(fixed, `${theme}/${surface}`).not.toContain("var(");
        expect(fixed, `${theme}/${surface}`).not.toContain("style=");
        expect(stripVars(host), `${theme}/${surface}`).toBe(fixed);
      }
    }
  });

  it("defaults to host, and to static for the export surface", () => {
    const chart = ChartIRSchema.parse(chartOf(validFiles[0]!));
    expect(renderSvg(chart)).toBe(renderSvg(chart, { colors: "host" }));
    expect(renderSvg(chart)).toContain("var(--markvis-ink,");
    expect(renderSvg(chart, { surface: "export" })).toBe(
      renderSvg(chart, { surface: "export", colors: "static" }),
    );
    expect(renderSvg(chart, { surface: "export", colors: "host" })).toContain("var(");
    const exported = ChartIRSchema.parse({ ...chart, surface: "export" });
    expect(renderSvg(exported)).not.toContain("var(");
  });

  it("sets the root font through --markvis-font in host mode only", () => {
    const chart = ChartIRSchema.parse(chartOf(validFiles[0]!));
    const root = (svg: string) => svg.slice(0, svg.indexOf(">") + 1);
    expect(root(renderSvg(chart, { colors: "host" }))).toMatch(
      / style="font-family:var\(--markvis-font,ui-sans-serif, system-ui, -apple-system, &quot;Segoe UI&quot;, sans-serif\)">$/,
    );
    expect(root(renderSvg(chart, { colors: "static" }))).not.toContain("style=");
  });

  it("names grid lines grid, with the ink as their fallback", () => {
    const chart = ChartIRSchema.parse(chartOf("02-line-multi.md"));
    const svg = renderSvg(ChartIRSchema.parse({ ...chart, theme: "ant" }), { colors: "host" });
    const grid = svg.split("\n").filter((line) => line.includes('data-grid="1"'));
    expect(grid.length).toBeGreaterThan(0);
    for (const line of grid) {
      expect(line).toContain('stroke="#262626"');
      expect(line).toContain("stroke:var(--markvis-grid,#262626)");
    }
  });
});

describe("stripVars", () => {
  it("leaves output without variables unchanged", () => {
    const chart = ChartIRSchema.parse(chartOf(validFiles[0]!));
    const svg = renderSvg(chart, { colors: "static" });
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
