import type { ChartIR } from "@markvis/ir";
import { loadRows } from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
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
  PIE_RADIUS_RATIO,
  PIE_STROKE,
  PLOT_BG,
  PLOT_BORDER,
  PLOT_BORDER_WIDTH,
  STRUCTURE_OPACITY,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

function polar(cx: number, cy: number, r: number, a: number): { x: number; y: number } {
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
): string {
  const p0 = polar(cx, cy, r, a0);
  const p1 = polar(cx, cy, r, a1);
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  const sweep = a1 > a0 ? 1 : 0;
  return `M${fmtPx(p0.x)} ${fmtPx(p0.y)} A${fmtPx(r)} ${fmtPx(r)} 0 ${large} ${sweep} ${fmtPx(p1.x)} ${fmtPx(p1.y)}`;
}

export function renderGauge(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const first = rows[0];
  const value = first?.y ?? 0;
  const label = first?.xLabel ?? "";
  const gmin = chart.min ?? 0;
  const gmax = chart.max !== undefined ? chart.max : Math.max(value, 1);
  const span = gmax - gmin;
  const t =
    span === 0 ? 0.5 : Math.max(0, Math.min(1, (value - gmin) / span));

  const left = MARGIN.left;
  const right = MARGIN.right;
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
  const r = Math.min(box.width / 2, box.height) * (PIE_RADIUS_RATIO + 0.12);
  const cy = box.bottom - 8;
  const aStart = Math.PI;
  const aEnd = 0;
  const aNeedle = aStart + t * (aEnd - aStart);
  const style = seriesStyle(0);
  const track = seriesStyle(7);

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
      d: arcPath(cx, cy, r, aStart, aEnd),
      fill: "none",
      stroke: track.color,
      "stroke-opacity": 0.28,
      "stroke-width": 14,
      "stroke-linecap": "round",
      "data-gauge-track": "1",
    })}/>`,
  );
  if (t > 0) {
    lines.push(
      `    <path ${attrs({
        d: arcPath(cx, cy, r, aStart, aNeedle),
        fill: "none",
        stroke: style.color,
        "stroke-opacity": style.opacity === 1 ? undefined : style.opacity,
        "stroke-width": 14,
        "stroke-linecap": "round",
        "data-gauge-value": formatNumber(value),
      })}/>`,
    );
  }
  const tip = polar(cx, cy, r - 8, aNeedle);
  lines.push(
    `    <line ${attrs({
      x1: fmtPx(cx),
      y1: fmtPx(cy),
      x2: fmtPx(tip.x),
      y2: fmtPx(tip.y),
      stroke: INK,
      "stroke-width": PIE_STROKE + 1,
      "stroke-linecap": "round",
      "data-gauge-needle": "1",
    })}/>`,
  );
  lines.push(
    `    <circle ${attrs({
      cx: fmtPx(cx),
      cy: fmtPx(cy),
      r: 5,
      fill: INK,
      "stroke-opacity": STRUCTURE_OPACITY,
    })}/>`,
  );
  lines.push(`  </g>`);

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  const minPt = polar(cx, cy, r + 18, aStart);
  const maxPt = polar(cx, cy, r + 18, aEnd);
  lines.push(
    `    <text ${attrs({
      x: fmtPx(minPt.x),
      y: fmtPx(minPt.y),
      "text-anchor": "middle",
      "dominant-baseline": "hanging",
      "data-gauge-min": "1",
    })}>${escapeXml(formatNumber(gmin))}</text>`,
  );
  lines.push(
    `    <text ${attrs({
      x: fmtPx(maxPt.x),
      y: fmtPx(maxPt.y),
      "text-anchor": "middle",
      "dominant-baseline": "hanging",
      "data-gauge-max": "1",
    })}>${escapeXml(formatNumber(gmax))}</text>`,
  );
  lines.push(`  </g>`);

  const valueText = label
    ? `${label} · ${formatNumber(value)}`
    : formatNumber(value);
  lines.push(
    `  <text ${attrs({
      x: fmtPx(cx),
      y: fmtPx(cy + 22),
      "text-anchor": "middle",
      "dominant-baseline": "hanging",
      "font-size": TYPE.value.size,
      "font-weight": TYPE.value.weight,
      fill: TYPE.value.fill,
      "data-label": label,
    })}>${escapeXml(valueText)}</text>`,
  );

  return { lines, height };
}
