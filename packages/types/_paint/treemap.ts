import type { ChartIR } from "@markvis/ir";
import { loadRows, uniqueInOrder } from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
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

/** Slice-and-dice: alternate horizontal / vertical splits by value weight. */
function sliceDice(
  items: { label: string; value: number; colorIndex: number; depth: number; children?: Leaf[] }[],
  x: number,
  y: number,
  w: number,
  h: number,
  vertical: boolean,
  out: Rect[],
): void {
  const positive = items.filter((it) => it.value > 0);
  if (positive.length === 0 || w <= 0 || h <= 0) {
    return;
  }
  const total = positive.reduce((s, it) => s + it.value, 0);
  if (total <= 0) {
    return;
  }
  let cursor = vertical ? y : x;
  for (const it of positive) {
    const frac = it.value / total;
    if (vertical) {
      const hh = h * frac;
      out.push({
        x,
        y: cursor,
        w,
        h: hh,
        label: it.label,
        value: it.value,
        colorIndex: it.colorIndex,
        depth: it.depth,
      });
      if (it.children && it.children.length > 0) {
        sliceDice(
          it.children.map((c) => ({
            label: c.label,
            value: c.value,
            colorIndex: c.colorIndex,
            depth: it.depth + 1,
          })),
          x,
          cursor,
          w,
          hh,
          !vertical,
          out,
        );
      }
      cursor += hh;
    } else {
      const ww = w * frac;
      out.push({
        x: cursor,
        y,
        w: ww,
        h,
        label: it.label,
        value: it.value,
        colorIndex: it.colorIndex,
        depth: it.depth,
      });
      if (it.children && it.children.length > 0) {
        sliceDice(
          it.children.map((c) => ({
            label: c.label,
            value: c.value,
            colorIndex: c.colorIndex,
            depth: it.depth + 1,
          })),
          cursor,
          y,
          ww,
          h,
          !vertical,
          out,
        );
      }
      cursor += ww;
    }
  }
}

export function renderTreemap(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart).filter((row) => row.y > 0);
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
    sliceDice(layoutItems, plot.left, plot.top, plot.width, plot.height, plot.width < plot.height, rects);
  } else {
    // Parent strips first, then children inside — collect only child leaf rects for fill,
    // but draw parent labels when space remains around children (we draw child cells only).
    const parentRects: Rect[] = [];
    const vertical = plot.width < plot.height;
    sliceDice(
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
      vertical,
      parentRects,
    );
    for (let i = 0; i < layoutItems.length; i++) {
      const group = layoutItems[i]!;
      const pr = parentRects[i];
      if (!pr || !group.children) {
        continue;
      }
      // Reserve a thin parent header band when tall enough, else fill fully with children.
      const header = pr.h > 28 ? TYPE.tick.size + 6 : 0;
      sliceDice(
        group.children.map((c) => ({
          label: c.label,
          value: c.value,
          colorIndex: c.colorIndex,
          depth: 1,
        })),
        pr.x,
        pr.y + header,
        pr.w,
        Math.max(pr.h - header, 0),
        !vertical,
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
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(r.x),
        y: fmtPx(r.y),
        width: fmtPx(r.w),
        height: fmtPx(r.h),
        fill: style.color,
        "fill-opacity": isHeader
          ? 0.35
          : style.opacity === 1
            ? undefined
            : style.opacity,
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
        "data-label": r.label,
        "data-y": formatNumber(r.value),
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
    lines.push(
      `    <text ${attrs({
        x: fmtPx(r.x + pad),
        y: fmtPx(r.y + pad + TYPE.value.size * 0.85),
        "text-anchor": "start",
        "data-label-text": r.label,
      })}>${escapeXml(label)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
