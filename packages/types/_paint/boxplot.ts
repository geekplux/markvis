import type { ChartIR } from "@markvis/ir";
import { categoryNames, loadRows, seriesNames } from "./data.js";
import type { Painted } from "./layout.js";
import { seriesStyle } from "./palette.js";
import { drawRowAxes, layoutRows, niceDomain } from "./rows.js";
import { formatNumber } from "./scale.js";
import { boxStats, type BoxStats } from "./stats.js";
import { textWidth } from "./text.js";
import {
  BAR_RX,
  FONT,
  FONT_NUMERIC,
  INK,
  PAPER,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

/** Fewer observations than this draw their points, not a box. */
const MIN_BOX_N = 5;

/**
 * Distribution per category from raw rows, one horizontal row per category
 * (and one box per series inside it). Quartiles use type-7 interpolation;
 * whiskers reach the furthest points inside 1.5 × IQR and the rest are
 * hollow outlier dots. A group under five values shows its points and a
 * median tick instead of a box. The median prints at the right.
 */
export function renderBoxplot(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const categories = categoryNames(rows);
  const series = chart.series ? seriesNames(rows) : [rows[0]?.series ?? ""];
  const groups: (BoxStats | null)[][] = categories.map((cat) =>
    series.map((ser) =>
      boxStats(
        rows
          .filter((row) => row.xLabel === cat && (!chart.series || row.series === ser))
          .flatMap((row) => (row.y === null ? [] : [row.y])),
      ),
    ),
  );
  const values = rows.flatMap((row) => (row.y === null ? [] : [row.y]));
  const { domain, ticks } = niceDomain(values, false);
  const single = series.length === 1;
  const medianLabel = (box: BoxStats) => ({
    main: formatNumber(box.median),
    rest: ` · n=${box.n}`,
  });
  const rightPad = single
    ? Math.max(
        0,
        ...groups.flat().map((box) => {
          if (!box) return 0;
          const label = medianLabel(box);
          return textWidth(label.main + label.rest, TYPE.value.size, TYPE.value.weight, FONT_NUMERIC ?? FONT);
        }),
      ) + 24
    : 20;
  const styles = series.map((_, i) => seriesStyle(i));
  const frame = layoutRows(chart, {
    categories,
    domain,
    ticks,
    rightPad,
    legendNames: single ? [] : series,
    legendColors: styles.map((style) => style.color),
  });
  const { plot, rowH, xScale } = frame;
  const lines: string[] = [frame.title, ...drawRowAxes(frame, categories)];
  const gap = 4;
  const band = rowH - 12;
  const boxH = Math.min(22, (band - gap * (series.length - 1)) / series.length);
  const labels: string[] = [];

  lines.push(`  <g ${attrs({ "data-boxplot": "1" })}>`);
  categories.forEach((cat, ci) => {
    const rowTop = plot.top + ci * rowH;
    const stackH = boxH * series.length + gap * (series.length - 1);
    series.forEach((ser, si) => {
      const box = groups[ci]![si];
      if (!box) {
        return;
      }
      const color = styles[si]!.color;
      const cy = rowTop + (rowH - stackH) / 2 + si * (boxH + gap) + boxH / 2;
      const top = cy - boxH / 2;
      const data = {
        "data-x": cat,
        "data-series": chart.series ? ser : undefined,
        "data-n": box.n,
        "data-median": formatNumber(box.median),
      };
      if (box.n < MIN_BOX_N) {
        const points = rows.filter(
          (row) =>
            row.xLabel === cat &&
            (!chart.series || row.series === ser) &&
            row.y !== null,
        );
        for (const row of points) {
          lines.push(
            `    <circle ${attrs({
              cx: fmtPx(xScale(row.y!)),
              cy: fmtPx(cy),
              r: 3.5,
              fill: color,
              "fill-opacity": 0.75,
              "data-x": cat,
              "data-y": formatNumber(row.y!),
              "data-point": "1",
            })}/>`,
          );
        }
        lines.push(medianTick(xScale(box.median), top, boxH, data));
      } else {
        const lo = xScale(box.whiskerLo);
        const hi = xScale(box.whiskerHi);
        const q1 = xScale(box.q1);
        const q3 = xScale(box.q3);
        const cap = boxH * 0.25;
        lines.push(
          `    <path ${attrs({
            d: `M${fmtPx(lo)} ${fmtPx(cy)} L${fmtPx(q1)} ${fmtPx(cy)} M${fmtPx(q3)} ${fmtPx(cy)} L${fmtPx(hi)} ${fmtPx(cy)} M${fmtPx(lo)} ${fmtPx(cy - cap)} L${fmtPx(lo)} ${fmtPx(cy + cap)} M${fmtPx(hi)} ${fmtPx(cy - cap)} L${fmtPx(hi)} ${fmtPx(cy + cap)}`,
            fill: "none",
            stroke: color,
            "stroke-width": 1.5,
            "data-whiskers": cat,
          })}/>`,
          `    <rect ${attrs({
            x: fmtPx(q1),
            y: fmtPx(top),
            width: fmtPx(Math.max(q3 - q1, 1)),
            height: fmtPx(boxH),
            rx: Math.min(BAR_RX, 4) || undefined,
            fill: color,
            "fill-opacity": 0.28,
            stroke: color,
            "stroke-width": 1.5,
            ...data,
            "data-q1": formatNumber(box.q1),
            "data-q3": formatNumber(box.q3),
          })}/>`,
          medianTick(xScale(box.median), top, boxH, data),
        );
        for (const value of box.outliers) {
          lines.push(
            `    <circle ${attrs({
              cx: fmtPx(xScale(value)),
              cy: fmtPx(cy),
              r: 3,
              fill: PAPER,
              stroke: color,
              "stroke-width": 1.5,
              "data-x": cat,
              "data-y": formatNumber(value),
              "data-outlier": "1",
            })}/>`,
          );
        }
      }
      if (single) {
        const label = medianLabel(box);
        labels.push(
          `    <text ${attrs({
            x: fmtPx(plot.right + 12),
            y: fmtPx(cy),
            "dominant-baseline": "middle",
            "data-value-label": cat,
          })}>${escapeXml(label.main)}<tspan fill="${TYPE.unit.fill}" font-weight="${TYPE.unit.weight}">${escapeXml(label.rest)}</tspan></text>`,
        );
      }
    });
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

function medianTick(
  x: number,
  top: number,
  h: number,
  data: Record<string, string | number | undefined>,
): string {
  return `    <line ${attrs({
    x1: fmtPx(x),
    x2: fmtPx(x),
    y1: fmtPx(top - 2),
    y2: fmtPx(top + h + 2),
    stroke: INK,
    "stroke-width": 2.5,
    ...data,
    "data-median-tick": "1",
  })}/>`;
}
