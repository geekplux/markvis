import type { ChartIR } from "@markvis/ir";
import { loadRows } from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
import {
  fitFrameHeight,
  titleBlockTop,
  SVG_WIDTH,
  type Painted,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";
import {
  AXIS,
  MARGIN,
  PIE_ELBOW,
  PIE_LABEL_GAP,
  PIE_LABEL_MIN_SEP,
  PIE_LEADER,
  PIE_RADIUS_RATIO,
  PIE_STROKE,
  SLICE_GAP,
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
): { cx: number; cy: number; r: number; left: number; top: number } {
  const plotLeft = left;
  const plotRight = SVG_WIDTH - right;
  const plotTop = top;
  const plotBottom = height - bottom;
  const plotW = plotRight - plotLeft;
  const plotH = plotBottom - plotTop;
  return {
    left: plotLeft,
    top: plotTop,
    cx: (plotLeft + plotRight) / 2,
    cy: (plotTop + plotBottom) / 2,
    r: Math.min(plotW, plotH) * PIE_RADIUS_RATIO,
  };
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

  let left = MARGIN.left;
  let right = MARGIN.right;
  let top = titleBlockTop(0);
  let bottom = MARGIN.right;
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

  let labels = placeLabels(slices, box.cx, box.cy, box.r);
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

  const { cx, cy, r } = box;
  const lines: string[] = [drawTitle(visibleTitle(chart), box.left, chart.unit)];

  lines.push(`  <g ${attrs({ "aria-hidden": "true" })}>`);
  if (sum <= 0) {
    lines.push(
      `    <circle ${attrs({
        cx: fmtPx(cx),
        cy: fmtPx(cy),
        r: fmtPx(r),
        fill: "none",
        stroke: AXIS,
        "stroke-width": 1.5,
        "data-empty": "true",
      })}/>`,
    );
  } else {
    for (const slice of slices) {
      if (slice.value <= 0) {
        continue;
      }
      if (slice.value === sum) {
        lines.push(
          `    <circle ${attrs({
            cx: fmtPx(cx),
            cy: fmtPx(cy),
            r: fmtPx(r),
            fill: slice.color,
            "fill-opacity": slice.opacity === 1 ? undefined : slice.opacity,
            stroke: SLICE_GAP,
            "stroke-width": PIE_STROKE,
            "data-label": slice.label,
            "data-raw-value": String(slice.value),
          })}/>`,
        );
        continue;
      }
      lines.push(
        `    <path ${attrs({
          d: slicePath(cx, cy, r, slice.a0, slice.a1),
          fill: slice.color,
          "fill-opacity": slice.opacity === 1 ? undefined : slice.opacity,
          stroke: SLICE_GAP,
          "stroke-width": PIE_STROKE,
          "data-label": slice.label,
          "data-raw-value": String(slice.value),
        })}/>`,
      );
    }
  }
  lines.push(`  </g>`);

  if (labels.length > 0) {
    lines.push(
      `  <g ${attrs({ fill: "none", stroke: AXIS, "stroke-width": 1 })}>`,
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
