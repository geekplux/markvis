import type { ChartIR } from "@markvis/ir";
import { loadRows } from "./data.js";
import { drawTitle, reserveTitle, visibleTitle } from "./figure.js";
import {
  fitFrameHeight,
  titleBlockTop,
  SVG_WIDTH,
  type Painted,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import { formatNumber } from "./scale.js";
import {
  INK,
  MARGIN,
  PLOT_BG,
  PLOT_BORDER,
  PLOT_BORDER_WIDTH,
  STRUCTURE_OPACITY,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

const STROKE_W = 12;
const HERO_SIZE = 28;
const LABEL_SIZE = 11;

function polar(cx: number, cy: number, r: number, a: number): { x: number; y: number } {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

/** Upper semicircle: π → 2π (through top). SVG clockwise sweep. */
function upperArc(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
): string {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const delta = a1 - a0;
  const large = Math.abs(delta) > Math.PI ? 1 : 0;
  // Clockwise in SVG (y-down) from π through top (3π/2) to 2π.
  const sweep = 1;
  return `M${fmtPx(p0.x)} ${fmtPx(p0.y)} A${fmtPx(r)} ${fmtPx(r)} 0 ${large} ${sweep} ${fmtPx(p1.x)} ${fmtPx(p1.y)}`;
}

export function renderGauge(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const first = rows[0];
  const value = first?.y ?? null;
  const label = (first?.xLabel ?? "").trim();
  const gmin = chart.min ?? 0;
  // Omitted max is the documented 0–100 percentage range, not the current value.
  const gmax = chart.max !== undefined ? chart.max : 100;
  if (value === null) {
    reserveTitle(visibleTitle(chart), MARGIN.left, chart.unit);
    const top = titleBlockTop(0);
    return {
      height: fitFrameHeight(top, MARGIN.right),
      lines: [drawTitle(visibleTitle(chart), MARGIN.left, chart.unit)],
    };
  }
  const span = gmax - gmin;
  const t =
    span === 0 ? 0.5 : Math.max(0, Math.min(1, (value - gmin) / span));

  const left = MARGIN.left;
  const right = MARGIN.right;
  reserveTitle(visibleTitle(chart), left, chart.unit);
  const top = titleBlockTop(0);
  const bottom = MARGIN.right + 28;
  const height = fitFrameHeight(top, bottom);
  const box = {
    left,
    right: SVG_WIDTH - right,
    top,
    bottom: height - bottom,
    width: SVG_WIDTH - left - right,
    height: height - top - bottom,
  };
  const cx = (box.left + box.right) / 2;
  const cy = box.bottom - 8;
  const r = Math.min(box.width / 2, box.height) * 0.92;
  // Upper semicircle through top: π → 2π (feet left/right).
  const aStart = Math.PI;
  const aEnd = 2 * Math.PI;
  const aValue = aStart + t * Math.PI;
  const style = seriesStyle(0);
  const minFoot = polar(cx, cy, r, aStart);
  const maxFoot = polar(cx, cy, r, aEnd);

  const lines: string[] = [drawTitle(visibleTitle(chart), box.left, chart.unit)];

  if (PLOT_BG) {
    lines.push(
      `  <rect ${attrs({
        x: fmtPx(box.left),
        y: fmtPx(box.top),
        width: fmtPx(box.width),
        height: fmtPx(box.height),
        fill: PLOT_BG,
        "data-plot-bg": "1",
      })}/>`,
    );
  }
  if (PLOT_BORDER_WIDTH > 0 && PLOT_BORDER) {
    lines.push(
      `  <rect ${attrs({
        x: fmtPx(box.left),
        y: fmtPx(box.top),
        width: fmtPx(box.width),
        height: fmtPx(box.height),
        fill: "none",
        stroke: PLOT_BORDER,
        "stroke-width": PLOT_BORDER_WIDTH,
        "data-plot-border": "1",
      })}/>`,
    );
  }

  lines.push(
    `  <g ${attrs({
      "data-gauge": "1",
      "data-min": formatNumber(gmin),
      "data-max": formatNumber(gmax),
    })}>`,
  );
  lines.push(
    `    <path ${attrs({
      d: upperArc(cx, cy, r, aStart, aEnd),
      fill: "none",
      stroke: INK,
      "stroke-opacity": STRUCTURE_OPACITY,
      "stroke-width": STROKE_W,
      "stroke-linecap": "round",
      "data-gauge-track": "1",
    })}/>`,
  );
  if (t > 0) {
    lines.push(
      `    <path ${attrs({
        d: upperArc(cx, cy, r, aStart, aValue),
        fill: "none",
        stroke: style.color,
        "stroke-opacity": style.opacity === 1 ? undefined : style.opacity,
        "stroke-width": STROKE_W,
        "stroke-linecap": "round",
        "data-gauge-arc": formatNumber(value),
      })}/>`,
    );
  }
  lines.push(`  </g>`);

  const heroY = cy - r * 0.42;
  lines.push(
    `  <text ${attrs({
      x: fmtPx(cx),
      y: fmtPx(heroY),
      "text-anchor": "middle",
      "dominant-baseline": "middle",
      "font-size": HERO_SIZE,
      "font-weight": 600,
      fill: INK,
      "data-gauge-value": "1",
    })}>${escapeXml(formatNumber(value))}${chart.unit ? ` ${escapeXml(chart.unit)}` : ""}</text>`,
  );
  if (label !== "") {
    lines.push(
      `  <text ${attrs({
        x: fmtPx(cx),
        y: fmtPx(heroY + 22),
        "text-anchor": "middle",
        "dominant-baseline": "hanging",
        "font-size": LABEL_SIZE,
        "font-weight": 400,
        fill: TYPE.tick.fill,
        "data-gauge-label": "1",
      })}>${escapeXml(label)}</text>`,
    );
  }

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  lines.push(
    `    <text ${attrs({
      x: fmtPx(minFoot.x),
      y: fmtPx(cy + 14),
      "text-anchor": "middle",
      "dominant-baseline": "hanging",
      "data-gauge-min": "1",
    })}>${escapeXml(formatNumber(gmin))}</text>`,
  );
  lines.push(
    `    <text ${attrs({
      x: fmtPx(maxFoot.x),
      y: fmtPx(cy + 14),
      "text-anchor": "middle",
      "dominant-baseline": "hanging",
      "data-gauge-max": "1",
    })}>${escapeXml(formatNumber(gmax))}</text>`,
  );
  lines.push(`  </g>`);

  if (value < gmin || value > gmax) {
    const note = value > gmax ? "above range" : "below range";
    lines.push(
      `  <text ${attrs({
        x: fmtPx(cx),
        y: fmtPx(cy + 32),
        "text-anchor": "middle",
        "font-size": TYPE.tick.size,
        fill: TYPE.tick.fill,
        "data-out-of-range": "1",
      })}>${escapeXml(note)}</text>`,
    );
  }

  return { lines, height };
}
