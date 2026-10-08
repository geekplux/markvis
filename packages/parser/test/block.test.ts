/**
 * parseBlock takes the inside of a chart block — what a Markdown renderer
 * hands a code-block plugin. It must read every example exactly like the
 * fenced block it came from.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  extractCharts,
  parseBlock,
  parseDocument,
  parseMarkdown,
  type ParseOptions,
  type ParseResult,
} from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");

function examples(dir: string): Array<[string, string]> {
  const full = join(repoRoot, "examples", dir);
  return readdirSync(full)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => [`${dir}/${name}`, readFileSync(join(full, name), "utf8")]);
}

/** Everything a caller reads, minus the echo of the source text. */
function outcome(result: ParseResult): unknown {
  if (result.ok) {
    return { ok: true, chart: result.chart };
  }
  return { ok: false, error: result.error, table: result.table };
}

const files = [...examples("valid"), ...examples("invalid")];

describe("parseBlock matches the fenced block", () => {
  for (const [file, source] of files) {
    const charts = extractCharts(source);
    if (charts.length === 0) {
      continue;
    }
    it(file, () => {
      const located = parseDocument(source);
      charts.forEach((chart, i) => {
        const expected = outcome(located[i]!.result);
        if (chart.form === "fence") {
          expect(outcome(parseBlock(chart.body))).toEqual(expected);
          // react-markdown and markdown-it may drop the final newline.
          expect(outcome(parseBlock(chart.body.replace(/\n$/, "")))).toEqual(expected);
        }
        // The whole block, fence lines or comment included, reads the same.
        expect(outcome(parseBlock(chart.raw))).toEqual(expected);
      });
    });
  }
});

describe("parseBlock input edges", () => {
  const body = "type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5";

  it("reads a bare body", () => {
    const result = parseBlock(body);
    expect(result.ok).toBe(true);
    expect(result.ok && result.chart.table.rows).toEqual([
      ["Mon", "3"],
      ["Tue", "5"],
    ]);
  });

  it("ignores a leading byte-order mark", () => {
    expect(outcome(parseBlock(`\uFEFF${body}`))).toEqual(outcome(parseBlock(body)));
  });

  it("keeps the filename option for a derived title", () => {
    const untitled = "type: bar\nx: day\ny: visits\n\nday,visits\nMon,3";
    const result = parseBlock(untitled, { filename: "notes/weekly-visits.md" });
    const viaFence = parseMarkdown(`\`\`\`chart\n${untitled}\n\`\`\``, {
      filename: "notes/weekly-visits.md",
    });
    expect(outcome(result)).toEqual(outcome(viaFence));
  });

  it("is empty-fence for blank text, with the table kept empty", () => {
    const result = parseBlock("  \n");
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error.code).toBe("E_EMPTY_FENCE");
  });

  it("keeps the rows of a fence cut off before its closing line", () => {
    expect(outcome(parseBlock(`\`\`\`chart\n${body}`))).toEqual(outcome(parseBlock(body)));
    expect(outcome(parseBlock(`\`\`\`chart\n${body}\n`))).toEqual(outcome(parseBlock(body)));
  });

  it("reads an indented fence like the bare body", () => {
    const indented = `  \`\`\`markvis\n${body}\n  \`\`\`\n`;
    expect(outcome(parseBlock(indented))).toEqual(outcome(parseBlock(body)));
  });

  it("reads the first chart when Markdown follows the closing fence", () => {
    const source = `\`\`\`chart\n${body}\n\`\`\`\n\nSome text after.\n`;
    expect(outcome(parseBlock(source))).toEqual(outcome(parseMarkdown(source)));
    expect(parseBlock(source).ok).toBe(true);
  });

  it("does not change what parse() accepts", () => {
    const result = parseMarkdown(body);
    expect(!result.ok && result.error.code).toBe("E_EMPTY_FENCE");
  });
});

describe("parseBlock defaults", () => {
  const body = "type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5";
  // Defaults can come from untyped script or props, so they are checked too.
  const loose = (defaults: Record<string, unknown>) =>
    parseBlock(body, { defaults: defaults as ParseOptions["defaults"] });

  it("uses a default where the block leaves the field out", () => {
    const result = parseBlock(body, { defaults: { theme: "docs", palette: "warm", surface: "dark" } });
    expect(result.ok && [result.chart.theme, result.chart.palette, result.chart.surface]).toEqual(["docs", "warm", "dark"]);
  });

  it("lets the block's own field win", () => {
    const result = parseBlock(`theme: shadcn\n${body}`, { defaults: { theme: "docs" } });
    expect(result.ok && result.chart.theme).toBe("shadcn");
  });

  const bad: Array<[string, Record<string, unknown>, string]> = [
    ["a surface value as theme", { theme: "dark" }, "E_UNKNOWN_THEME"],
    ["a theme in the wrong case", { theme: "Docs" }, "E_UNKNOWN_THEME"],
    ["an unknown palette", { palette: "blue" }, "E_UNKNOWN_PALETTE"],
    ["an unknown surface", { surface: "auto" }, "E_UNKNOWN_FIELD"],
    ["a theme that is not a string", { theme: 42 }, "E_UNKNOWN_THEME"],
  ];

  for (const [label, defaults, code] of bad) {
    it(`fails without throwing, rows kept, for ${label}`, () => {
      const result = loose(defaults);
      expect(result.ok).toBe(false);
      expect(!result.ok && result.error.code).toBe(code);
      expect(!result.ok && result.error.message).toContain("option");
      expect(!result.ok && result.table.rows).toEqual([
        ["Mon", "3"],
        ["Tue", "5"],
      ]);
    });
  }

  it("ignores a bad default the block overrides", () => {
    const result = parseBlock(`theme: docs\n${body}`, { defaults: { theme: "dark" } as ParseOptions["defaults"] });
    expect(result.ok).toBe(true);
  });
});
