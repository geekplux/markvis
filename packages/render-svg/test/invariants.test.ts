/**
 * Properties every rendered figure must keep, in every theme and surface.
 * These read the SVG the way a person sees it, so a bug cannot hide inside a
 * golden that was re-baked along with it.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema, THEMES, type ChartIR } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg, themeTokens } from "@markvis/render-svg";
import { composite, contrast, labelBox, scanSvg, shapeUnder } from "./svg-scan.js";

const here = dirname(fileURLToPath(import.meta.url));
const validDir = join(here, "../../../examples/valid");
const SURFACES = ["light", "dark", "export"] as const;

const charts: [string, ChartIR][] = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .sort()
  .map((file) => {
    const result = parseMarkdown(readFileSync(join(validDir, file), "utf8"), {
      filename: file,
    });
    if (!result.ok) throw new Error(`${file}: ${result.error.message}`);
    return [file, ChartIRSchema.parse(result.chart)];
  });

function renders(): { where: string; svg: string; surface: string }[] {
  const out: { where: string; svg: string; surface: string }[] = [];
  for (const [file, chart] of charts) {
    for (const theme of THEMES) {
      for (const surface of SURFACES) {
        out.push({
          where: `${theme}/${surface}/${file}`,
          svg: renderSvg(ChartIRSchema.parse({ ...chart, theme, surface })),
          surface,
        });
      }
    }
  }
  return out;
}

const all = renders();

/** WCAG's floor for large or bold text; chart labels must at least clear it. */
const MIN_CONTRAST = 3;

describe("rendered figure invariants", () => {
  it("draws text on a filled mark with readable contrast", () => {
    const failures: string[] = [];
    for (const { where, svg, surface } of all) {
      const scan = scanSvg(svg);
      // Light paints no paper: assume a light host page, the case light is for.
      const paper = scan.plate ?? (surface === "light" ? "#ffffff" : "#000000");
      for (const label of scan.labels) {
        const shape = shapeUnder(scan, label);
        if (!shape) continue;
        const under = composite(shape.fill, shape.opacity, paper);
        const ratio = contrast(label.fill, under);
        if (ratio < MIN_CONTRAST) {
          failures.push(`${where}: "${label.text}" ${label.fill} on ${under} = ${ratio.toFixed(2)}`);
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} low-contrast labels`).toEqual([]);
  });

  it("never rounds a rect past half its width or height", () => {
    const failures: string[] = [];
    for (const { where, svg } of all) {
      for (const rect of scanSvg(svg).rects) {
        if (rect.w > 0 && rect.h > 0 && rect.rx > Math.min(rect.w, rect.h) / 2 + 0.01) {
          failures.push(`${where}: rx=${rect.rx} on ${rect.w}×${rect.h}`);
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} over-rounded rects`).toEqual([]);
  });

  it("keeps every label inside the frame", () => {
    const failures: string[] = [];
    for (const { where, svg } of all) {
      const scan = scanSvg(svg);
      for (const label of scan.labels) {
        const box = labelBox(label);
        if (box.left < -1 || box.right > scan.width + 1) {
          failures.push(`${where}: "${label.text}" spans ${box.left.toFixed(1)}..${box.right.toFixed(1)} of ${scan.width}`);
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} clipped labels`).toEqual([]);
  });

  it("never lets two labels overlap", () => {
    const failures: string[] = [];
    for (const { where, svg } of all) {
      const boxes = scanSvg(svg).labels.map((label) => ({ label, box: labelBox(label) }));
      for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i]!.box;
          const b = boxes[j]!.box;
          const dx = Math.min(a.right, b.right) - Math.max(a.left, b.left);
          const dy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
          if (dx > 1 && dy > 1) {
            failures.push(`${where}: "${boxes[i]!.label.text}" × "${boxes[j]!.label.text}"`);
          }
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} overlapping label pairs`).toEqual([]);
  });

  it("draws every grid in the theme's grid style", () => {
    const failures: string[] = [];
    for (const [file, chart] of charts) {
      for (const theme of THEMES) {
        const grid = themeTokens(theme).GRID;
        const svg = renderSvg(ChartIRSchema.parse({ ...chart, theme }));
        // Grid groups: stroke-only hairline groups, plus the radar web.
        const groups = svg
          .split("\n")
          .filter(
            (line) =>
              /^\s*<g fill="none" stroke="#[0-9a-fA-F]+" stroke-opacity="[\d.]+" stroke-width="[\d.]+"/.test(line) &&
              !/data-waterfall-connectors|data-axis|data-leaders/.test(line),
          );
        for (const line of groups) {
          const dash = line.match(/stroke-dasharray="([^"]*)"/)?.[1] ?? "";
          const width = Number(line.match(/stroke-width="([\d.]+)"/)?.[1]);
          if (dash !== grid.dash || width !== grid.width) {
            failures.push(`${theme}/${file}: dash "${dash}" width ${width}, want "${grid.dash}" ${grid.width}`);
          }
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} off-style grids`).toEqual([]);
  });

  it("never splits a word across lines", () => {
    const failures: string[] = [];
    for (const { where, svg } of all) {
      for (const m of svg.matchAll(/<text\b[^>]*data-full-label="([^"]*)"[^>]*>([\s\S]*?)<\/text>/g)) {
        const full = m[1]!.replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"');
        // Text without spaces (CJK) may only wrap between characters.
        if ([...full].some((char) => (char.codePointAt(0) ?? 0) > 0x2e80)) continue;
        const body = m[2]!.replace(/<title>[\s\S]*?<\/title>/g, "");
        const lines = /<tspan/.test(body)
          ? [...body.matchAll(/<tspan[^>]*>([^<]*)<\/tspan>/g)].map((t) => t[1]!)
          : [body.replace(/<[^>]+>/g, "")];
        const words = new Set(full.split(/\s+/));
        for (const word of lines.join(" ").split(/\s+/).filter(Boolean)) {
          const decoded = word.replace(/&amp;/g, "&").replace(/&apos;/g, "'").replace(/&quot;/g, '"');
          if (!words.has(decoded) && !decoded.endsWith("…")) {
            failures.push(`${where}: "${decoded}" is not a whole word of "${full}"`);
          }
        }
      }
    }
    expect(failures.slice(0, 20), `${failures.length} split words`).toEqual([]);
  });
});
