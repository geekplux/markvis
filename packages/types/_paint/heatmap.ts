import type { ChartIR } from "@markvis/ir";
import {
  categoryNames,
  groupedValue,
  loadRows,
  seriesNames,
} from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
import {
  categoryBottomMargin,
  categoryLayout,
  fitFrameHeight,
  tickLeftMargin,
  titleBlockTop,
  SVG_WIDTH,
  type Painted,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import { formatNumber } from "./scale.js";
import {
  BAR_RX,
  INK,
  LABEL_ROTATE_DEG,
  MARGIN,
  PLOT_BG,
  PLOT_BORDER,
  PLOT_BORDER_WIDTH,
  STRUCTURE_OPACITY,
  TICK_TEXT_GAP,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

function cellOpacity(value: number, ymin: number, ymax: number): number {
  if (ymax === ymin) {
    return 0.85;
  }
  const t = (value - ymin) / (ymax - ymin);
  return Math.max(0, Math.min(1, t));
}

export function renderHeatmap(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const xCats = categoryNames(rows);
  const yCats = seriesNames(rows);
  let ymin = Infinity;
  let ymax = -Infinity;
  for (const row of rows) {
    if (row.y < ymin) {
      ymin = row.y;
    }
    if (row.y > ymax) {
      ymax = row.y;
    }
  }
  if (!Number.isFinite(ymin)) {
    ymin = 0;
    ymax = 1;
  }

  const left = tickLeftMargin(yCats);
  const right = MARGIN.right;
  const top = titleBlockTop(0);
  const draftW = Math.max(SVG_WIDTH - left - right, 1);
  const catLay =
    xCats.length > 0
      ? categoryLayout(xCats, draftW / Math.max(xCats.length, 1))
      : { rotate: false, show: [] as boolean[] };
  const bottom = categoryBottomMargin(xCats, catLay.rotate);
  const height = fitFrameHeight(top, bottom);
  const plot = {
    left,
    right: SVG_WIDTH - right,
    top,
    bottom: height - bottom,
    width: SVG_WIDTH - left - right,
    height: height - top - bottom,
  };

  const fill = seriesStyle(0);
  const nX = Math.max(xCats.length, 1);
  const nY = Math.max(yCats.length, 1);
  const cellW = plot.width / nX;
  const cellH = plot.height / nY;

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

  lines.push(`  <g ${attrs({ "data-heatmap": "1" })}>`);
  for (let row = 0; row < yCats.length; row++) {
    const series = yCats[row]!;
    for (let col = 0; col < xCats.length; col++) {
      const cat = xCats[col]!;
      const value = groupedValue(rows, series, cat);
      const x = plot.left + col * cellW;
      const y = plot.top + row * cellH;
      const opacity = cellOpacity(value, ymin, ymax) * fill.opacity;
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(x),
          y: fmtPx(y),
          width: fmtPx(Math.max(cellW, 0)),
          height: fmtPx(Math.max(cellH, 0)),
          fill: fill.color,
          "fill-opacity": opacity === 1 ? undefined : fmtPx(opacity),
          stroke: INK,
          "stroke-opacity": STRUCTURE_OPACITY,
          "stroke-width": 1,
          rx: BAR_RX > 0 && cellW > 8 && cellH > 8 ? 1 : undefined,
          "data-x": cat,
          "data-series": series,
          "data-y": formatNumber(value),
        })}/>`,
      );
    }
  }
  lines.push(`  </g>`);

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

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  for (let i = 0; i < yCats.length; i++) {
    const label = yCats[i]!;
    const cy = plot.top + (i + 0.5) * cellH;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.left - TICK_TEXT_GAP),
        y: fmtPx(cy),
        "text-anchor": "end",
        "dominant-baseline": "middle",
        "data-series-label": label,
      })}>${escapeXml(label)}</text>`,
    );
  }
  for (let i = 0; i < xCats.length; i++) {
    if (catLay.show[i] === false) {
      continue;
    }
    const label = xCats[i]!;
    const cx = plot.left + (i + 0.5) * cellW;
    if (catLay.rotate) {
      const tx = fmtPx(cx);
      const ty = fmtPx(plot.bottom + 8);
      lines.push(
        `    <text ${attrs({
          x: tx,
          y: ty,
          "text-anchor": "end",
          "dominant-baseline": "middle",
          transform: `rotate(${LABEL_ROTATE_DEG} ${tx} ${ty})`,
          "data-full-label": label,
        })}>${escapeXml(label)}</text>`,
      );
    } else {
      lines.push(
        `    <text ${attrs({
          x: fmtPx(cx),
          y: fmtPx(plot.bottom + TYPE.tick.size),
          "text-anchor": "middle",
          "data-full-label": label,
        })}>${escapeXml(label)}</text>`,
      );
    }
  }
  lines.push(`  </g>`);

  return { lines, height };
}
