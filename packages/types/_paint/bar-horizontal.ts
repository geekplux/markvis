import type { ChartIR } from "@markvis/ir";
import {
  categoryNames,
  finiteValues,
  groupedValue,
  loadRows,
  seriesNames,
} from "./data.js";
import { drawTitle, reserveTitle, visibleTitle } from "./figure.js";
import { layoutLegend, titleBlockTop, type Painted } from "./layout.js";
import { seriesStyle } from "./palette.js";
import { formatNumber, labelTicks, niceTicks, scaleLinear, yExtent } from "./scale.js";
import { textWidth, wrapText } from "./text.js";
import {
  HAIRLINE_OPACITY,
  INK,
  MARGIN,
  PLOT_BG,
  STRUCTURE_OPACITY,
  SVG_WIDTH,
  TICK_TEXT_GAP,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

/**
 * Horizontal bars. Categories stay in input order, top to bottom.
 * The value axis keeps a zero baseline. Grouped, stacked, and percent
 * all use the same orientation.
 */
export function renderHorizontalBar(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const categories = categoryNames(rows);
  const series = seriesNames(rows);
  const layout =
    chart.layout === "stacked" || chart.layout === "percent"
      ? chart.layout
      : "grouped";
  const stacking = layout !== "grouped";
  const matrix = series.map((ser) =>
    categories.map((cat) => {
      const value = groupedValue(rows, ser, cat);
      if (value === null || layout !== "percent") {
        return value;
      }
      return value;
    }),
  );
  if (layout === "percent") {
    for (let ci = 0; ci < categories.length; ci++) {
      let total = 0;
      for (let si = 0; si < series.length; si++) {
        const value = matrix[si]?.[ci];
        if (typeof value === "number") {
          total += value;
        }
      }
      for (let si = 0; si < series.length; si++) {
        const value = matrix[si]?.[ci];
        const row = matrix[si];
        if (!row) {
          continue;
        }
        row[ci] = typeof value !== "number" ? null : total === 0 ? 0 : (value / total) * 100;
      }
    }
  }

  const extentValues =
    layout === "percent"
      ? [0, 100]
      : finiteValues(matrix.flat());
  const [lo, hi] = yExtent(extentValues, true);
  const ticks = niceTicks(lo, hi);
  const tickLabels = labelTicks(ticks);
  const xMin = ticks[0] ?? lo;
  const xMax = ticks[ticks.length - 1] ?? hi;

  const labelBudget = Math.min(240, Math.max(96, SVG_WIDTH * 0.4));
  const wrapped = categories.map((label) =>
    wrapText(label, TYPE.tick.size, labelBudget, 3),
  );
  const labelW = Math.max(
    48,
    ...wrapped.map((item) =>
      Math.max(...item.lines.map((line) => textWidth(line, TYPE.tick.size)), 0),
    ),
  );
  const nS = Math.max(series.length, 1);
  const barH = stacking ? 18 : 14;
  const rowH = Math.max(
    32,
    (stacking ? barH : barH * nS + 4 * Math.max(nS - 1, 0)) + 12,
    ...wrapped.map((item) => item.lines.length * (TYPE.tick.size + 3) + 10),
  );
  const styles = series.map((_, i) => seriesStyle(i));
  const showLegend = series.length > 1;
  const legend = showLegend
    ? layoutLegend(
        series,
        styles.map((s) => s.color),
        styles.map((s) => s.opacity),
        MARGIN.left,
        0,
        SVG_WIDTH - MARGIN.left - MARGIN.right,
      )
    : { items: [], height: 0 };

  const left = Math.max(MARGIN.left, labelW + 16);
  const right = Math.max(MARGIN.right, 72);
  // Title uses the full figure width, above the plot, so a long heading
  // does not wrap into the category gutter and cross the first bar.
  const titleX = MARGIN.left;
  reserveTitle(visibleTitle(chart), titleX, chart.unit);
  const plotTop = titleBlockTop(0);
  const title = drawTitle(visibleTitle(chart), titleX, chart.unit);
  const plotBottomPad = TYPE.tick.size + 28 + (showLegend ? legend.height + 10 : 0);
  const height = Math.max(
    160,
    plotTop + Math.max(categories.length, 1) * rowH + plotBottomPad,
  );
  const plot = {
    left,
    right: SVG_WIDTH - right,
    top: plotTop,
    bottom: height - plotBottomPad,
    width: SVG_WIDTH - left - right,
    height: height - plotTop - plotBottomPad,
  };
  const xScale = scaleLinear([xMin, xMax], [plot.left, plot.right]);
  const lines: string[] = [title];

  if (showLegend) {
    const placed = layoutLegend(
      series,
      styles.map((s) => s.color),
      styles.map((s) => s.opacity),
      plot.left,
      plot.bottom + TYPE.tick.size + 18,
      plot.width,
    );
    lines.push(
      `  <g ${attrs({
        "font-size": TYPE.legend.size,
        "font-weight": TYPE.legend.weight,
        fill: TYPE.legend.fill,
        "data-legend": "1",
      })}>`,
    );
    for (const item of placed.items) {
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(item.x),
          y: fmtPx(item.y - 8),
          width: 10,
          height: 10,
          fill: item.color,
          rx: 1,
        })}/>`,
      );
      lines.push(
        `    <text ${attrs({
          x: fmtPx(item.x + 14),
          y: fmtPx(item.y),
          "dominant-baseline": "middle",
        })}>${escapeXml(item.name)}</text>`,
      );
    }
    lines.push(`  </g>`);
  }

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

  lines.push(
    `  <g ${attrs({
      fill: "none",
      stroke: INK,
      "stroke-opacity": HAIRLINE_OPACITY,
      "stroke-width": 1,
    })}>`,
  );
  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i]!;
    if (tick === 0) {
      continue;
    }
    const px = xScale(tick);
    lines.push(
      `    <line ${attrs({
        x1: fmtPx(px),
        x2: fmtPx(px),
        y1: fmtPx(plot.top),
        y2: fmtPx(plot.bottom),
      })}/>`,
    );
  }
  lines.push(`  </g>`);

  const zeroX = xScale(0);
  lines.push(
    `  <line ${attrs({
      x1: fmtPx(zeroX),
      x2: fmtPx(zeroX),
      y1: fmtPx(plot.top),
      y2: fmtPx(plot.bottom),
      stroke: INK,
      "stroke-opacity": STRUCTURE_OPACITY,
      "stroke-width": 1,
      "data-baseline": "0",
    })}/>`,
  );

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  for (let i = 0; i < categories.length; i++) {
    const full = categories[i]!;
    const item = wrapped[i]!;
    const cy = plot.top + (i + 0.5) * rowH;
    const lineH = TYPE.tick.size + 3;
    const startY = cy - ((item.lines.length - 1) * lineH) / 2;
    const body = item.lines
      .map((line, li) => {
        const dy = li === 0 ? 0 : lineH;
        return `<tspan x="${fmtPx(plot.left - TICK_TEXT_GAP)}" dy="${dy}">${escapeXml(line)}</tspan>`;
      })
      .join("");
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.left - TICK_TEXT_GAP),
        y: fmtPx(startY),
        "text-anchor": "end",
        "dominant-baseline": "middle",
        "data-full-label": full,
      })}><title>${escapeXml(full)}</title>${body}</text>`,
    );
  }
  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i]!;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(xScale(tick)),
        y: fmtPx(plot.bottom + TYPE.tick.size + 4),
        "text-anchor": "middle",
      })}>${escapeXml(tickLabels[i] ?? formatNumber(tick))}</text>`,
    );
  }
  lines.push(`  </g>`);

  lines.push(`  <g ${attrs({ "data-orient": "horizontal" })}>`);
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]!;
    const rowTop = plot.top + ci * rowH;
    if (!stacking) {
      const band = rowH - 10;
      const gap = nS > 1 ? 3 : 0;
      const h = Math.max(4, (band - gap * (nS - 1)) / nS);
      const start = rowTop + (rowH - (h * nS + gap * (nS - 1))) / 2;
      for (let si = 0; si < series.length; si++) {
        const val = matrix[si]?.[ci];
        const y = start + si * (h + gap);
        const ser = series[si] ?? "";
        if (typeof val !== "number") {
          lines.push(
            `    <rect ${attrs({
              x: fmtPx(zeroX),
              y: fmtPx(y),
              width: 0,
              height: fmtPx(h),
              fill: "none",
              "data-x": cat,
              "data-series": ser,
              "data-missing": "1",
            })}/>`,
          );
          continue;
        }
        paintBar(lines, xScale, zeroX, y, h, val, styles[si]?.color ?? "#3B82F6", cat, ser);
      }
      continue;
    }
    const h = Math.min(22, rowH - 12);
    const y = rowTop + (rowH - h) / 2;
    let cursor = 0;
    for (let si = 0; si < series.length; si++) {
      const val = matrix[si]?.[ci];
      const ser = series[si] ?? "";
      if (typeof val !== "number") {
        lines.push(
          `    <rect ${attrs({
            x: fmtPx(xScale(cursor)),
            y: fmtPx(y),
            width: 0,
            height: fmtPx(h),
            fill: "none",
            "data-x": cat,
            "data-series": ser,
            "data-missing": "1",
            "data-layout": layout,
          })}/>`,
        );
        continue;
      }
      const x0 = xScale(cursor);
      const x1 = xScale(cursor + val);
      const x = Math.min(x0, x1);
      const w = Math.abs(x1 - x0);
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(x),
          y: fmtPx(y),
          width: fmtPx(w),
          height: fmtPx(h),
          fill: styles[si]?.color ?? "#3B82F6",
          "data-x": cat,
          "data-series": ser,
          "data-y": formatNumber(val),
          "data-layout": layout,
        })}/>`,
      );
      cursor += val;
    }
    if (series.length > 0) {
      const label = formatNumber(cursor);
      lines.push(
        `    <text ${attrs({
          x: fmtPx(xScale(cursor) + 6),
          y: fmtPx(y + h / 2),
          "font-size": TYPE.value.size,
          "font-weight": TYPE.value.weight,
          fill: TYPE.value.fill,
          "dominant-baseline": "middle",
          "data-value-label": cat,
        })}>${escapeXml(label)}</text>`,
      );
    }
  }
  lines.push(`  </g>`);

  return { lines, height };
}

function paintBar(
  lines: string[],
  xScale: (value: number) => number,
  zeroX: number,
  y: number,
  h: number,
  val: number,
  color: string,
  cat: string,
  series: string,
): void {
  if (val === 0) {
    lines.push(
      `    <line ${attrs({
        x1: fmtPx(zeroX),
        x2: fmtPx(zeroX),
        y1: fmtPx(y),
        y2: fmtPx(y + h),
        stroke: color,
        "stroke-width": 2,
        "data-x": cat,
        "data-series": series,
        "data-y": "0",
      })}/>`,
    );
    lines.push(
      `    <text ${attrs({
        x: fmtPx(zeroX + 6),
        y: fmtPx(y + h / 2),
        "font-size": TYPE.value.size,
        "font-weight": TYPE.value.weight,
        fill: TYPE.value.fill,
        "dominant-baseline": "middle",
        "data-value-label": cat,
      })}>0</text>`,
    );
    return;
  }
  const x1 = xScale(val);
  const x = Math.min(zeroX, x1);
  const w = Math.abs(x1 - zeroX);
  lines.push(
    `    <rect ${attrs({
      x: fmtPx(x),
      y: fmtPx(y),
      width: fmtPx(Math.max(w, 0)),
      height: fmtPx(h),
      fill: color,
      "data-x": cat,
      "data-series": series,
      "data-y": formatNumber(val),
    })}/>`,
  );
  const labelX = val >= 0 ? x1 + 6 : x1 - 6;
  lines.push(
    `    <text ${attrs({
      x: fmtPx(labelX),
      y: fmtPx(y + h / 2),
      "text-anchor": val >= 0 ? "start" : "end",
      "font-size": TYPE.value.size,
      "font-weight": TYPE.value.weight,
      fill: TYPE.value.fill,
      "dominant-baseline": "middle",
      "data-value-label": cat,
    })}>${escapeXml(formatNumber(val))}</text>`,
  );
}
