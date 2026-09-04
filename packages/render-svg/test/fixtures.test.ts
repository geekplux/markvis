import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ChartIRSchema } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const validDir = join(repoRoot, "examples/valid");
const outDir = join(repoRoot, "examples/out");

const validFiles = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .sort();

function svgName(mdFile: string): string {
  return mdFile.replace(/\.md$/, ".svg");
}

describe("valid fixture SVGs", () => {
  it("covers 52 valid fixtures", () => {
    expect(validFiles).toHaveLength(52);
  });

  it.each(validFiles)("%s", (file) => {
    const source = readFileSync(join(validDir, file), "utf8");
    const result = parseMarkdown(source, { filename: file });
    expect(result.ok, `${file} should parse`).toBe(true);
    if (!result.ok) {
      return;
    }
    const chart = ChartIRSchema.parse(result.chart);
    const svg = renderSvg(chart);
    const again = renderSvg(chart);
    expect(again).toBe(svg);
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg.endsWith("</svg>\n")).toBe(true);
    expect(svg).toContain(`data-chart-type="${chart.type}"`);
    expect(svg).toContain("<title ");
    expect(svg).toContain("<desc ");
    expect(svg).toContain("aria-label=");
    expect(svg).toContain('role="img"');

    const outPath = join(outDir, svgName(file));
    if (process.env["UPDATE_SNAPSHOTS"] === "1") {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(outPath, svg, "utf8");
    }
    const committed = readFileSync(outPath, "utf8");
    expect(svg, `${file} SVG bytes drifted from examples/out`).toBe(
      committed,
    );
  });
});
