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
import { textWidth } from "./text.js";
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

export function renderFunnel(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const values = rows.map((row) => Math.max(0, row.y));
  const maxY = Math.max(0, ...values);
  const scaleMax = maxY > 0 ? maxY : 1;

  const labelW = Math.max(
    0,
    ...rows.map((row) =>
      textWidth(
        `${row.xLabel} · ${formatNumber(row.y)}`,
        TYPE.value.size,
      ),
    ),
  );
  const left = MARGIN.left;
  const right = Math.max(MARGIN.right, labelW + 16);
  const top = titleBlockTop(0);
  const bottom = MARGIN.right;
  const height = fitFrameHeight(top, bottom);
  const plot = {
    left,
    right: SVG_WIDTH - right,
    top,
    bottom: height - bottom,
    width: SVG_WIDTH - left - right,
    height: height - top - bottom,
  };
  const n = Math.max(rows.length, 1);
  const stageH = plot.height / n;
  const cx = plot.left + plot.width / 2;

  const lines: string[] = [drawTitle(visibleTitle(chart), plot.left, chart.unit)];

  if (PLOT_BG) {
    lines.push(
      `  <rect ${attrs({
        x: fmtPx(plot.left),
        y: fmtPx(plot.top),
        width: fmtPx(plot.width),
        height: fmtPx(plot.height),
        fill: PLOT_BG,
        "data-plot-bg": "1",
      })}/>`,
    );
  }
  if (PLOT_BORDER_WIDTH > 0 && PLOT_BORDER) {
    lines.push(
      `  <rect ${attrs({
        x: fmtPx(plot.left),
        y: fmtPx(plot.top),
        width: fmtPx(plot.width),
        height: fmtPx(plot.height),
        fill: "none",
        stroke: PLOT_BORDER,
        "stroke-width": PLOT_BORDER_WIDTH,
        "data-plot-border": "1",
      })}/>`,
    );
  }

  lines.push(`  <g ${attrs({ "data-funnel": "1" })}>`);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const style = seriesStyle(i);
    const y0 = plot.top + i * stageH;
    const y1 = y0 + stageH;
    const w0 = (values[i]! / scaleMax) * plot.width;
    const next = values[i + 1];
    const w1 = ((next !== undefined ? next : values[i]!) / scaleMax) * plot.width;
    const x0l = cx - w0 / 2;
    const x0r = cx + w0 / 2;
    const x1l = cx - w1 / 2;
    const x1r = cx + w1 / 2;
    const d = `M${fmtPx(x0l)} ${fmtPx(y0)} L${fmtPx(x0r)} ${fmtPx(y0)} L${fmtPx(x1r)} ${fmtPx(y1)} L${fmtPx(x1l)} ${fmtPx(y1)} Z`;
    lines.push(
      `    <path ${attrs({
        d,
        fill: style.color,
        "fill-opacity": style.opacity === 1 ? undefined : style.opacity,
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
        "data-stage": row.xLabel,
        "data-y": formatNumber(row.y),
      })}/>`,
    );
  }
  lines.push(`  </g>`);

  lines.push(
    `  <g ${attrs({
      fill: TYPE.value.fill,
      "font-size": TYPE.value.size,
      "font-weight": TYPE.value.weight,
    })}>`,
  );
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const cy = plot.top + (i + 0.5) * stageH;
    const text = `${row.xLabel} · ${formatNumber(row.y)}`;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.right + 8),
        y: fmtPx(cy),
        "text-anchor": "start",
        "dominant-baseline": "middle",
        "data-label": row.xLabel,
      })}>${escapeXml(text)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
