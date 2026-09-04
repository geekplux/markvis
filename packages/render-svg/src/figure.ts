import type { ChartIR } from "@markvis/ir";
import { PAPER, TITLE_BASELINE, TYPE } from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

export function paperRect(): string {
  return `  <rect width="100%" height="100%" fill="${PAPER}"/>`;
}

/** Visible title from IR; never a chart-type word. Empty → y field. */
export function visibleTitle(chart: ChartIR): string {
  const title = chart.title.trim();
  if (title.length > 0) {
    return title;
  }
  return chart.y ?? "";
}

/** Left-aligned to plot left. Unit rides the same line as `Title · USD`. */
export function drawTitle(title: string, x: number, unit?: string): string {
  const unitSpan = unit
    ? `<tspan font-size="${TYPE.unit.size}" font-weight="${TYPE.unit.weight}" fill="${TYPE.unit.fill}"> · ${escapeXml(unit)}</tspan>`
    : "";
  return `  <text ${attrs({
    x: fmtPx(x),
    y: TITLE_BASELINE,
    "text-anchor": "start",
    "font-size": TYPE.title.size,
    "font-weight": TYPE.title.weight,
    fill: TYPE.title.fill,
  })}>${escapeXml(title)}${unitSpan}</text>`;
}
