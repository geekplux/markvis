import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  CHART_TYPES,
  ChartIRSchema,
  columnValues,
  type ChartType,
} from "@markvis/ir";
import { ERROR_CODES, parseMarkdown, type ErrorCode } from "../src/index.js";

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

function expectedType(file: string): ChartType {
  const base = file.replace(/\.md$/, "");
  for (const type of CHART_TYPES) {
    if (base.includes(`-${type}-`) || base.endsWith(`-${type}`)) {
      return type;
    }
  }
  for (const type of CHART_TYPES) {
    if (base.includes(type)) {
      return type;
    }
  }
  throw new Error(`cannot derive type from ${file}`);
}

function expectedError(source: string, file: string): ErrorCode {
  const match = source.match(/E_[A-Z_]+/);
  if (!match) {
    throw new Error(`no error code in ${file}`);
  }
  const code = match[0];
  if (!(ERROR_CODES as readonly string[]).includes(code)) {
    throw new Error(`unknown error code ${code} in ${file}`);
  }
  return code as ErrorCode;
}

describe("fixture inventory", () => {
  it("covers 52 valid fixtures", () => {
    expect(validFiles).toHaveLength(52);
  });

  it("covers 19 invalid fixtures", () => {
    expect(invalidFiles).toHaveLength(19);
  });
});

describe("valid fixtures", () => {
  it.each(validFiles)("%s", (file) => {
    const source = readFileSync(join(validDir, file), "utf8");
    const result = parseMarkdown(source, { filename: file });
    expect(result.ok, `${file} should parse`).toBe(true);
    if (!result.ok) {
      return;
    }
    const chart = ChartIRSchema.parse(result.chart);
    expect(chart.type).toBe(expectedType(file));
    expect(chart.markvis).toBe(2);
    expect(chart.title.length).toBeGreaterThan(0);
    expect(chart.table.rows.length).toBeGreaterThan(0);
    expect(chart.table.columns.length).toBeGreaterThan(0);
    const xValues = columnValues(chart.table, chart.x);
    expect(xValues).toEqual([...xValues]);
    expect(xValues).toHaveLength(chart.table.rows.length);
  });
});

describe("invalid fixtures", () => {
  it.each(invalidFiles)("%s", (file) => {
    const source = readFileSync(join(invalidDir, file), "utf8");
    const code = expectedError(source, file);
    const result = parseMarkdown(source, { filename: file });
    expect(result.ok, `${file} should fail`).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe(code);
    expect(result.error.message).toContain(code);
    expect(result.error.message.includes("\n")).toBe(false);
    const recovered =
      result.table.rows.length > 0 || result.raw.trim().length > 0;
    expect(recovered, `${file} must not drop data`).toBe(true);
  });
});

describe("language rules", () => {
  it("keeps unsorted month row order", () => {
    const source = readFileSync(
      join(validDir, "13-line-unsorted-months.md"),
      "utf8",
    );
    const result = parseMarkdown(source, {
      filename: "13-line-unsorted-months.md",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(columnValues(result.chart.table, "month")).toEqual([
      "Mar",
      "Jan",
      "Dec",
      "Jun",
    ]);
  });

  it("does not normalize pie slices to 100", () => {
    const source = readFileSync(join(validDir, "14-pie-sum-105.md"), "utf8");
    const result = parseMarkdown(source, { filename: "14-pie-sum-105.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const values = columnValues(result.chart.table, result.chart.y ?? "").map(
      Number,
    );
    expect(values).toEqual([45, 35, 25]);
    expect(values.reduce((sum, n) => sum + n, 0)).toBe(105);
  });

  it("keeps unused extra columns in the fallback table", () => {
    const source = readFileSync(
      join(validDir, "31-bar-extra-unused-col.md"),
      "utf8",
    );
    const result = parseMarkdown(source, {
      filename: "31-bar-extra-unused-col.md",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.chart.x).toBe("segment");
    expect(result.chart.y).toBe("score");
    expect(result.chart.table.columns).toEqual(["segment", "score", "note"]);
    expect(columnValues(result.chart.table, "note")).toEqual([
      "stable",
      "watch",
      "improve",
    ]);
  });

  it("infers default x and y columns", () => {
    const source = readFileSync(
      join(validDir, "51-bar-omitted-xy.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "51-bar-omitted-xy.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.chart.x).toBe("category");
    expect(result.chart.y).toBe("value");
  });

  it("parses chart, markvis, and vis tags", () => {
    const files = [
      "01-bar-basic.md",
      "05-pie-raw.md",
      "03-area-basic.md",
    ] as const;
    const types: ChartType[] = ["bar", "pie", "area"];
    for (let i = 0; i < files.length; i++) {
      const file = files[i]!;
      const result = parseMarkdown(
        readFileSync(join(validDir, file), "utf8"),
        { filename: file },
      );
      expect(result.ok, file).toBe(true);
      if (result.ok) {
        expect(result.chart.type).toBe(types[i]);
      }
    }
  });

  it("parses progressive HTML comment plus GFM", () => {
    const source = readFileSync(join(validDir, "08-bar-comment.md"), "utf8");
    const result = parseMarkdown(source, { filename: "08-bar-comment.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.chart.type).toBe("bar");
    expect(result.chart.title).toBe("Feb led Q3 at 180");
    expect(columnValues(result.chart.table, "month")).toEqual([
      "Jan",
      "Feb",
      "Mar",
    ]);
  });

  it("keeps extra cells on E_EXTRA_COLUMN", () => {
    const source = readFileSync(
      join(invalidDir, "04-extra-columns.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "04-extra-columns.md" });
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe("E_EXTRA_COLUMN");
    expect(result.table.rows[0]).toEqual(["Jan", "120", "extra"]);
    expect(result.table.rows[1]).toEqual(["Feb", "180"]);
  });

  it("keeps the negative pie slice in the fallback table", () => {
    const source = readFileSync(
      join(invalidDir, "05-pie-negative.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "05-pie-negative.md" });
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe("E_PIE_NEGATIVE");
    expect(result.table.rows).toEqual([
      ["A", "40"],
      ["B", "-5"],
      ["C", "20"],
    ]);
  });

  it("defaults omitted theme to folio", () => {
    const source = [
      "```chart",
      "type: bar",
      "title: Default theme",
      "x: month",
      "y: revenue",
      "",
      "month,revenue",
      "Jan,120",
      "Feb,180",
      "```",
      "",
    ].join("\n");
    const result = parseMarkdown(source);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.chart.theme).toBe("folio");
  });

  it.each(["folio", "highcharts", "shadcn", "docs"] as const)(
    "accepts theme %s",
    (theme) => {
      const source = [
        "```chart",
        "type: bar",
        `theme: ${theme}`,
        "title: Themed",
        "x: month",
        "y: revenue",
        "",
        "month,revenue",
        "Jan,120",
        "Feb,180",
        "```",
        "",
      ].join("\n");
      const result = parseMarkdown(source);
      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }
      expect(result.chart.theme).toBe(theme);
    },
  );

  it("rejects unknown theme with E_UNKNOWN_THEME and table fallback", () => {
    const source = readFileSync(
      join(invalidDir, "19-unknown-theme.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "19-unknown-theme.md" });
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe("E_UNKNOWN_THEME");
    expect(result.error.message).toContain("E_UNKNOWN_THEME");
    expect(result.error.message.includes("\n")).toBe(false);
    expect(result.table.columns).toEqual(["month", "revenue"]);
    expect(result.table.rows).toEqual([
      ["Jan", "120"],
      ["Feb", "180"],
    ]);
  });
});
