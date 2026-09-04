import type { ChartIR } from "@markvis/ir";
import { renderCartesian } from "./cartesian.js";
import { paperRect } from "./figure.js";
import { FONT, SVG_HEIGHT, SVG_WIDTH } from "./layout.js";
import { renderPie } from "./pie.js";
import { INK } from "./tokens.js";
import { attrs, chartId, escapeXml } from "./xml.js";

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

export function renderSvg(chart: ChartIR): string {
  const id = chartId(chart);
  const inner =
    chart.type === "pie" ? renderPie(chart, id) : renderCartesian(chart, id);
  const open = `<svg ${attrs({
    xmlns: "http://www.w3.org/2000/svg",
    width: SVG_WIDTH,
    height: SVG_HEIGHT,
    viewBox: `0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`,
    role: "img",
    "aria-label": ariaLabel(chart),
    "aria-labelledby": `${id}-title`,
    "aria-describedby": `${id}-desc`,
    "data-markvis": 2,
    "data-chart-type": chart.type,
    "data-id": id,
    "font-family": FONT,
    "font-size": 12,
    fill: INK,
  })}>`;
  const lines = [
    open,
    `  <title id="${id}-title">${escapeXml(chart.title)}</title>`,
    `  <desc id="${id}-desc">${escapeXml(description(chart))}</desc>`,
    paperRect(),
    ...inner,
    `</svg>`,
  ];
  return `${lines.join("\n")}\n`;
}
