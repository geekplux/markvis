import type { ChartIR } from "@markvis/ir";
import { loadRows, seriesNames, uniqueInOrder } from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
import {
  fitFrameHeight,
  layoutLegend,
  titleBlockTop,
  SVG_WIDTH,
  type Painted,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import { textWidth } from "./text.js";
import {
  AREA_OPACITY,
  INK,
  LEGEND_BELOW,
  MARGIN,
  PIE_RADIUS_RATIO,
  PLOT_BG,
  PLOT_BORDER,
  PLOT_BORDER_WIDTH,
  STRUCTURE_OPACITY,
  TITLE_BASELINE,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

function spokePoint(
  cx: number,
  cy: number,
  r: number,
  i: number,
  n: number,
): { x: number; y: number } {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(n, 1);
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

export function renderRadar(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const spokes = uniqueInOrder(rows.map((row) => row.xLabel));
  const names = seriesNames(rows);
  const maxY = Math.max(0, ...rows.map((row) => row.y));
  const scaleMax = maxY > 0 ? maxY : 1;
  const n = Math.max(spokes.length, 1);

  const styles = names.map((_, i) => seriesStyle(i));
  const useLegend = names.length > 1;
  const legendDraft = useLegend
    ? layoutLegend(
        names,
        styles.map((s) => s.color),
        styles.map((s) => s.opacity),
        48,
        TITLE_BASELINE + 18,
        SVG_WIDTH - 96,
      )
    : { items: [] as ReturnType<typeof layoutLegend>["items"], height: 0 };

  const labelPad = Math.max(
    36,
    ...spokes.map((s) => textWidth(s, TYPE.tick.size) / 2 + 12),
  );
  let left = Math.max(MARGIN.left, labelPad);
  let right = Math.max(MARGIN.right, labelPad);
  let top = titleBlockTop(legendDraft.height);
  let bottom = MARGIN.right + 18;
  if (LEGEND_BELOW && legendDraft.height > 0) {
    bottom += legendDraft.height + 8;
  }
  let height = fitFrameHeight(top, bottom);
  const plot = () => ({
    left,
    right: SVG_WIDTH - right,
    top,
    bottom: height - bottom,
    width: SVG_WIDTH - left - right,
    height: height - top - bottom,
  });
  let box = plot();
  const radiusOf = () =>
    Math.min(box.width, box.height) * PIE_RADIUS_RATIO;
  let r = radiusOf();
  const cxOf = () => (box.left + box.right) / 2;
  const cyOf = () => (box.top + box.bottom) / 2;

  for (let pass = 0; pass < 3; pass++) {
    let overflowLeft = 0;
    let overflowRight = 0;
    let overflowTop = 0;
    let overflowBottom = 0;
    const cx = cxOf();
    const cy = cyOf();
    for (let i = 0; i < spokes.length; i++) {
      const p = spokePoint(cx, cy, r + 14, i, n);
      const w = textWidth(spokes[i]!, TYPE.tick.size);
      overflowLeft = Math.max(overflowLeft, 8 - (p.x - w / 2));
      overflowRight = Math.max(overflowRight, p.x + w / 2 - (SVG_WIDTH - 8));
      overflowTop = Math.max(overflowTop, 4 - (p.y - TYPE.tick.size));
      overflowBottom = Math.max(
        overflowBottom,
        p.y + TYPE.tick.size - (height - 4),
      );
    }
    if (
      overflowLeft <= 0.5 &&
      overflowRight <= 0.5 &&
      overflowTop <= 0.5 &&
      overflowBottom <= 0.5
    ) {
      break;
    }
    left += Math.max(0, overflowLeft);
    right += Math.max(0, overflowRight);
    top += Math.max(0, overflowTop);
    bottom += Math.max(0, overflowBottom);
    height = fitFrameHeight(top, bottom);
    box = plot();
    r = radiusOf();
  }

  const cx = cxOf();
  const cy = cyOf();
  const lines: string[] = [drawTitle(visibleTitle(chart), box.left, chart.unit)];

  if (useLegend && legendDraft.items.length > 0) {
    const legendY = LEGEND_BELOW
      ? Math.max(box.bottom + 12, height - legendDraft.height)
      : TITLE_BASELINE + 18;
    const painted = layoutLegend(
      names,
      styles.map((s) => s.color),
      styles.map((s) => s.opacity),
      box.left,
      legendY,
      box.width,
    );
    lines.push(
      `  <g ${attrs({
        "font-size": TYPE.legend.size,
        "font-weight": TYPE.legend.weight,
        fill: TYPE.legend.fill,
      })}>`,
    );
    for (const item of painted.items) {
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(item.x),
          y: fmtPx(item.y - 9),
          width: 10,
          height: 10,
          fill: item.color,
          "fill-opacity": item.opacity === 1 ? undefined : item.opacity,
          rx: 1,
        })}/>`,
      );
      lines.push(
        `    <text ${attrs({
          x: fmtPx(item.x + 14),
          y: fmtPx(item.y),
          "data-legend": item.name,
        })}>${escapeXml(item.name)}</text>`,
      );
    }
    lines.push(`  </g>`);
  }

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
      fill: "none",
      stroke: INK,
      "stroke-opacity": STRUCTURE_OPACITY,
      "stroke-width": 1,
      "data-radar-grid": "1",
    })}>`,
  );
  for (const ring of [0.5, 1]) {
    const pts = Array.from({ length: n }, (_, i) =>
      spokePoint(cx, cy, r * ring, i, n),
    );
    const d =
      pts
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"}${fmtPx(p.x)} ${fmtPx(p.y)}`,
        )
        .join(" ") + " Z";
    lines.push(`    <path ${attrs({ d })}/>`);
  }
  for (let i = 0; i < n; i++) {
    const p = spokePoint(cx, cy, r, i, n);
    lines.push(
      `    <line ${attrs({
        x1: fmtPx(cx),
        y1: fmtPx(cy),
        x2: fmtPx(p.x),
        y2: fmtPx(p.y),
      })}/>`,
    );
  }
  lines.push(`  </g>`);

  lines.push(`  <g ${attrs({ "data-radar": "1" })}>`);
  for (let s = 0; s < names.length; s++) {
    const name = names[s]!;
    const style = styles[s]!;
    const pts = spokes.map((spoke, i) => {
      let found: number | undefined;
      for (const row of rows) {
        if (row.series === name && row.xLabel === spoke) {
          found = row.y;
        }
      }
      const value = found ?? 0;
      return spokePoint(cx, cy, (value / scaleMax) * r, i, n);
    });
    const d =
      pts
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"}${fmtPx(p.x)} ${fmtPx(p.y)}`,
        )
        .join(" ") + " Z";
    lines.push(
      `    <path ${attrs({
        d,
        fill: style.color,
        "fill-opacity": AREA_OPACITY * style.opacity,
        stroke: style.color,
        "stroke-opacity": style.opacity === 1 ? undefined : style.opacity,
        "stroke-width": 1.75,
        "data-series": name,
      })}/>`,
    );
  }
  lines.push(`  </g>`);

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  for (let i = 0; i < spokes.length; i++) {
    const label = spokes[i]!;
    const p = spokePoint(cx, cy, r + 14, i, n);
    lines.push(
      `    <text ${attrs({
        x: fmtPx(p.x),
        y: fmtPx(p.y),
        "text-anchor": "middle",
        "dominant-baseline": "middle",
        "data-spoke": label,
      })}>${escapeXml(label)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
