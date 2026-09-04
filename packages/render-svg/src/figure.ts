import type { ChartIR } from "@markvis/ir";
import { PAPER, SVG_WIDTH, TITLE_BASELINE, TYPE } from "./tokens.js";
import { attrs, escapeXml } from "./xml.js";

export function paperRect(): string {
  return `  <rect width="100%" height="100%" fill="${PAPER}"/>`;
}

/** Visible title; unit rides the same line as `Title · USD k`. */
export function drawTitle(chart: ChartIR, unit?: string): string {
  const shownUnit = unit ?? chart.unit;
  const unitSpan = shownUnit
    ? `<tspan font-size="${TYPE.unit.size}" font-weight="${TYPE.unit.weight}" fill="${TYPE.unit.fill}"> · ${escapeXml(shownUnit)}</tspan>`
    : "";
  return `  <text ${attrs({
    x: SVG_WIDTH / 2,
    y: TITLE_BASELINE,
    "text-anchor": "middle",
    "font-size": TYPE.title.size,
    "font-weight": TYPE.title.weight,
    fill: TYPE.title.fill,
  })}>${escapeXml(chart.title)}${unitSpan}</text>`;
}
