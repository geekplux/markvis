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

type Link = {
  source: string;
  target: string;
  value: number;
  index: number;
};

type NodeGeom = {
  id: string;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
};

const NODE_W = 14;
const NODE_GAP = 8;
const COL_PAD = 24;

function assignColumns(nodeIds: string[], links: Link[]): Map<string, number> {
  const outs = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const id of nodeIds) {
    outs.set(id, []);
    indeg.set(id, 0);
  }
  const seenEdge = new Set<string>();
  for (const link of links) {
    const key = `${link.source}\0${link.target}`;
    if (seenEdge.has(key) || link.source === link.target) {
      continue;
    }
    seenEdge.add(key);
    outs.get(link.source)!.push(link.target);
    indeg.set(link.target, (indeg.get(link.target) ?? 0) + 1);
  }

  const col = new Map<string, number>();
  const queue: string[] = [];
  for (const id of nodeIds) {
    if ((indeg.get(id) ?? 0) === 0) {
      queue.push(id);
      col.set(id, 0);
    }
  }
  let qi = 0;
  while (qi < queue.length) {
    const id = queue[qi++]!;
    const c = col.get(id) ?? 0;
    for (const t of outs.get(id) ?? []) {
      const next = c + 1;
      const prev = col.get(t);
      if (prev === undefined || next > prev) {
        col.set(t, next);
      }
      indeg.set(t, (indeg.get(t) ?? 1) - 1);
      if (indeg.get(t) === 0) {
        queue.push(t);
      }
    }
  }

  // Cycles / leftovers: place after max predecessor column when known.
  let maxC = 0;
  for (const c of col.values()) {
    maxC = Math.max(maxC, c);
  }
  for (const id of nodeIds) {
    if (col.has(id)) {
      continue;
    }
    let best = 0;
    for (const link of links) {
      if (link.target === id && col.has(link.source)) {
        best = Math.max(best, (col.get(link.source) ?? 0) + 1);
      }
    }
    col.set(id, best > 0 ? best : maxC);
    maxC = Math.max(maxC, col.get(id)!);
  }
  return col;
}

function nodeValue(id: string, links: Link[]): number {
  let out = 0;
  let inn = 0;
  for (const link of links) {
    if (link.source === id) {
      out += link.value;
    }
    if (link.target === id) {
      inn += link.value;
    }
  }
  return Math.max(out, inn, 0);
}

export function renderSankey(chart: ChartIR, _id: string): Painted {
  const rows = loadRows(chart);
  const links: Link[] = rows.map((row, index) => ({
    source: row.xLabel,
    target: row.series,
    value: Math.max(0, row.y),
    index,
  }));

  const nodeIds = uniqueInOrder(
    links.flatMap((link) => [link.source, link.target]),
  );
  const columns = assignColumns(nodeIds, links);
  const values = new Map<string, number>();
  for (const id of nodeIds) {
    values.set(id, nodeValue(id, links));
  }

  const byCol = new Map<number, string[]>();
  let maxCol = 0;
  for (const id of nodeIds) {
    const c = columns.get(id) ?? 0;
    maxCol = Math.max(maxCol, c);
    const list = byCol.get(c) ?? [];
    list.push(id);
    byCol.set(c, list);
  }
  const nCols = Math.max(maxCol + 1, 1);

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

  const colSpan =
    nCols <= 1 ? 0 : (plot.width - NODE_W - 2 * COL_PAD) / (nCols - 1);
  const geoms = new Map<string, NodeGeom>();

  for (let c = 0; c <= maxCol; c++) {
    const ids = byCol.get(c) ?? [];
    const total = ids.reduce((sum, id) => sum + (values.get(id) ?? 0), 0);
    const scale = total > 0 ? (plot.height - NODE_GAP * Math.max(ids.length - 1, 0)) / total : 0;
    let yCursor = plot.top;
    const x = plot.left + COL_PAD + c * colSpan;
    for (const id of ids) {
      const value = values.get(id) ?? 0;
      const h = Math.max(scale * value, value > 0 ? 4 : 2);
      geoms.set(id, {
        id,
        col: c,
        x,
        y: yCursor,
        width: NODE_W,
        height: h,
        value,
      });
      yCursor += h + NODE_GAP;
    }
  }

  // Per-node outflow / inflow offsets for link attachment
  const outAt = new Map<string, number>();
  const inAt = new Map<string, number>();
  for (const id of nodeIds) {
    outAt.set(id, 0);
    inAt.set(id, 0);
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

  lines.push(`  <g ${attrs({ "data-sankey-links": "1" })}>`);
  const totalFlow = Math.max(
    1,
    links.reduce((s, l) => s + l.value, 0),
  );
  for (const link of links) {
    const src = geoms.get(link.source);
    const tgt = geoms.get(link.target);
    if (!src || !tgt || link.value <= 0) {
      continue;
    }
    const srcScale = src.value > 0 ? src.height / src.value : 0;
    const tgtScale = tgt.value > 0 ? tgt.height / tgt.value : 0;
    const sw = Math.max(srcScale * link.value, 1);
    const tw = Math.max(tgtScale * link.value, 1);
    const sy0 = src.y + (outAt.get(link.source) ?? 0) + sw / 2;
    const ty0 = tgt.y + (inAt.get(link.target) ?? 0) + tw / 2;
    outAt.set(link.source, (outAt.get(link.source) ?? 0) + sw);
    inAt.set(link.target, (inAt.get(link.target) ?? 0) + tw);
    const x0 = src.x + src.width;
    const x1 = tgt.x;
    const dx = Math.max((x1 - x0) / 2, 16);
    const style = seriesStyle(link.index);
    const thickness = Math.max((link.value / totalFlow) * 40, sw, 1.5);
    const d = `M${fmtPx(x0)} ${fmtPx(sy0)} C${fmtPx(x0 + dx)} ${fmtPx(sy0)}, ${fmtPx(x1 - dx)} ${fmtPx(ty0)}, ${fmtPx(x1)} ${fmtPx(ty0)}`;
    lines.push(
      `    <path ${attrs({
        d,
        fill: "none",
        stroke: style.color,
        "stroke-opacity": style.opacity === 1 ? 0.55 : style.opacity * 0.55,
        "stroke-width": fmtPx(thickness),
        "data-source": link.source,
        "data-target": link.target,
        "data-y": formatNumber(link.value),
      })}/>`,
    );
  }
  lines.push(`  </g>`);

  lines.push(`  <g ${attrs({ "data-sankey-nodes": "1" })}>`);
  for (const id of nodeIds) {
    const g = geoms.get(id)!;
    const style = seriesStyle(g.col);
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(g.x),
        y: fmtPx(g.y),
        width: fmtPx(g.width),
        height: fmtPx(g.height),
        fill: style.color,
        "fill-opacity": style.opacity === 1 ? undefined : style.opacity,
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
        "data-node": id,
        "data-y": formatNumber(g.value),
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
  for (const id of nodeIds) {
    const g = geoms.get(id)!;
    const labelRight = g.col >= maxCol && maxCol > 0;
    const maxLabel = Math.max(colSpan - NODE_W - 8, 40);
    const label = truncateLabel(id, maxLabel, TYPE.tick.size);
    if (textWidth(label, TYPE.tick.size) > maxLabel && maxLabel < 12) {
      continue;
    }
    const lx = labelRight ? g.x - 4 : g.x + g.width + 4;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(lx),
        y: fmtPx(g.y + g.height / 2),
        "text-anchor": labelRight ? "end" : "start",
        "dominant-baseline": "middle",
        "data-node-label": id,
      })}>${escapeXml(label)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
