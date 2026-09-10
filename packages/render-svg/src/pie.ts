import type { ChartIR } from "@markvis/ir";
import { loadRows } from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
import {
  fitFrameHeight,
  layoutLegend,
  titleBlockTop,
  SVG_WIDTH,
  type Painted,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";
import {
  INK,
  LEGEND_BELOW,
  MARGIN,
  PIE_ELBOW,
  PIE_INNER_RATIO,
  PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP,
  PIE_LABEL_MODE,
  PIE_LEADER,
  PIE_RADIUS_RATIO,
  PIE_STROKE,
  PLOT_BG,
  PLOT_BORDER,
  PLOT_BORDER_WIDTH,
  STRUCTURE_OPACITY,
  TITLE_BASELINE,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

function slicePath(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
): string {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${fmtPx(cx)} ${fmtPx(cy)} L${fmtPx(x0)} ${fmtPx(y0)} A${fmtPx(r)} ${fmtPx(r)} 0 ${large} 1 ${fmtPx(x1)} ${fmtPx(y1)} Z`;
}

/** Annular sector for donut slices (inner radius > 0). */
function donutSlicePath(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  a0: number,
  a1: number,
): string {
  const x0o = cx + rOuter * Math.cos(a0);
  const y0o = cy + rOuter * Math.sin(a0);
  const x1o = cx + rOuter * Math.cos(a1);
  const y1o = cy + rOuter * Math.sin(a1);
  const x0i = cx + rInner * Math.cos(a0);
  const y0i = cy + rInner * Math.sin(a0);
  const x1i = cx + rInner * Math.cos(a1);
  const y1i = cy + rInner * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return (
    `M${fmtPx(x0o)} ${fmtPx(y0o)}` +
    ` A${fmtPx(rOuter)} ${fmtPx(rOuter)} 0 ${large} 1 ${fmtPx(x1o)} ${fmtPx(y1o)}` +
    ` L${fmtPx(x1i)} ${fmtPx(y1i)}` +
    ` A${fmtPx(rInner)} ${fmtPx(rInner)} 0 ${large} 0 ${fmtPx(x0i)} ${fmtPx(y0i)} Z`
  );
}

function fullDonutPath(cx: number, cy: number, rOuter: number, rInner: number): string {
  // evenodd ring: outer circle clockwise-ish, inner counter
  const o = fmtPx(rOuter);
  const i = fmtPx(rInner);
  const cxs = fmtPx(cx);
  const cys = fmtPx(cy);
  return (
    `M${cxs} ${fmtPx(cy - rOuter)}` +
    ` A${o} ${o} 0 1 1 ${cxs} ${fmtPx(cy + rOuter)}` +
    ` A${o} ${o} 0 1 1 ${cxs} ${fmtPx(cy - rOuter)} Z` +
    ` M${cxs} ${fmtPx(cy - rInner)}` +
    ` A${i} ${i} 0 1 0 ${cxs} ${fmtPx(cy + rInner)}` +
    ` A${i} ${i} 0 1 0 ${cxs} ${fmtPx(cy - rInner)} Z`
  );
}

type Slice = {
  label: string;
  value: number;
  color: string;
  opacity: number;
  a0: number;
  a1: number;
  mid: number;
};

type LabelPos = {
  slice: Slice;
  extraR: number;
  side: 1 | -1;
  text: string;
  width: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  elbowX: number;
  lx: number;
  ly: number;
};

function placeLabels(
  slices: Slice[],
  cx: number,
  cy: number,
  r: number,
): LabelPos[] {
  const items: LabelPos[] = slices
    .filter((slice) => slice.value > 0)
    .map((slice) => {
      const side: 1 | -1 = Math.cos(slice.mid) >= 0 ? 1 : -1;
      const text = `${slice.label} · ${formatNumber(slice.value)}`;
      return {
        slice,
        extraR: 0,
        side,
        text,
        width: textWidth(text, TYPE.value.size),
        x0: 0,
        y0: 0,
        x1: 0,
        y1: 0,
        elbowX: 0,
        lx: 0,
        ly: 0,
      };
    });

  const layoutOne = (item: LabelPos): void => {
    const mid = item.slice.mid;
    const r1 = r + PIE_LEADER + item.extraR;
    item.x0 = cx + r * Math.cos(mid);
    item.y0 = cy + r * Math.sin(mid);
    item.x1 = cx + r1 * Math.cos(mid);
    item.y1 = cy + r1 * Math.sin(mid);
    item.elbowX = item.x1 + item.side * PIE_ELBOW;
    item.lx = item.elbowX + item.side * PIE_LABEL_GAP;
    item.ly = item.y1;
  };

  for (const item of items) {
    layoutOne(item);
  }

  for (let pass = 0; pass < 16; pass++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i]!;
        const b = items[j]!;
        if (a.side !== b.side) {
          continue;
        }
        const dx = a.lx - b.lx;
        const dy = a.ly - b.ly;
        const dist = Math.hypot(dx, dy);
        if (dist < PIE_LABEL_MIN_SEP) {
          const farther =
            Math.abs(a.slice.mid + Math.PI / 2) >=
            Math.abs(b.slice.mid + Math.PI / 2)
              ? a
              : b;
          farther.extraR += 6;
          layoutOne(farther);
          moved = true;
        }
      }
    }
    if (!moved) {
      break;
    }
  }

  return items;
}

function pieBox(
  left: number,
  right: number,
  top: number,
  bottom: number,
  height: number,
): {
  cx: number;
  cy: number;
  r: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
} {
  const plotLeft = left;
  const plotRight = SVG_WIDTH - right;
  const plotTop = top;
  const plotBottom = height - bottom;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;
  return {
    left: plotLeft,
    top: plotTop,
    right: plotRight,
    bottom: plotBottom,
    width: plotW,
    height: plotH,
    cx: (plotLeft + plotRight) / 2,
    cy: (plotTop + plotBottom) / 2,
    r: Math.min(plotW, plotH) * PIE_RADIUS_RATIO,
  };
}

function drawPieLegend(
  names: string[],
  colors: string[],
  opacities: number[],
  left: number,
  top: number,
  maxWidth: number,
): { lines: string[]; layout: ReturnType<typeof layoutLegend> } {
  const layout = layoutLegend(names, colors, opacities, left, top, maxWidth);
  if (layout.items.length === 0) {
    return { lines: [], layout };
  }
  const lines: string[] = [
    `  <g ${attrs({
      "font-size": TYPE.legend.size,
      "font-weight": TYPE.legend.weight,
      fill: TYPE.legend.fill,
    })}>`,
  ];
  for (const item of layout.items) {
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
  return { lines, layout };
}

export function renderPie(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const raw: Omit<Slice, "a0" | "a1" | "mid">[] = rows.map((row, i) => {
    const style = seriesStyle(i);
    return {
      label: row.xLabel,
      value: Math.max(0, row.y),
      color: style.color,
      opacity: style.opacity,
    };
  });
  const sum = raw.reduce((acc, slice) => acc + slice.value, 0);
  const useLeaders = PIE_LABEL_MODE === "leaders";
  const useLegend = PIE_LABEL_MODE === "legend";
  const innerRatio = Math.max(0, Math.min(0.85, PIE_INNER_RATIO));
  const isDonut = innerRatio > 0.01;

  const legendNames = useLegend
    ? raw.filter((s) => s.value > 0).map((s) => s.label)
    : [];
  const legendColors = useLegend
    ? raw.filter((s) => s.value > 0).map((s) => s.color)
    : [];
  const legendOpacities = useLegend
    ? raw.filter((s) => s.value > 0).map((s) => s.opacity)
    : [];

  let legendDraft = useLegend
    ? layoutLegend(
        legendNames,
        legendColors,
        legendOpacities,
        48,
        TITLE_BASELINE + 18,
        SVG_WIDTH - 96,
      )
    : { items: [] as ReturnType<typeof layoutLegend>["items"], height: 0 };

  let left = MARGIN.left;
  let right = MARGIN.right;
  let top = titleBlockTop(legendDraft.height);
  let bottom = MARGIN.right;
  if (LEGEND_BELOW && legendDraft.height > 0) {
    bottom += legendDraft.height + 8;
  }
  let height = fitFrameHeight(top, bottom);
  let box = pieBox(left, right, top, bottom, height);

  const slices: Slice[] = [];
  let angle = -Math.PI / 2;
  if (sum > 0) {
    for (const slice of raw) {
      const sweep = (slice.value / sum) * Math.PI * 2;
      const next = angle + sweep;
      slices.push({
        ...slice,
        a0: angle,
        a1: next,
        mid: angle + sweep / 2,
      });
      angle = next;
    }
  }

  let labels = useLeaders ? placeLabels(slices, box.cx, box.cy, box.r) : [];
  if (useLeaders) {
    for (let pass = 0; pass < 3; pass++) {
      let overflowLeft = 0;
      let overflowRight = 0;
      let overflowBottom = 0;
      let overflowTop = 0;
      for (const item of labels) {
        const textLeft = item.side > 0 ? item.lx : item.lx - item.width;
        const textRight = item.side > 0 ? item.lx + item.width : item.lx;
        overflowLeft = Math.max(overflowLeft, 8 - textLeft);
        overflowRight = Math.max(overflowRight, textRight - (SVG_WIDTH - 8));
        overflowBottom = Math.max(
          overflowBottom,
          item.ly + TYPE.value.size / 2 + 4 - (height - 4),
        );
        overflowTop = Math.max(overflowTop, 4 - (item.ly - TYPE.value.size / 2));
      }
      if (
        overflowLeft <= 0.5 &&
        overflowRight <= 0.5 &&
        overflowBottom <= 0.5 &&
        overflowTop <= 0.5
      ) {
        break;
      }
      left += Math.max(0, overflowLeft);
      right += Math.max(0, overflowRight);
      bottom += Math.max(0, overflowBottom);
      top += Math.max(0, overflowTop);
      height = fitFrameHeight(top, bottom);
      box = pieBox(left, right, top, bottom, height);
      labels = placeLabels(slices, box.cx, box.cy, box.r);
    }
  }

  // Re-layout legend against final plot box.
  let legendLines: string[] = [];
  if (useLegend && legendNames.length > 0) {
    const legendY = LEGEND_BELOW
      ? Math.max(box.bottom + 12, height - legendDraft.height)
      : TITLE_BASELINE + 18;
    const painted = drawPieLegend(
      legendNames,
      legendColors,
      legendOpacities,
      box.left,
      legendY,
      box.width,
    );
    legendLines = painted.lines;
    if (painted.layout.height !== legendDraft.height) {
      legendDraft = painted.layout;
      top = titleBlockTop(legendDraft.height);
      bottom = MARGIN.right;
      if (LEGEND_BELOW && legendDraft.height > 0) {
        bottom += legendDraft.height + 8;
      }
      height = fitFrameHeight(top, bottom);
      box = pieBox(left, right, top, bottom, height);
      const y2 = LEGEND_BELOW
        ? Math.max(box.bottom + 12, height - legendDraft.height)
        : TITLE_BASELINE + 18;
      const painted2 = drawPieLegend(
        legendNames,
        legendColors,
        legendOpacities,
        box.left,
        y2,
        box.width,
      );
      legendLines = painted2.lines;
    }
  }

  const { cx, cy, r } = box;
  const rInner = isDonut ? r * innerRatio : 0;
  const lines: string[] = [drawTitle(visibleTitle(chart), box.left, chart.unit)];
  lines.push(...legendLines);

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
      "aria-hidden": "true",
      "data-pie-label-mode": PIE_LABEL_MODE,
      "data-pie-inner-ratio": String(innerRatio),
    })}>`,
  );
  if (sum <= 0) {
    lines.push(
      `    <circle ${attrs({
        cx: fmtPx(cx),
        cy: fmtPx(cy),
        r: fmtPx(r),
        fill: "none",
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": PIE_STROKE,
        "data-empty": "true",
      })}/>`,
    );
  } else {
    for (const slice of slices) {
      if (slice.value <= 0) {
        continue;
      }
      if (slice.value === sum) {
        if (isDonut) {
          lines.push(
            `    <path ${attrs({
              d: fullDonutPath(cx, cy, r, rInner),
              fill: slice.color,
              "fill-opacity": slice.opacity === 1 ? undefined : slice.opacity,
              "fill-rule": "evenodd",
              stroke: INK,
              "stroke-opacity": STRUCTURE_OPACITY,
              "stroke-width": PIE_STROKE,
              "data-label": slice.label,
              "data-raw-value": String(slice.value),
              "data-donut": "1",
            })}/>`,
          );
        } else {
          lines.push(
            `    <circle ${attrs({
              cx: fmtPx(cx),
              cy: fmtPx(cy),
              r: fmtPx(r),
              fill: slice.color,
              "fill-opacity": slice.opacity === 1 ? undefined : slice.opacity,
              stroke: INK,
              "stroke-opacity": STRUCTURE_OPACITY,
              "stroke-width": PIE_STROKE,
              "data-label": slice.label,
              "data-raw-value": String(slice.value),
            })}/>`,
          );
        }
        continue;
      }
      const d = isDonut
        ? donutSlicePath(cx, cy, r, rInner, slice.a0, slice.a1)
        : slicePath(cx, cy, r, slice.a0, slice.a1);
      lines.push(
        `    <path ${attrs({
          d,
          fill: slice.color,
          "fill-opacity": slice.opacity === 1 ? undefined : slice.opacity,
          stroke: INK,
          "stroke-opacity": STRUCTURE_OPACITY,
          "stroke-width": PIE_STROKE,
          "data-label": slice.label,
          "data-raw-value": String(slice.value),
          "data-donut": isDonut ? "1" : undefined,
        })}/>`,
      );
    }
  }
  lines.push(`  </g>`);

  if (labels.length > 0) {
    lines.push(
      `  <g ${attrs({
        fill: "none",
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
      })}>`,
    );
    for (const item of labels) {
      lines.push(
        `    <polyline ${attrs({
          points: `${fmtPx(item.x0)},${fmtPx(item.y0)} ${fmtPx(item.x1)},${fmtPx(item.y1)} ${fmtPx(item.elbowX)},${fmtPx(item.y1)}`,
        })}/>`,
      );
    }
    lines.push(`  </g>`);
    lines.push(
      `  <g ${attrs({
        "font-size": TYPE.value.size,
        "font-weight": TYPE.value.weight,
        fill: TYPE.value.fill,
      })}>`,
    );
    for (const item of labels) {
      lines.push(
        `    <text ${attrs({
          x: fmtPx(item.lx),
          y: fmtPx(item.ly),
          "text-anchor": item.side > 0 ? "start" : "end",
          "dominant-baseline": "middle",
          "data-label": item.slice.label,
        })}>${escapeXml(item.text)}</text>`,
      );
    }
    lines.push(`  </g>`);
  }

  return { lines, height };
}
