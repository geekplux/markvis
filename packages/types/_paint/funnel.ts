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

/**
 * Centered funnel. Each band runs from this stage's value to the next
 * stage's value, so the silhouette narrows in input order. Labels sit
 * to the right of the shape, on the figure surface.
 */
export function renderFunnel(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const values = rows.map((row) =>
    row.y === null ? null : Math.max(0, row.y),
  );
  const finiteVals = values.filter((value): value is number => value !== null);
  const maxY = Math.max(0, ...finiteVals);
  const scaleMax = maxY > 0 ? maxY : 1;

  const labelText = rows.map((row, i) => {
    const value = values[i];
    if (typeof value !== "number") {
      return row.xLabel;
    }
    return `${row.xLabel} · ${formatNumber(value)}`;
  });
  const labelW = Math.max(
    0,
    ...labelText.map((label) => textWidth(label, TYPE.value.size)),
  );
  const left = MARGIN.left;
  const right = Math.min(
    Math.max(MARGIN.right, labelW + 16),
    Math.max(MARGIN.right, SVG_WIDTH - left - 96),
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

  const widthOf = (value: number) => (value / scaleMax) * plot.width;

  lines.push(`  <g ${attrs({ "data-funnel": "1" })}>`);
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const value = values[i];
    const y0 = plot.top + i * stageH;
    const y1 = y0 + stageH;
    if (typeof value !== "number") {
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(cx),
          y: fmtPx(y0),
          width: 0,
          height: fmtPx(stageH),
          fill: "none",
          "data-stage": row.xLabel,
          "data-missing": "1",
        })}/>`,
      );
      continue;
    }
    const next = values[i + 1];
    const w0 = widthOf(value);
    const w1 = widthOf(typeof next === "number" ? next : value);
    const x0l = cx - w0 / 2;
    const x0r = cx + w0 / 2;
    const x1l = cx - w1 / 2;
    const x1r = cx + w1 / 2;
    const style = seriesStyle(i);
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
        "data-y": formatNumber(value),
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
    const full = labelText[i] ?? row.xLabel;
    const x = plot.right + 8;
    const room = Math.max(0, SVG_WIDTH - 8 - x);
    // Recomputing the margin from rounded coordinates can miss by a fraction
    // of a pixel. That is still the same label, not a truncation.
    const shown =
      textWidth(full, TYPE.value.size) <= room + 0.5
        ? full
        : truncateLabel(full, room, TYPE.value.size);
    const cy = plot.top + (i + 0.5) * stageH;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(x),
        y: fmtPx(cy),
        "text-anchor": "start",
        "dominant-baseline": "middle",
        "data-label": row.xLabel,
      })}><title>${escapeXml(full)}</title>${escapeXml(shown)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
