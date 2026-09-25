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
import { textWidth, truncateLabel } from "./text.js";
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
  const values = rows.map((row) => (row.y === null ? null : Math.max(0, row.y)));
  const finiteVals = values.filter((value): value is number => value !== null);
  const maxY = Math.max(0, ...finiteVals);
  const scaleMax = maxY > 0 ? maxY : 1;

  const stageText = rows.map((row, i) => {
    const value = values[i];
    if (typeof value !== "number" || row.y === null) {
      return row.xLabel;
    }
    const prev = i > 0 ? values[i - 1] : null;
    const head = `${row.xLabel} · ${formatNumber(value)}`;
    if (prev === null || prev === undefined) {
      return head;
    }
    const conversion =
      prev > 0
        ? ` · ${formatNumber(Math.round((value / prev) * 1000) / 10)}% of previous`
        : "";
    return `${head}${conversion} · drop ${formatNumber(prev - value)}`;
  });
  const labelW = Math.max(
    0,
    ...stageText.map((label) => textWidth(label, TYPE.value.size)),
  );
  const left = MARGIN.left;
  const right = Math.min(
    Math.max(MARGIN.right, labelW + 16),
    Math.max(MARGIN.right, SVG_WIDTH - left - 80),
  );
  reserveTitle(visibleTitle(chart), left, chart.unit);
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
    const value = values[i];
    const style = seriesStyle(0);
    const y0 = plot.top + i * stageH + 4;
    const barH = Math.max(stageH - 8, 4);
    if (typeof value !== "number" || row.y === null) {
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(plot.left),
          y: fmtPx(y0),
          width: 0,
          height: fmtPx(barH),
          fill: "none",
          "data-stage": row.xLabel,
          "data-missing": "1",
        })}/>`,
      );
      continue;
    }
    const w = (value / scaleMax) * plot.width;
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(plot.left),
        y: fmtPx(y0),
        width: fmtPx(w),
        height: fmtPx(barH),
        fill: style.color,
        "data-stage": row.xLabel,
        "data-y": formatNumber(value),
      })}/>`,
    );
    const label = stageText[i] ?? row.xLabel;
    const x = plot.left + w + 8;
    const room = Math.max(0, SVG_WIDTH - 8 - x);
    const shown =
      textWidth(label, TYPE.value.size) <= room
        ? label
        : truncateLabel(label, room, TYPE.value.size);
    lines.push(
      `    <text ${attrs({
        x: fmtPx(x),
        y: fmtPx(y0 + barH / 2),
        "dominant-baseline": "middle",
        "font-size": TYPE.value.size,
        "font-weight": TYPE.value.weight,
        fill: TYPE.value.fill,
        "data-label": row.xLabel,
      })}><title>${escapeXml(label)}</title>${escapeXml(shown)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
