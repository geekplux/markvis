import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { THEMES, PALETTES } from "@markvis/ir";
import { parseMarkdown, readChartField, setChartField } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const validDir = join(here, "../../../examples/valid");
const examples = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .map((name) => [name, readFileSync(join(validDir, name), "utf8")] as const);

const fence = "```chart\nmarkvis: 2\ntype: bar\nx: k\ny: v\n\nk,v\na,1\n```\n";
const comment = '<!-- intent: x -->\n\n<!-- chart: bar x=k y=v title="Q3 sales" -->\n| k | v |\n| --- | --- |\n| a | 1 |\n';

describe("setChartField", () => {
  it("inserts fence fields in header order and removes them cleanly", () => {
    let out = setChartField(fence, "surface", "dark");
    out = setChartField(out, "theme", "ant");
    out = setChartField(out, "palette", "vivid");
    expect(out).toContain("markvis: 2\ntheme: ant\npalette: vivid\nsurface: dark\ntype: bar");
    out = setChartField(out, "palette", null);
    expect(out).toContain("theme: ant\nsurface: dark\ntype: bar");
    expect(out.endsWith("k,v\na,1\n```\n")).toBe(true);
  });

  it("edits key=value pairs inside a chart comment, keeping quotes and data", () => {
    let out = setChartField(comment, "theme", "highcharts");
    expect(out).toContain('<!-- chart: bar x=k y=v title="Q3 sales" theme=highcharts -->');
    out = setChartField(out, "theme", "docs");
    expect(readChartField(out, "theme")).toBe("docs");
    out = setChartField(out, "theme", null);
    expect(out).toBe(comment);
  });

  it("never touches a data row that looks like a header", () => {
    const tricky = "```chart\ntype: bar\nx: k\ny: v\n\nk,v\ntheme: a,1\n```\n";
    expect(setChartField(tricky, "theme", "ant")).toBe(
      "```chart\ntheme: ant\ntype: bar\nx: k\ny: v\n\nk,v\ntheme: a,1\n```\n",
    );
  });
});

describe("every example takes every look", () => {
  it.each(examples)("%s", (name, source) => {
    for (const theme of THEMES) {
      for (const surface of ["light", "dark", "export"] as const) {
        for (const palette of [undefined, ...PALETTES]) {
          let edited = setChartField(source, "theme", theme);
          edited = setChartField(edited, "palette", palette ?? null);
          edited = setChartField(edited, "surface", surface === "light" ? null : surface);
          const result = parseMarkdown(edited, { filename: name });
          expect(result.ok, `${name} ${theme} ${surface} ${palette}`).toBe(true);
          if (!result.ok) return;
          expect(result.chart.theme).toBe(theme);
          expect(result.chart.surface).toBe(surface);
          expect(result.chart.palette).toBe(palette);
          expect(result.chart.table).toEqual(parseMarkdown(source, { filename: name }).ok
            ? (parseMarkdown(source, { filename: name }) as { chart: { table: unknown } }).chart.table
            : undefined);
        }
      }
    }
  });
});

describe("bare bodies", () => {
  it("edits a header typed without a fence", () => {
    const body = "type: bar\n\nmonth,revenue\nJan,1\n";
    expect(setChartField(body, "theme", "docs")).toBe("theme: docs\ntype: bar\n\nmonth,revenue\nJan,1\n");
    expect(readChartField("theme: ant\ntype: bar\n\nk,v\n", "theme")).toBe("ant");
  });

  it("leaves prose without a chart alone", () => {
    expect(setChartField("Just a note.\n", "theme", "docs")).toBe("Just a note.\n");
  });
});

describe("quoted comment values", () => {
  const quoted = '<!-- chart: bar x=k y=v title="Why theme=dark wins" -->\n| k | v |\n| --- | --- |\n| a | 1 |\n';

  it("never reads or edits text inside a quoted value", () => {
    expect(readChartField(quoted, "theme")).toBeUndefined();
    const out = setChartField(quoted, "theme", "ant");
    expect(out).toContain('title="Why theme=dark wins"');
    expect(out).toContain('title="Why theme=dark wins" theme=ant -->');
    expect(readChartField(out, "theme")).toBe("ant");
    expect(setChartField(out, "theme", null)).toBe(quoted);
  });
});
