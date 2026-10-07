import { columnValues, type ChartIR } from "@markvis/ir";
import { classifyNumeric, loadRows } from "./data.js";
import type { Painted } from "./layout.js";
import { seriesStyle } from "./palette.js";
import { drawRowAxes, layoutRows, niceDomain, roundedEndPath } from "./rows.js";
import { formatNumber, niceTicks } from "./scale.js";
import { textWidth } from "./text.js";
import {
  BAR_RX,
  FONT,
  FONT_NUMERIC,
  INK,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

/** The track is a quiet band behind the bar, lighter than any grid. */
const TRACK_OPACITY = 0.07;

type BulletRow = {
  label: string;
  actual: number;
  target: number | null;
};

function clamp(value: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, value));
}

/**
 * Actual against target, one row per label on one shared scale. A quiet
 * track shows the scale, the bar runs from zero to the actual value, and
 * an ink rule marks the target. `min` / `max` fix the scale; a value past
 * them is drawn to the edge, flagged, and still labeled with its number.
 */
export function renderBullet(chart: ChartIR, _id: string): Painted {
  const targets = chart.target ? columnValues(chart.table, chart.target) : [];
  const rows: BulletRow[] = loadRows(chart).flatMap((row, i) => {
    if (row.y === null) {
      return [];
    }
    const cell = classifyNumeric(targets[i] ?? "");
    return [
      {
        label: row.xLabel,
        actual: row.y,
        target: cell.kind === "number" ? cell.value : null,
      },
    ];
  });
  const categories = rows.map((row) => row.label);
  const values = rows.flatMap((row) =>
    row.target === null ? [row.actual] : [row.actual, row.target],
  );
  const fitted = niceDomain(values, true);
  const domain: [number, number] = [
    chart.min ?? fitted.domain[0],
    chart.max ?? fitted.domain[1],
  ];
  const ticks =
    chart.min === undefined && chart.max === undefined
      ? fitted.ticks
      : niceTicks(domain[0], domain[1]);

  const labelOf = (row: BulletRow) =>
    row.target === null
      ? { main: formatNumber(row.actual), rest: "" }
      : { main: formatNumber(row.actual), rest: ` / ${formatNumber(row.target)}` };
  const rightPad =
    Math.max(
      0,
      ...rows.map((row) => {
        const label = labelOf(row);
        return textWidth(label.main + label.rest, TYPE.value.size, TYPE.value.weight, FONT_NUMERIC ?? FONT);
      }),
    ) + 24;
  const barColor = seriesStyle(0).color;
  const hasTarget = rows.some((row) => row.target !== null);
  const frame = layoutRows(chart, {
    categories,
    domain,
    ticks,
    rightPad,
    legendNames: hasTarget ? [chart.y ?? "actual", chart.target ?? "target"] : [],
    legendColors: [barColor, INK],
    legendMarks: hasTarget ? ["filled", "rule"] : undefined,
  });
  const { plot, rowH, xScale } = frame;
  const lines: string[] = [frame.title, ...drawRowAxes(frame, categories)];
  const base = clamp(0, domain[0], domain[1]);
  const trackH = Math.min(26, rowH - 10);
  const barH = Math.max(6, Math.round(trackH * 0.42));
  const labels: string[] = [];

  lines.push(`  <g ${attrs({ "data-bullet": "1" })}>`);
  rows.forEach((row, i) => {
    const cy = plot.top + (i + 0.5) * rowH;
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(plot.left),
        y: fmtPx(cy - trackH / 2),
        width: fmtPx(plot.width),
        height: fmtPx(trackH),
        fill: INK,
        "fill-opacity": TRACK_OPACITY,
        "data-track": row.label,
      })}/>`,
    );
    const shown = clamp(row.actual, domain[0], domain[1]);
    const x0 = xScale(base);
    const x1 = xScale(shown);
    const w = Math.abs(x1 - x0);
    const clipped = shown !== row.actual;
    if (w > 0) {
      lines.push(
        `    <path ${attrs({
          d: roundedEndPath(
            Math.min(x0, x1),
            cy - barH / 2,
            w,
            barH,
            Math.min(BAR_RX, barH / 2, w),
            x1 >= x0,
          ),
          fill: barColor,
          "data-x": row.label,
          "data-y": formatNumber(row.actual),
          "data-clipped": clipped ? "1" : undefined,
        })}/>`,
      );
    }
    if (row.target !== null) {
      const tx = xScale(clamp(row.target, domain[0], domain[1]));
      lines.push(
        `    <line ${attrs({
          x1: fmtPx(tx),
          x2: fmtPx(tx),
          y1: fmtPx(cy - trackH / 2 + 2),
          y2: fmtPx(cy + trackH / 2 - 2),
          stroke: INK,
          "stroke-width": 2.5,
          "data-target": formatNumber(row.target),
          "data-clipped":
            row.target < domain[0] || row.target > domain[1] ? "1" : undefined,
        })}/>`,
      );
    }
    const label = labelOf(row);
    const rest =
      label.rest === ""
        ? ""
        : `<tspan fill="${TYPE.unit.fill}" font-weight="${TYPE.unit.weight}">${escapeXml(label.rest)}</tspan>`;
    labels.push(
      `    <text ${attrs({
        x: fmtPx(plot.right + 12),
        y: fmtPx(cy),
        "dominant-baseline": "middle",
        "data-value-label": row.label,
      })}>${escapeXml(label.main)}${rest}</text>`,
    );
  });
  lines.push(`  </g>`);
  lines.push(
    `  <g ${attrs({
      fill: TYPE.value.fill,
      "font-size": TYPE.value.size,
      "font-family": FONT_NUMERIC,
      "font-weight": TYPE.value.weight,
    })}>`,
    ...labels,
    `  </g>`,
  );
  return { lines, height: frame.height };
}
