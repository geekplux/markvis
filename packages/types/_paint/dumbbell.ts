import type { ChartIR } from "@markvis/ir";
import { categoryNames, groupedValue, loadRows, seriesNames } from "./data.js";
import type { Painted } from "./layout.js";
import { seriesStyle } from "./palette.js";
import { drawRowAxes, layoutRows, niceDomain } from "./rows.js";
import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";
import {
  FONT_NUMERIC,
  INK,
  PAPER,
  STRUCTURE_OPACITY,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

const DOT_R = 6;

/** "+12", "-4", or "0": the change from the first series to the second. */
function deltaLabel(from: number, to: number): string {
  const delta = to - from;
  return delta > 0 ? `+${formatNumber(delta)}` : formatNumber(delta);
}

/**
 * Two values per category on one scale: the first series is a hollow dot,
 * the second a filled dot, joined by a rule. The change prints at the right.
 * Rows keep input order. A missing value leaves one dot and no rule.
 */
export function renderDumbbell(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const categories = categoryNames(rows);
  const [fromName = "", toName = ""] = seriesNames(rows);
  const pairs = categories.map((cat) => ({
    cat,
    from: groupedValue(rows, fromName, cat),
    to: groupedValue(rows, toName, cat),
  }));
  const values = pairs.flatMap((pair) =>
    [pair.from, pair.to].filter((v): v is number => v !== null),
  );
  const { domain, ticks } = niceDomain(values, false);
  const deltas = pairs.map((pair) =>
    pair.from !== null && pair.to !== null ? deltaLabel(pair.from, pair.to) : "",
  );
  const rightPad =
    Math.max(0, ...deltas.map((label) => textWidth(label, TYPE.value.size))) + 24;
  const fromStyle = seriesStyle(0);
  const toStyle = seriesStyle(1);
  const frame = layoutRows(chart, {
    categories,
    domain,
    ticks,
    rightPad,
    legendNames: [fromName, toName],
    legendColors: [fromStyle.color, toStyle.color],
    legendMarks: ["hollow", "filled"],
  });
  const { plot, rowH, xScale } = frame;
  const lines: string[] = [frame.title, ...drawRowAxes(frame, categories)];

  lines.push(`  <g ${attrs({ "data-dumbbell": "1" })}>`);
  const labels: string[] = [];
  pairs.forEach((pair, i) => {
    const cy = plot.top + (i + 0.5) * rowH;
    if (pair.from !== null && pair.to !== null) {
      lines.push(
        `    <line ${attrs({
          x1: fmtPx(xScale(pair.from)),
          x2: fmtPx(xScale(pair.to)),
          y1: fmtPx(cy),
          y2: fmtPx(cy),
          stroke: INK,
          "stroke-opacity": STRUCTURE_OPACITY,
          "stroke-width": 3,
          "stroke-linecap": "round",
          "data-x": pair.cat,
        })}/>`,
      );
      labels.push(
        `    <text ${attrs({
          x: fmtPx(plot.right + 12),
          y: fmtPx(cy),
          "dominant-baseline": "middle",
          "data-delta": pair.cat,
        })}>${escapeXml(deltas[i]!)}</text>`,
      );
    }
    if (pair.from !== null) {
      lines.push(
        `    <circle ${attrs({
          cx: fmtPx(xScale(pair.from)),
          cy: fmtPx(cy),
          r: DOT_R,
          fill: PAPER,
          stroke: fromStyle.color,
          "stroke-width": 2,
          "data-x": pair.cat,
          "data-series": fromName,
          "data-y": formatNumber(pair.from),
        })}/>`,
      );
    }
    if (pair.to !== null) {
      lines.push(
        `    <circle ${attrs({
          cx: fmtPx(xScale(pair.to)),
          cy: fmtPx(cy),
          r: DOT_R,
          fill: toStyle.color,
          "data-x": pair.cat,
          "data-series": toName,
          "data-y": formatNumber(pair.to),
        })}/>`,
      );
    }
  });
  lines.push(`  </g>`);
  if (labels.length > 0) {
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
  }
  return { lines, height: frame.height };
}
