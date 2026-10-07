/**
 * Seeded fuzz: random chart objects and rows, and random cuts of a
 * streaming reply. Nothing throws, a bad block keeps its rows, and an open
 * fence never shows an error.
 */
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import { describe, expect, it } from "vitest";
import { render } from "@markvis/html";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "../src/index.js";
import { chartBlock, type ChartFields, type DataRow } from "../src/block.js";

let seed = 20261008;
const rnd = (): number => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const pick = <T>(items: readonly T[]): T => items[Math.floor(rnd() * items.length)]!;

const TYPES = ["bar", "line", "area", "scatter", "pie", "hist", "heatmap", "funnel", "waterfall", "radar",
  "gauge", "sankey", "treemap", "dumbbell", "bullet", "boxplot", "calendar", "donut", ""] as const;
const KEYS = ["k", "v", "s", "t", "a,b", 'q"q', "| p", "[j", "{o", "line\nbreak", " pad ", "", "__proto__x"];
const VALUES: unknown[] = [0, 1, -1, 1e308, -1e308, Number.NaN, Infinity, 0.1, "", "x", "a,b", 'say "hi"',
  "two\nlines", "\r\n", null, undefined, true, { a: 1 }, [1, 2], "2026-02-30", "2026-03-01", "<b>"];

function randomChart(): { chart: ChartFields; data: DataRow[] } {
  const chart: ChartFields = { type: pick(TYPES) };
  for (const field of ["x", "y", "series", "target", "role"]) {
    if (rnd() < 0.6) chart[field] = pick(KEYS);
  }
  if (rnd() < 0.3) chart.title = String(pick(VALUES));
  if (rnd() < 0.2) chart[pick(["layout", "innerRadius", "min", "max", "orient", "bogus"])] = String(pick(VALUES));
  const data: DataRow[] = [];
  const rows = Math.floor(rnd() * 12);
  for (let r = 0; r < rows; r++) {
    const row: DataRow = {};
    const width = 1 + Math.floor(rnd() * 4);
    for (let c = 0; c < width; c++) row[pick(KEYS)] = pick(VALUES);
    data.push(row);
  }
  return { chart, data };
}

describe("chart + data never throws and keeps rows", () => {
  it("handles 800 random charts", () => {
    for (let i = 0; i < 800; i++) {
      const { chart, data } = randomChart();
      const html = renderToStaticMarkup(createElement(Markvis, { chart, data }));
      expect(/<svg|markvis-error/.test(html), JSON.stringify({ chart, data })).toBe(true);
      const result = render(chartBlock(chart, data));
      if (!result.ok && result.table.columns.length > 0 && result.table.columns[0] !== "_raw") {
        expect(result.table.rows.length, JSON.stringify({ chart, data })).toBe(data.length);
      }
    }
  });
});

describe("streaming never flashes an error", () => {
  const PROSE = ["", "Here is the chart.\n\n", "- item\n\n", "> quote\n\n", "Text ``` not a fence\n\n"];
  const FENCES = ["```", "````", "~~~"];

  function randomReply(): { text: string; closedAt: number } {
    const { chart, data } = randomChart();
    const fence = pick(FENCES);
    const head = `${pick(PROSE)}${fence}${pick(["chart", "markvis", "vis"])}\n`;
    const body = rnd() < 0.2 ? String(pick(VALUES)) : chartBlock(chart, data);
    const text = `${head}${body}${body.endsWith("\n") ? "" : "\n"}${fence}\n${pick(PROSE)}`;
    return { text, closedAt: text.indexOf(`\n${fence}\n`, head.length - 1) + 1 + fence.length };
  }

  it("handles 300 random replies cut at random points", () => {
    for (let i = 0; i < 300; i++) {
      const { text, closedAt } = randomReply();
      for (let j = 0; j < 6; j++) {
        const cut = Math.floor(rnd() * (text.length + 1));
        const html = renderToStaticMarkup(
          createElement(Markdown, {
            components: markvisComponents,
            remarkPlugins: [remarkMarkvisStreaming],
            children: text.slice(0, cut),
          }),
        );
        if (cut < closedAt) {
          expect(html, JSON.stringify(text.slice(0, cut))).not.toContain("markvis-error");
        }
      }
    }
  });
});
