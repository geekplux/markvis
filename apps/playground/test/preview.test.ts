import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import {
  copyFence,
  copySvg,
  escapeHtml,
  htmlTable,
  previewSource,
} from "../src/preview.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const validDir = join(repoRoot, "examples/valid");
const invalidDir = join(repoRoot, "examples/invalid");

const validFiles = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .sort();
const invalidFiles = readdirSync(invalidDir)
  .filter((name) => name.endsWith(".md"))
  .sort();

const valid01 = readFileSync(join(validDir, "01-bar-basic.md"), "utf8");
const invalid01 = readFileSync(join(invalidDir, "01-unknown-type.md"), "utf8");
const invalid05 = readFileSync(join(invalidDir, "05-pie-negative.md"), "utf8");

describe("previewSource", () => {
  it("turns a valid fence into SVG plus the data table", () => {
    const view = previewSource(valid01, "01-bar-basic.md");
    expect(view.ok).toBe(true);
    expect(view.error).toBeUndefined();
    expect(view.svg).toContain("<svg");
    expect(view.svg).toContain("</svg>");
    expect(view.table.columns).toEqual(["month", "revenue"]);
    expect(view.table.rows).toEqual([
      ["Jan", "120"],
      ["Feb", "180"],
      ["Mar", "150"],
    ]);
    const parsed = parseMarkdown(valid01, { filename: "01-bar-basic.md" });
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(view.svg).toBe(renderSvg(parsed.chart));
    }
  });

  it("matches render-svg bytes for every valid example", () => {
    expect(validFiles.length).toBeGreaterThanOrEqual(50);
    for (const file of validFiles) {
      const source = readFileSync(join(validDir, file), "utf8");
      const view = previewSource(source, file);
      expect(view.ok, file).toBe(true);
      expect(view.svg, file).toContain("<svg");
      expect(view.table.columns.length, file).toBeGreaterThan(0);
      expect(view.table.rows.length, file).toBeGreaterThan(0);
      expect(view.error, file).toBeUndefined();
      const parsed = parseMarkdown(source, { filename: file });
      expect(parsed.ok, file).toBe(true);
      if (parsed.ok) {
        expect(view.svg, file).toBe(renderSvg(parsed.chart));
      }
    }
  });

  it("shows table plus error on invalid input and never blanks", () => {
    const view = previewSource(invalid01, "01-unknown-type.md");
    expect(view.ok).toBe(false);
    expect(view.svg).toBe("");
    expect(view.error).toContain("E_UNKNOWN_TYPE");
    expect(view.table.columns).toEqual(["name", "value"]);
    expect(view.table.rows).toEqual([
      ["A", "1"],
      ["B", "2"],
    ]);
  });

  it("keeps pie-negative rows in the fallback table", () => {
    const view = previewSource(invalid05, "05-pie-negative.md");
    expect(view.ok).toBe(false);
    expect(view.error).toContain("E_PIE_NEGATIVE");
    expect(view.table.rows).toEqual([
      ["A", "40"],
      ["B", "-5"],
      ["C", "20"],
    ]);
  });

  it("does not throw on empty input; shows an error line", () => {
    const view = previewSource("");
    expect(view.ok).toBe(false);
    expect(view.svg).toBe("");
    expect(view.error).toContain("E_EMPTY_FENCE");
  });

  it("covers every invalid fixture with error plus recovered table", () => {
    expect(invalidFiles.length).toBeGreaterThanOrEqual(15);
    for (const file of invalidFiles) {
      const source = readFileSync(join(invalidDir, file), "utf8");
      const view = previewSource(source, file);
      expect(view.ok, file).toBe(false);
      expect(view.svg, file).toBe("");
      expect(view.error, file).toMatch(/^E_[A-Z_]+/);
      const hasTable =
        view.table.columns.length > 0 || view.table.rows.length > 0;
      const hasError = Boolean(view.error);
      expect(hasTable || hasError, file).toBe(true);
    }
  });
});

describe("copy payloads", () => {
  it("Copy fence returns the current source", () => {
    expect(copyFence(valid01)).toBe(valid01);
  });

  it("Copy SVG returns the rendered SVG on valid input", () => {
    const view = previewSource(valid01, "01-bar-basic.md");
    expect(copySvg(view)).toBe(view.svg);
    expect(copySvg(view)).toContain("<svg");
  });

  it("Copy SVG is empty on invalid input", () => {
    const view = previewSource(invalid01);
    expect(copySvg(view)).toBe("");
  });
});

describe("htmlTable", () => {
  it("escapes cell text", () => {
    const html = htmlTable({
      columns: ["a"],
      rows: [["<b>&"]],
    });
    expect(html).toContain("<td>&lt;b&gt;&amp;</td>");
    expect(html).not.toContain("<td><b>&</td>");
  });

  it("returns empty string when there are no columns", () => {
    expect(htmlTable({ columns: [], rows: [] })).toBe("");
  });

  it("escapeHtml covers quotes", () => {
    expect(escapeHtml(`a&b<"c"`)).toBe("a&amp;b&lt;&quot;c&quot;");
  });
});
