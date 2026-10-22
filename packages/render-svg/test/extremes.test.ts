/**
 * Degenerate input never reaches an attribute: a value range that overflows
 * to Infinity, an all-zero range, a single row, a width far below any
 * column. Every type renders or fails with a code and the table; nothing
 * throws, and no `NaN`, `Infinity`, or negative size is written.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHART_TYPES, type ChartType } from "@markvis/ir";
import { render } from "@markvis/html";

const here = dirname(fileURLToPath(import.meta.url));
const validDir = join(here, "../../../examples/valid");

const VALUE_SETS: [string, number[]][] = [
  ["overflowing range", [1e308, -1e308, 1e308]],
  ["overflowing sum", [1e308, 1e308, -1e308]],
  ["all zero", [0, 0]],
  ["single row", [5]],
];
const WIDTHS = [200, 720] as const;
const LETTERS = ["A", "B", "C", "D"];

/** One block of `type` carrying `values`, in the columns that type reads. */
function block(type: ChartType, values: number[]): string {
  const head = (fields: string) => `type: ${type}\ntitle: Edge\n${fields}\n\n`;
  const rows = (make: (v: number, i: number) => string) => values.map(make).join("\n");
  switch (type) {
    case "hist":
      return head("x: v") + "v\n" + rows((v) => String(v));
    case "scatter":
      return head("x: a\ny: v") + "a,v\n" + rows((v) => `${v},${v}`);
    case "heatmap":
      return head("x: k\ny: v\nseries: s") + "k,s,v\n" + rows((v, i) => `${LETTERS[i]},${i % 2 ? "p" : "q"},${v}`);
    case "radar":
      return head("x: k\ny: v\nseries: s") + "k,s,v\n" + rows((v, i) => `${LETTERS[i]},one,${v}`);
    case "sankey":
      return head("x: from\ny: v\nseries: to") + "from,to,v\n" + rows((v, i) => `${LETTERS[i]},${LETTERS[i + 1]},${v}`);
    case "treemap":
      return head("x: k\ny: v") + "k,v\n" + rows((v, i) => `${LETTERS[i]},${v}`);
    case "dumbbell":
      return head("x: k\ny: v\nseries: p") + "k,p,v\n" + rows((v, i) => `${LETTERS[i >> 1]},${i % 2 ? "after" : "before"},${v}`);
    case "boxplot":
      return head("x: k\ny: v") + "k,v\n" + rows((v) => `A,${v}`);
    case "calendar":
      return head("x: date\ny: v") + "date,v\n" + rows((v, i) => `2026-01-0${i + 1},${v}`);
    case "bullet":
      return head("x: k\ny: v\ntarget: t") + "k,v,t\n" + rows((v, i) => `${LETTERS[i]},${v},${v}`);
    default:
      return head("x: k\ny: v") + "k,v\n" + rows((v, i) => `${LETTERS[i]},${v}`);
  }
}

/** Every attribute a reader would choke on: not a number, or a negative size. */
function defects(svg: string): string[] {
  const found = [...svg.matchAll(/\s(?:width|height|r|rx|ry)="-[^"]*"/g)].map((m) => m[0].trim());
  for (const word of ["NaN", "Infinity", "undefined"]) {
    if (svg.includes(word)) found.push(word);
  }
  return found;
}

describe("non-finite and empty ranges never write NaN", () => {
  const cases = CHART_TYPES.flatMap((type) =>
    VALUE_SETS.flatMap(([name, values]) => WIDTHS.map((width) => [type, name, values, width] as const)),
  );

  it("covers every type", () => {
    expect(CHART_TYPES).toHaveLength(17);
  });

  // A pie narrower than its gutters once wrote a negative radius.
  const pieCases = VALUE_SETS.filter(([name]) => name === "all zero" || name === "single row").flatMap(
    ([name, values]) => [50, 100].map((width) => ["pie" as ChartType, name, values, width] as const),
  );

  it.each([...cases, ...pieCases])("%s, %s, %j, width %i", (type, _name, values, width) => {
    const text = block(type, values);
    const result = render(text, { width });
    if (result.ok) {
      expect(defects(result.svg)).toEqual([]);
    } else {
      expect(result.error.code).toMatch(/^E_/);
      expect(result.html).toContain("<table");
    }
  });
});

describe("tiny widths keep every plot the right way round", () => {
  const blocks = readdirSync(validDir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((file) => {
      const md = readFileSync(join(validDir, file), "utf8");
      const fence = /```[a-z]+\n[\s\S]*?```/.exec(md);
      return [file, fence ? fence[0] : md.replace(/^<!-- intent:.*-->\n/m, "").trim()] as const;
    });

  it.each([200, 120])("no negative size in any example at width %i", (width) => {
    for (const [file, text] of blocks) {
      const result = render(text, { width });
      expect(result.ok, file).toBe(true);
      if (result.ok) expect(defects(result.svg), file).toEqual([]);
    }
  });

  it("bullet at 200: every track at least 1 px, ticks left to right", () => {
    const text = blocks.find(([file]) => file === "94-bullet-sla-uptime.md")![1];
    const result = render(text, { width: 200 });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const tracks = [...result.svg.matchAll(/<rect [^>]*?\swidth="([^"]+)"[^>]*data-track=/g)].map((m) => Number(m[1]));
    expect(tracks).toHaveLength(4);
    for (const w of tracks) expect(w).toBeGreaterThanOrEqual(1);
    const ticks = [...result.svg.matchAll(/<text x="([^"]+)" y="[^"]+" text-anchor="middle">/g)].map((m) => Number(m[1]));
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < ticks.length; i++) expect(ticks[i]!).toBeGreaterThan(ticks[i - 1]!);
  });

  it.each([200, 120])("row charts at %i: value ticks run left to right", (width) => {
    const rowCharts = blocks.filter(([file]) => /-(bullet|dumbbell|boxplot|bar-horizontal)[-.]/.test(file));
    expect(rowCharts.length).toBeGreaterThan(8);
    for (const [file, text] of rowCharts) {
      const result = render(text, { width });
      if (!result.ok) throw new Error(file);
      const ticks = [...result.svg.matchAll(/<text x="([^"]+)" y="[^"]+" text-anchor="middle">/g)].map((m) => Number(m[1]));
      expect(ticks.length, file).toBeGreaterThanOrEqual(2);
      expect(ticks[ticks.length - 1]!, file).toBeGreaterThan(ticks[0]!);
      for (let i = 1; i < ticks.length; i++) expect(ticks[i]!, file).toBeGreaterThanOrEqual(ticks[i - 1]!);
    }
  });

  it("heatmap at 100: every cell keeps a positive width", () => {
    const heatmaps = blocks.filter(([file]) => /-heatmap-/.test(file));
    expect(heatmaps.length).toBeGreaterThanOrEqual(4);
    for (const [file, text] of heatmaps) {
      const result = render(text, { width: 100 });
      if (!result.ok) throw new Error(file);
      const cells = [...result.svg.matchAll(/<rect [^>]*?\swidth="([^"]+)"[^>]*data-series=/g)].map((m) => Number(m[1]));
      expect(cells.length, file).toBeGreaterThan(0);
      for (const w of cells) expect(w, file).toBeGreaterThan(0);
    }
  });

  it.each([50, 100, 160])("numeric x at %i: scatter, line, area ticks run left to right", (width) => {
    let checked = 0;
    for (const [file, text] of blocks.filter(([file]) => /-(scatter|line|area)-/.test(file))) {
      const result = render(text, { width });
      if (!result.ok) throw new Error(file);
      const ticks = [...result.svg.matchAll(/<text x="([^"]+)"[^>]*data-full-label="([^"]+)"/g)]
        .map((m) => ({ x: Number(m[1]), value: Number(m[2]!.replace(/,/g, "")) }))
        .filter((tick) => Number.isFinite(tick.value));
      if (ticks.length < 2) continue;
      checked++;
      ticks.sort((a, b) => a.value - b.value);
      expect(ticks[ticks.length - 1]!.x, file).toBeGreaterThan(ticks[0]!.x);
      for (let i = 1; i < ticks.length; i++) expect(ticks[i]!.x, file).toBeGreaterThanOrEqual(ticks[i - 1]!.x);
    }
    expect(checked).toBeGreaterThanOrEqual(10);
  });
});

describe("long tables never throw", () => {
  // Past about 120k rows, Math.min(...values) and lines.push(...marks) throw a
  // RangeError. One block per paint path that walks every row.
  const N = 150_000;
  const rows = (make: (i: number) => string) => Array.from({ length: N }, (_, i) => make(i)).join("\n");
  it.each([
    ["scatter", `type: scatter\nx: a\ny: b\n\na,b\n${rows((i) => `${i},${i % 97}`)}`],
    ["waterfall", `type: waterfall\nx: k\ny: v\n\nk,v\n${rows((i) => `k${i},${(i % 7) - 3}`)}`],
    ["bullet", `type: bullet\nx: k\ny: v\n\nk,v\n${rows((i) => `k${i},${i % 97}`)}`],
    ["boxplot", `type: boxplot\nx: k\ny: v\n\nk,v\n${rows((i) => `g${i % 5},${i % 97}`)}`],
    ["funnel", `type: funnel\nx: k\ny: v\n\nk,v\n${rows((i) => `k${i},${N - i}`)}`],
  ])("%s with 150k rows draws", (_type, text) => {
    const result = render(`markvis: 2\n${text}`, { width: 720 });
    expect(result.ok).toBe(true);
  }, 30_000);
});
