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
import { truncateLabel } from "./text.js";
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
/** Filled ribbon opacity (designer lock). */
const LINK_FILL_OPACITY = 0.45;

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

function sumOut(id: string, links: Link[]): number {
  let s = 0;
  for (const link of links) {
    if (link.source === id) {
      s += link.value;
    }
  }
  return s;
}

function sumIn(id: string, links: Link[]): number {
  let s = 0;
  for (const link of links) {
    if (link.target === id) {
      s += link.value;
    }
  }
  return s;
}

function nodeCenterY(g: NodeGeom): number {
  return g.y + g.height / 2;
}

/** Closed ribbon: cubic top (src top → tgt top) + cubic bottom (tgt bot → src bot) + Z. */
function ribbonPath(
  x0: number,
  y0Top: number,
  y0Bot: number,
  x1: number,
  y1Top: number,
  y1Bot: number,
): string {
  const dx = Math.max((x1 - x0) / 2, 16);
  const cx0 = x0 + dx;
  const cx1 = x1 - dx;
  return [
    `M${fmtPx(x0)} ${fmtPx(y0Top)}`,
    `C${fmtPx(cx0)} ${fmtPx(y0Top)}, ${fmtPx(cx1)} ${fmtPx(y1Top)}, ${fmtPx(x1)} ${fmtPx(y1Top)}`,
    `L${fmtPx(x1)} ${fmtPx(y1Bot)}`,
    `C${fmtPx(cx1)} ${fmtPx(y1Bot)}, ${fmtPx(cx0)} ${fmtPx(y0Bot)}, ${fmtPx(x0)} ${fmtPx(y0Bot)}`,
    `Z`,
  ].join(" ");
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
    const scale =
      total > 0
        ? (plot.height - NODE_GAP * Math.max(ids.length - 1, 0)) / total
        : 0;
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

  // One barycenter attach-order pass: outflows by target center, inflows by source center.
  const outLinks = new Map<string, Link[]>();
  const inLinks = new Map<string, Link[]>();
  for (const id of nodeIds) {
    outLinks.set(id, []);
    inLinks.set(id, []);
  }
  for (const link of links) {
    if (link.value <= 0) {
      continue;
    }
    outLinks.get(link.source)?.push(link);
    inLinks.get(link.target)?.push(link);
  }
  for (const id of nodeIds) {
    const outs = outLinks.get(id) ?? [];
    outs.sort((a, b) => {
      const ta = geoms.get(a.target);
      const tb = geoms.get(b.target);
      const ca = ta ? nodeCenterY(ta) : 0;
      const cb = tb ? nodeCenterY(tb) : 0;
      if (ca !== cb) {
        return ca - cb;
      }
      return a.index - b.index;
    });
    const inns = inLinks.get(id) ?? [];
    inns.sort((a, b) => {
      const sa = geoms.get(a.source);
      const sb = geoms.get(b.source);
      const ca = sa ? nodeCenterY(sa) : 0;
      const cb = sb ? nodeCenterY(sb) : 0;
      if (ca !== cb) {
        return ca - cb;
      }
      return a.index - b.index;
    });
  }

  // Per-link source/target face thicknesses + stacked offsets (sum to full node face).
  type LinkGeom = {
    link: Link;
    x0: number;
    y0Top: number;
    y0Bot: number;
    x1: number;
    y1Top: number;
    y1Bot: number;
  };
  const linkGeoms: LinkGeom[] = [];
  const outAt = new Map<string, number>();
  const inAt = new Map<string, number>();
  for (const id of nodeIds) {
    outAt.set(id, 0);
    inAt.set(id, 0);
  }

  // Walk sources in column order so out offsets stack; then apply in offsets via sorted inflows.
  // Build by iterating each node's sorted outflows (covers every link once).
  const linkSrcBand = new Map<number, { y0Top: number; y0Bot: number; x0: number }>();
  const linkTgtBand = new Map<number, { y1Top: number; y1Bot: number; x1: number }>();

  for (const id of nodeIds) {
    const src = geoms.get(id);
    if (!src) {
      continue;
    }
    const outSum = sumOut(id, links);
    for (const link of outLinks.get(id) ?? []) {
      const sh = outSum > 0 ? (link.value / outSum) * src.height : 0;
      const y0Top = src.y + (outAt.get(id) ?? 0);
      const y0Bot = y0Top + sh;
      outAt.set(id, (outAt.get(id) ?? 0) + sh);
      linkSrcBand.set(link.index, {
        y0Top,
        y0Bot,
        x0: src.x + src.width,
      });
    }
  }
  for (const id of nodeIds) {
    const tgt = geoms.get(id);
    if (!tgt) {
      continue;
    }
    const inSum = sumIn(id, links);
    for (const link of inLinks.get(id) ?? []) {
      const th = inSum > 0 ? (link.value / inSum) * tgt.height : 0;
      const y1Top = tgt.y + (inAt.get(id) ?? 0);
      const y1Bot = y1Top + th;
      inAt.set(id, (inAt.get(id) ?? 0) + th);
      linkTgtBand.set(link.index, {
        y1Top,
        y1Bot,
        x1: tgt.x,
      });
    }
  }

  for (const link of links) {
    if (link.value <= 0) {
      continue;
    }
    const s = linkSrcBand.get(link.index);
    const t = linkTgtBand.get(link.index);
    if (!s || !t) {
      continue;
    }
    linkGeoms.push({
      link,
      x0: s.x0,
      y0Top: s.y0Top,
      y0Bot: s.y0Bot,
      x1: t.x1,
      y1Top: t.y1Top,
      y1Bot: t.y1Bot,
    });
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
  for (const g of linkGeoms) {
    const style = seriesStyle(g.link.index);
    const fillOpacity =
      style.opacity === 1
        ? LINK_FILL_OPACITY
        : style.opacity * LINK_FILL_OPACITY;
    const d = ribbonPath(g.x0, g.y0Top, g.y0Bot, g.x1, g.y1Top, g.y1Bot);
    lines.push(
      `    <path ${attrs({
        d,
        fill: style.color,
        "fill-opacity": fillOpacity,
        stroke: "none",
        "data-source": g.link.source,
        "data-target": g.link.target,
        "data-y": formatNumber(g.link.value),
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
    // Left col outside-left; right col outside-right; middle toward nearer plot edge.
    let outsideLeft: boolean;
    if (g.col === 0) {
      outsideLeft = true;
    } else if (g.col >= maxCol && maxCol > 0) {
      outsideLeft = false;
    } else {
      const midX = g.x + g.width / 2;
      const distLeft = midX - plot.left;
      const distRight = plot.right - midX;
      outsideLeft = distLeft <= distRight;
    }
    const maxLabel = Math.max(colSpan - NODE_W - 8, 40);
    // Skip when the gutter is too tight to read (~12px).
    if (maxLabel < 12) {
      continue;
    }
    const label = truncateLabel(id, maxLabel, TYPE.tick.size);
    const lx = outsideLeft ? g.x - 4 : g.x + g.width + 4;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(lx),
        y: fmtPx(g.y + g.height / 2),
        "text-anchor": outsideLeft ? "end" : "start",
        "dominant-baseline": "middle",
        "data-node-label": id,
      })}>${escapeXml(label)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
