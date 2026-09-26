import type { ChartIR } from "@markvis/ir";
import { resolveTypePack } from "@markvis/types";
import { folio } from "@markvis/themes";
import { countTitleLines, visibleTitle } from "../../types/_paint/figure.js";
import { setTitleLineCount } from "../../types/_paint/layout.js";
import { MARGIN } from "../../types/_paint/tokens.js";
import { themeTokens } from "./theme.js";
import { applyFrame, applyThemeTokens, type SurfaceName } from "./tokens.js";
import { chartId } from "./chart-id.js";
import { attrs, escapeXml } from "./xml.js";

export type RenderOptions = {
  /** Intended display width in px. Layout reflows; type is not shrunk. */
  width?: number;
  /** Overrides the chart's surface field. */
  surface?: SurfaceName;
};

export function ariaLabel(chart: ChartIR): string {
  const n = chart.table.rows.length;
  const unit = chart.unit ? ` (${chart.unit})` : "";
  if (chart.type === "pie") {
    return `${chart.type} chart: ${chart.title}${unit}, ${n} slices`;
  }
  if (chart.series) {
    return `${chart.type} chart: ${chart.title}${unit}, ${n} rows, series ${chart.series}`;
  }
  return `${chart.type} chart: ${chart.title}${unit}, ${n} rows`;
}

export function description(chart: ChartIR): string {
  const bits: string[] = [
    `${chart.type} chart`,
    chart.title,
    `x=${chart.x}`,
  ];
  if (chart.y) {
    bits.push(`y=${chart.y}`);
  }
  if (chart.series) {
    bits.push(`series=${chart.series}`);
  }
  if (chart.unit) {
    bits.push(`unit=${chart.unit}`);
  }
  bits.push(`${chart.table.rows.length} rows`);
  if (chart.type === "pie") {
    bits.push("slice sizes are raw values and are not normalized to 100");
  }
  if (chart.type === "hist") {
    bits.push("x is binned with Sturges equal-width bins");
    if (chart.y) {
      bits.push("y is sample weight");
    }
  }
  return `${bits.join(". ")}.`;
}

export function renderSvg(chart: ChartIR, options?: RenderOptions): string {
  const t = themeTokens(chart.theme, chart.palette);
  applyThemeTokens(t);
  const width = options?.width ?? t.SVG_WIDTH;
  const surface = options?.surface ?? chart.surface ?? "light";
  applyFrame({ width, surface });
  setTitleLineCount(
    countTitleLines(visibleTitle(chart), MARGIN.left, chart.unit),
  );
  try {
    const id = chartId(chart);
    const painted = resolveTypePack(chart.type).paint(chart, id);
    const open = `<svg ${attrs({
      xmlns: "http://www.w3.org/2000/svg",
      width,
      height: painted.height,
      viewBox: `0 0 ${width} ${painted.height}`,
      role: "img",
      "aria-label": ariaLabel(chart),
      "aria-labelledby": `${id}-title`,
      "aria-describedby": `${id}-desc`,
      "data-markvis": 2,
      "data-chart-type": chart.type,
      "data-id": id,
      "font-family": t.FONT,
      "font-size": 12,
    })}>`;
    const plate =
      surface === "dark" ? "#1c1917" : surface === "export" ? "#ffffff" : null;
    const lines = [
      open,
      `  <title id="${id}-title">${escapeXml(chart.title)}</title>`,
      `  <desc id="${id}-desc">${escapeXml(description(chart))}</desc>`,
      // Default light stays transparent so a Markdown host supplies the page color.
      ...(plate === null
        ? []
        : [
            `  <rect ${attrs({
              width: "100%",
              height: "100%",
              fill: plate,
              "data-surface": surface,
            })}/>`,
          ]),
      ...painted.lines,
      `</svg>`,
    ];
    return `${lines.join("\n")}\n`;
  } finally {
    applyThemeTokens(folio);
    applyFrame({ width: folio.SVG_WIDTH, surface: "light" });
    setTitleLineCount(1);
  }
}
