// Typechecked by scripts/dts.test.ts. Every import goes through the
// package's own name, so TypeScript resolves package.json#exports to the
// shipped dist/*.d.ts the way an installed consumer's would.
import { createElement, type ReactElement } from "react";
import {
  CHART_TYPES,
  extractCharts,
  parseMarkdown,
  render,
  renderSvg,
  type ChartIR,
  type ChartType,
  type RenderResult,
} from "markvis";
import { parseBlock, readChartField, setChartField, type ParseResult } from "markvis/parser";
import { renderSvg as renderSvgOnly } from "markvis/render-svg";
import { ChartIRSchema, PALETTES, THEMES, type ChartPalette, type ChartTheme } from "markvis/ir";
import remarkDefault, { remarkMarkvis } from "markvis/remark";
import rehypeDefault, { rehypeMarkvis } from "markvis/rehype";
import markdownItDefault, { escapeHtml, htmlTable, markdownItMarkvis } from "markvis/markdown-it";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "markvis/react";
import { folio, resolvePalette, resolveThemePack, themeRegistry, type ThemeTokens } from "markvis/themes";
import { CliError, VERSION, bakeMarkdown, runCli, type CliContext } from "markvis/cli";

const block = "type: bar\nx: k\ny: v\n\nk,v\nA,1\n";

const result: RenderResult = render(block, { width: 480, theme: "folio", surface: "dark" });
const html: string = result.html;
if (result.ok) {
  const svg: string = result.svg;
  const chart: ChartIR = result.chart;
  const again: string = renderSvg(chart, { surface: "light" });
  const only: string = renderSvgOnly(chart);
  void [svg, again, only];
} else {
  const code: string = result.error.code;
  const rows: string[][] = result.table.rows;
  void [code, rows];
}

const parsed: ParseResult = parseBlock(block, { filename: "a.md" });
if (parsed.ok) {
  const type: ChartType = parsed.chart.type;
  void type;
}
void parseMarkdown("```chart\n" + block + "```\n");
void extractCharts("").map((c) => c.raw);
const title: string | undefined = readChartField(block, "title");
const edited: string = setChartField(block, "title", null);

const firstType: ChartType = CHART_TYPES[0];
const theme: ChartTheme = THEMES[0];
const palette: ChartPalette = PALETTES[0];
void ChartIRSchema;

const plugins = [remarkDefault, remarkMarkvis, rehypeDefault, rehypeMarkvis, remarkMarkvisStreaming];
const md = { core: { ruler: { after: () => {} } }, renderer: { rules: {} } };
markdownItMarkvis(md);
markdownItDefault(md);
const table: string = htmlTable({ columns: ["k"], rows: [["A"]] });
const escaped: string = escapeHtml("<b>");

const fromSource: ReactElement = createElement(Markvis, { source: block, width: 320 });
const whileStreaming: ReactElement = createElement(Markvis, { source: block, streaming: true, colors: "static" });
const fromData: ReactElement = createElement(Markvis, {
  chart: { type: "bar", x: "k", y: "v" },
  data: [{ k: "A", v: 1 }],
});
const { pre, code } = markvisComponents;

const tokens: ThemeTokens = folio;
void [resolveThemePack("folio"), resolvePalette("warm"), themeRegistry];

const ctx: Partial<CliContext> = { cwd: ".", stdout: { write: () => {} } };
const status: number = runCli(["check", "README.md"], ctx);
const version: string = VERSION;
const error: Error = new CliError("x");
void bakeMarkdown;

// @ts-expect-error width is a number
render(block, { width: "480" });
// @ts-expect-error an unknown theme is rejected
render(block, { theme: "neon" });
// @ts-expect-error source and chart are exclusive
createElement(Markvis, { source: block, chart: { type: "bar" }, data: [] });

export {
  html, title, edited, firstType, theme, palette, plugins, table, escaped,
  fromSource, whileStreaming, fromData, pre, code, tokens, status, version, error,
};
