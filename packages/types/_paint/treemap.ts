import type { ChartIR } from "@markvis/ir";
import { loadRows, uniqueInOrder } from "./data.js";
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

type Leaf = { label: string; value: number; colorIndex: number };
type Group = { label: string; value: number; children: Leaf[]; colorIndex: number };

type Rect = { x: number; y: number; w: number; h: number; label: string; value: number; colorIndex: number; depth: number };

function luminance(hex: string): number {
  const body = hex.replace("#", "");
  const n = Number.parseInt(body, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

type Tile = {
  label: string;
  value: number;
  colorIndex: number;
  depth: number;
};

function worstAspect(areas: number[], length: number): number {
  const sum = areas.reduce((s, n) => s + n, 0);
  if (sum <= 0 || length <= 0) {
    return Infinity;
  }
  const rowLen = sum / length;
  let worst = 0;
  for (const area of areas) {
    const side = area / rowLen;
    worst = Math.max(worst, rowLen / side, side / rowLen);
  }
  return worst;
}

/** Squarified tiles. Items should already be positive. */
function squarify(items: Tile[], x: number, y: number, w: number, h: number, out: Rect[]): void {
  const positive = items.filter((it) => it.value > 0 && w > 0 && h > 0);
  if (positive.length === 0 || w <= 0 || h <= 0) {
    return;
  }
  const total = positive.reduce((s, it) => s + it.value, 0);
  if (total <= 0) {
    return;
  }
  const scale = (w * h) / total;
  let remaining = [...positive].sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
  let rx = x;
  let ry = y;
  let rw = w;
  let rh = h;
  while (remaining.length > 0 && rw > 0 && rh > 0) {
    const vertical = rw >= rh;
    const side = vertical ? rh : rw;
    const row: Tile[] = [];
    let best = Infinity;
    for (const item of remaining) {
      const next = [...row, item];
      const score = worstAspect(
        next.map((it) => it.value * scale),
        side,
      );
      if (row.length > 0 && score > best) {
        break;
      }
      row.push(item);
      best = score;
    }
    const rowArea = row.reduce((s, it) => s + it.value * scale, 0);
    const rowLen = side > 0 ? rowArea / side : 0;
    let cursor = 0;
    for (const item of row) {
      const len = rowLen > 0 ? (item.value * scale) / rowLen : 0;
      if (vertical) {
        out.push({
          x: rx,
          y: ry + cursor,
          w: rowLen,
          h: len,
          label: item.label,
          value: item.value,
          colorIndex: item.colorIndex,
          depth: item.depth,
        });
      } else {
        out.push({
          x: rx + cursor,
          y: ry,
          w: len,
          h: rowLen,
          label: item.label,
          value: item.value,
          colorIndex: item.colorIndex,
          depth: item.depth,
        });
      }
      cursor += len;
    }
    if (vertical) {
      rx += rowLen;
      rw -= rowLen;
    } else {
      ry += rowLen;
      rh -= rowLen;
    }
    remaining = remaining.slice(row.length);
  }
}

export function renderTreemap(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart).flatMap((row) =>
    row.y !== null && row.y > 0 ? [{ ...row, y: row.y }] : [],
  );
  const hasParent = chart.series !== undefined;

  let layoutItems: {
    label: string;
    value: number;
    colorIndex: number;
    depth: number;
    children?: Leaf[];
  }[] = [];

  if (!hasParent) {
    layoutItems = rows.map((row, i) => ({
      label: row.xLabel,
      value: row.y,
      colorIndex: i,
      depth: 0,
    }));
  } else {
    const parents = uniqueInOrder(rows.map((row) => row.series));
    const groups: Group[] = parents.map((parent, pi) => {
      const children: Leaf[] = rows
        .filter((row) => row.series === parent)
        .map((row, ci) => ({
          label: row.xLabel,
          value: row.y,
          colorIndex: pi * 8 + ci,
        }));
      return {
        label: parent,
        value: children.reduce((s, c) => s + c.value, 0),
        children,
        colorIndex: pi,
      };
    });
    layoutItems = groups.map((g) => ({
      label: g.label,
      value: g.value,
      colorIndex: g.colorIndex,
      depth: 0,
      children: g.children,
    }));
  }

  const left = MARGIN.left;
  const right = MARGIN.right;
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

  const rects: Rect[] = [];
  // Only paint leaf cells for flat; for two-level paint children (and skip drawing parent fill under children).
  if (!hasParent) {
    squarify(layoutItems, plot.left, plot.top, plot.width, plot.height, rects);
  } else {
    // Parent strips first, then children inside — collect only child leaf rects for fill,
    // but draw parent labels when space remains around children (we draw child cells only).
    const parentRects: Rect[] = [];
    squarify(
      layoutItems.map((it) => ({
        label: it.label,
        value: it.value,
        colorIndex: it.colorIndex,
        depth: 0,
      })),
      plot.left,
      plot.top,
      plot.width,
      plot.height,
      parentRects,
    );
    for (let i = 0; i < layoutItems.length; i++) {
      const group = layoutItems[i]!;
      const pr = parentRects.find((rect) => rect.label === group.label);
      if (!pr || !group.children) {
        continue;
      }
      const headerNeed = TYPE.tick.size + 10;
      const header = pr.h > headerNeed + 16 && pr.w > 36 ? headerNeed : 0;
      squarify(
        group.children.map((c) => ({
          label: c.label,
          value: c.value,
          colorIndex: group.colorIndex,
          depth: 1,
        })),
        pr.x,
        pr.y + header,
        pr.w,
        Math.max(pr.h - header, 0),
        rects,
      );
      if (header > 0) {
        rects.push({
          x: pr.x,
          y: pr.y,
          w: pr.w,
          h: header,
          label: group.label,
          value: group.value,
          colorIndex: group.colorIndex,
          depth: 0,
        });
      }
    }
  }

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

  lines.push(`  <g ${attrs({ "data-treemap": "1" })}>`);
  // Draw depth-0 headers first, then leaves (depth>=1 or flat depth 0).
  const ordered = [...rects].sort((a, b) => a.depth - b.depth);
  for (const r of ordered) {
    if (r.w <= 0 || r.h <= 0) {
      continue;
    }
    const style = seriesStyle(r.colorIndex);
    const isHeader = hasParent && r.depth === 0;
    const tiny = r.w < 14 || r.h < 14;
    let hash = 0;
    for (const ch of r.label) {
      hash = (hash + ch.charCodeAt(0)) % 5;
    }
    const opacity = isHeader ? 0.92 : tiny ? 0.45 : 0.62 + hash * 0.07;
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(r.x),
        y: fmtPx(r.y),
        width: fmtPx(r.w),
        height: fmtPx(r.h),
        fill: style.color,
        "fill-opacity": opacity,
        stroke: tiny ? "none" : "#ffffff",
        "stroke-width": tiny ? undefined : 1.5,
        "data-label": r.label,
        "data-y": formatNumber(r.value),
        "data-depth": r.depth,
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
  for (const r of ordered) {
    const pad = 4;
    const availW = r.w - pad * 2;
    const availH = r.h - pad * 2;
    if (availW < 8 || availH < TYPE.value.size) {
      continue;
    }
    const label = truncateLabel(r.label, availW, TYPE.value.size);
    if (textWidth(label, TYPE.value.size) > availW) {
      continue;
    }
    const ink = luminance(seriesStyle(r.colorIndex).color) > 0.45 ? "#171717" : "#fafaf9";
    lines.push(
      `    <text ${attrs({
        x: fmtPx(r.x + pad),
        y: fmtPx(r.y + pad + TYPE.value.size * 0.85),
        "text-anchor": "start",
        fill: ink,
        "data-label-text": r.label,
      })}><title>${escapeXml(r.label)}</title>${escapeXml(label)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
