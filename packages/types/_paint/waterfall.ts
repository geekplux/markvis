import type { ChartIR } from "@markvis/ir";
import { loadRows } from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
import {
  formatTickLabel,
  layoutFrame,
  type Painted,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import {
  formatNumber,
  niceTicks,
  scaleLinear,
} from "./scale.js";
import {
  BAR_GAP_FEW,
  BAR_GAP_MANY,
  BAR_MAX_WIDTH,
  BAR_MAX_WIDTH_N,
  BAR_RX,
  HAIRLINE_OPACITY,
  INK,
  LABEL_ROTATE_DEG,
  PLOT_BG,
  PLOT_BORDER,
  PLOT_BORDER_WIDTH,
  STRUCTURE_OPACITY,
  TICK_TEXT_GAP,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

export function renderWaterfall(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const starts: number[] = [];
  const ends: number[] = [];
  let running = 0;
  for (const row of rows) {
    starts.push(running);
    running += row.y;
    ends.push(running);
  }
  const yMin = Math.min(0, ...starts, ...ends);
  const yMax = Math.max(0, ...starts, ...ends);
  const yTicksRaw = niceTicks(yMin, yMax);
  const yTickLabels = yTicksRaw.map((n) => formatTickLabel(n));
  const labels = rows.map((row) => row.xLabel);
  const frame = layoutFrame({
    yTickLabels,
    categoryLabels: labels,
    legendHeight: 0,
  });
  const { plot, height, rotateX, show } = frame;
  const yScale = scaleLinear(
    [yTicksRaw[0] ?? yMin, yTicksRaw[yTicksRaw.length - 1] ?? yMax],
    [plot.bottom, plot.top],
  );
  const n = Math.max(rows.length, 1);
  const catStep = plot.width / n;
  const gapRatio = n <= 6 ? BAR_GAP_FEW : BAR_GAP_MANY;
  let barW = catStep * (1 - gapRatio);
  if (n <= BAR_MAX_WIDTH_N) {
    barW = Math.min(barW, BAR_MAX_WIDTH);
  }
  barW = Math.max(barW, 1);
  const pos = seriesStyle(0);
  const neg = seriesStyle(1);

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

  const interior = yTicksRaw.filter((tick) => {
    const py = yScale(tick);
    return Math.abs(py - plot.bottom) > 0.5 && Math.abs(py - plot.top) > 0.5;
  });
  if (interior.length > 0) {
    lines.push(
      `  <g ${attrs({
        fill: "none",
        stroke: INK,
        "stroke-opacity": HAIRLINE_OPACITY,
        "stroke-width": 1,
      })}>`,
    );
    for (const tick of interior) {
      const py = yScale(tick);
      lines.push(
        `    <line ${attrs({
          x1: fmtPx(plot.left),
          x2: fmtPx(plot.right),
          y1: fmtPx(py),
          y2: fmtPx(py),
        })}/>`,
      );
    }
    lines.push(`  </g>`);
  }

  lines.push(
    `  <path ${attrs({
      d: `M${fmtPx(plot.left)} ${fmtPx(plot.bottom)} L${fmtPx(plot.right)} ${fmtPx(plot.bottom)}`,
      fill: "none",
      stroke: INK,
      "stroke-opacity": STRUCTURE_OPACITY,
      "stroke-width": 1,
    })}/>`,
  );

  const zeroY = yScale(0);
  if (
    Math.abs(zeroY - plot.bottom) > 0.5 &&
    Math.abs(zeroY - plot.top) > 0.5 &&
    zeroY >= plot.top &&
    zeroY <= plot.bottom
  ) {
    lines.push(
      `  <line ${attrs({
        x1: fmtPx(plot.left),
        x2: fmtPx(plot.right),
        y1: fmtPx(zeroY),
        y2: fmtPx(zeroY),
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
        "data-zero": "1",
      })}/>`,
    );
  }

  lines.push(`  <g ${attrs({ "data-waterfall": "1" })}>`);
  const barLeft: number[] = [];
  const barRight: number[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const cx = plot.left + (i + 0.5) * catStep;
    const x = cx - barW / 2;
    barLeft.push(x);
    barRight.push(x + barW);
    const y0 = yScale(starts[i]!);
    const y1 = yScale(ends[i]!);
    const top = Math.min(y0, y1);
    const h = Math.max(Math.abs(y1 - y0), 1);
    const style = row.y < 0 ? neg : pos;
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(x),
        y: fmtPx(top),
        width: fmtPx(barW),
        height: fmtPx(h),
        fill: style.color,
        "fill-opacity": style.opacity === 1 ? undefined : style.opacity,
        rx: BAR_RX,
        "data-step": row.xLabel,
        "data-y": formatNumber(row.y),
        "data-baseline": formatNumber(starts[i]!),
      })}/>`,
    );
  }
  lines.push(`  </g>`);

  if (rows.length > 1) {
    lines.push(
      `  <g ${attrs({
        fill: "none",
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
        "data-waterfall-connectors": "1",
      })}>`,
    );
    for (let i = 0; i < rows.length - 1; i++) {
      const y = yScale(ends[i]!);
      lines.push(
        `    <line ${attrs({
          x1: fmtPx(barRight[i]!),
          x2: fmtPx(barLeft[i + 1]!),
          y1: fmtPx(y),
          y2: fmtPx(y),
        })}/>`,
      );
    }
    lines.push(`  </g>`);
  }

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  for (const tick of yTicksRaw) {
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.left - TICK_TEXT_GAP),
        y: fmtPx(yScale(tick)),
        "text-anchor": "end",
        "dominant-baseline": "middle",
      })}>${escapeXml(formatTickLabel(tick))}</text>`,
    );
  }
  for (let i = 0; i < labels.length; i++) {
    if (show[i] === false) {
      continue;
    }
    const label = labels[i]!;
    const cx = plot.left + (i + 0.5) * catStep;
    if (rotateX) {
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
