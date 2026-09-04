import type { ChartIR } from "@markvis/ir";
import {
  categoryNames,
  groupedValue,
  loadRows,
  seriesNames,
  usesLinearX,
  type DataRow,
} from "./data.js";
import { drawTitle, visibleTitle } from "./figure.js";
import { binHistogram, histSamplesFromChart, type HistBin } from "./hist.js";
import {
  layoutFrame,
  layoutLegend,
  showBarValueLabels,
  SVG_WIDTH,
  type Painted,
  type PlotBox,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import {
  compactScale,
  formatNumber,
  formatTick,
  niceTicks,
  scaleLinear,
  unitWithCompact,
  xExtent,
  yExtent,
  type CompactScale,
} from "./scale.js";
import { textWidth } from "./text.js";
import {
  AREA_OPACITY,
  BAR_GAP_FEW,
  BAR_GAP_MANY,
  BAR_LABEL_INSIDE_H,
  BAR_LABEL_OFFSET,
  BAR_MAX_WIDTH,
  BAR_MAX_WIDTH_N,
  BAR_RX,
  END_LABEL_GAP,
  END_LABEL_MIN_SEP,
  END_LABEL_SERIES_MAX,
  GROUP_GAP_PX,
  HAIRLINE_OPACITY,
  INK,
  LABEL_ROTATE_DEG,
  LINE_POINT_R,
  LINE_STROKE,
  MAX_INTERIOR_GRID,
  POINT_SKIP_AFTER,
  SCATTER_OPACITY,
  SCATTER_R,
  STRUCTURE_OPACITY,
  TICK_TEXT_GAP,
  TITLE_BASELINE,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

type Prepared = {
  rows: DataRow[];
  series: string[];
  categories: string[];
  linearX: boolean;
  xTicks: { pos: number; label: string; show: boolean }[];
  yTicks: { pos: number; label: string }[];
  xScaleNum: (v: number) => number;
  yScale: (v: number) => number;
  catCenter: (i: number) => number;
  catStep: number;
  plot: PlotBox;
  legend: ReturnType<typeof layoutLegend>;
  rotateX: boolean;
  bins: HistBin[];
  compact: CompactScale | null;
  titleUnit: string | undefined;
  styles: { color: string; opacity: number }[];
  height: number;
  showValueLabels: boolean;
  showInteriorGrid: boolean;
  useEndLabels: boolean;
};

function polyline(points: { x: number; y: number }[]): string {
  return points
    .map((point, i) => {
      const cmd = i === 0 ? "M" : "L";
      return `${cmd}${fmtPx(point.x)} ${fmtPx(point.y)}`;
    })
    .join(" ");
}

function bandGapRatio(nCat: number): number {
  return nCat <= 6 ? BAR_GAP_FEW : BAR_GAP_MANY;
}

export function barSlot(
  nCat: number,
  nS: number,
  catStep: number,
  plotLeft: number,
  ci: number,
  si: number,
): { x: number; barW: number } {
  const inner = Math.max(catStep * (1 - bandGapRatio(nCat)), 1);
  const seriesGap = nS > 1 ? GROUP_GAP_PX : 0;
  let barW = Math.max(0.5, (inner - seriesGap * (nS - 1)) / nS);
  if (nCat <= BAR_MAX_WIDTH_N) {
    barW = Math.min(barW, BAR_MAX_WIDTH);
  }
  const groupW = barW * nS + seriesGap * (nS - 1);
  const groupStart = plotLeft + ci * catStep + (catStep - groupW) / 2;
  return { x: groupStart + si * (barW + seriesGap), barW };
}

function typicalBarWidth(nCat: number, nS: number, catStep: number): number {
  return barSlot(nCat, nS, catStep, 0, 0, 0).barW;
}

function usesEndLabels(chart: ChartIR, seriesCount: number): boolean {
  if (chart.type !== "line" && chart.type !== "area") {
    return false;
  }
  return seriesCount >= 2 && seriesCount <= END_LABEL_SERIES_MAX;
}

function usesColorLegend(chart: ChartIR, seriesCount: number): boolean {
  if (seriesCount <= 1) {
    return false;
  }
  if (chart.type === "line" || chart.type === "area") {
    return seriesCount > END_LABEL_SERIES_MAX;
  }
  return true;
}

function endLabelRightMin(series: string[]): number {
  const widest = Math.max(
    0,
    ...series.map((name) => textWidth(name, TYPE.value.size)),
  );
  return END_LABEL_GAP + widest;
}

function prepare(chart: ChartIR): Prepared {
  const histMode = chart.type === "hist";
  const rows = histMode ? [] : loadRows(chart);
  const bins = histMode ? binHistogram(histSamplesFromChart(chart)) : [];
  const series = histMode ? [chart.y ?? "count"] : seriesNames(rows);
  const categories = histMode
    ? bins.map(
        (bin) => `${formatNumber(bin.left)}–${formatNumber(bin.right)}`,
      )
    : categoryNames(rows);
  const linearX = histMode ? true : usesLinearX(chart, rows);

  const yValues = histMode
    ? bins.map((bin) => bin.weight)
    : rows.map((row) => row.y);
  const forceZero =
    chart.type === "bar" || chart.type === "area" || chart.type === "hist";
  const yDom = yExtent(yValues, forceZero);
  const yTickNums = niceTicks(yDom[0], yDom[1]);
  const yMin = yTickNums[0] ?? yDom[0];
  const yMax = yTickNums[yTickNums.length - 1] ?? yDom[1];
  const compact = compactScale(yTickNums, yMax - yMin);
  const yTickLabels = yTickNums.map((n) => formatTick(n, compact));

  const styles = series.map((_, i) => seriesStyle(i));
  const showLegend = usesColorLegend(chart, series.length);
  const useEndLabels = usesEndLabels(chart, series.length);
  const rightMin = useEndLabels ? endLabelRightMin(series) : 0;

  const xLabelTexts = linearX
    ? histMode
      ? Array.from(
          new Set(
            bins.flatMap((bin) => [
              formatNumber(bin.left),
              formatNumber(bin.right),
            ]),
          ),
        )
      : []
    : categories;

  const legendDraft = showLegend
    ? layoutLegend(
        series,
        styles.map((s) => s.color),
        styles.map((s) => s.opacity),
        48,
        TITLE_BASELINE + 18,
        SVG_WIDTH - 96,
      )
    : { items: [], height: 0 };

  let frame = layoutFrame({
    yTickLabels,
    categoryLabels: xLabelTexts.length ? xLabelTexts : linearX ? [] : categories,
    legendHeight: legendDraft.height,
    rightMin,
  });

  const legend = showLegend
    ? layoutLegend(
        series,
        styles.map((s) => s.color),
        styles.map((s) => s.opacity),
        frame.plot.left,
        TITLE_BASELINE + 18,
        frame.plot.width,
      )
    : legendDraft;

  if (legend.height !== legendDraft.height && showLegend) {
    frame = layoutFrame({
      yTickLabels,
      categoryLabels: xLabelTexts.length
        ? xLabelTexts
        : linearX
          ? []
          : categories,
      legendHeight: legend.height,
      rightMin,
    });
  }

  const plot = frame.plot;
  const nCat = Math.max(histMode ? bins.length : categories.length, 1);
  const catStep = plot.width / nCat;
  const nS = Math.max(series.length, 1);
  const barW = typicalBarWidth(nCat, nS, catStep);
  const labelBars =
    (chart.type === "bar" || chart.type === "hist") &&
    showBarValueLabels(nCat, barW);
  const showInteriorGrid =
    chart.type === "bar" || chart.type === "hist" ? !labelBars : true;

  const yScale = scaleLinear([yMin, yMax], [plot.bottom, plot.top]);
  const yTicks = yTickNums.map((n) => ({
    pos: yScale(n),
    label: formatTick(n, compact),
  }));

  let xScaleNum = scaleLinear([0, 1], [plot.left, plot.right]);
  let xTicks: { pos: number; label: string; show: boolean }[] = [];
  const catCenter = (i: number) => plot.left + (i + 0.5) * catStep;
  const showAt = (i: number) => frame.show[i] ?? true;

  if (histMode && bins.length > 0) {
    const lo = bins[0]!.left;
    const hi = bins[bins.length - 1]!.right;
    xScaleNum = scaleLinear([lo, hi], [plot.left, plot.right]);
    const edges = bins.map((bin) => bin.left);
    edges.push(bins[bins.length - 1]!.right);
    xTicks = edges.map((edge, i) => ({
      pos: xScaleNum(edge),
      label: formatNumber(edge),
      show: showAt(i),
    }));
  } else if (linearX) {
    const xs = rows
      .map((row) => row.xNum)
      .filter((n): n is number => n !== undefined);
    const xDom = xExtent(xs, chart.type === "scatter" ? 0.08 : 0.05);
    const xTickNums = niceTicks(xDom[0], xDom[1]);
    const xMin = xTickNums[0] ?? xDom[0];
    const xMax = xTickNums[xTickNums.length - 1] ?? xDom[1];
    xScaleNum = scaleLinear([xMin, xMax], [plot.left + 8, plot.right - 8]);
    xTicks = xTickNums.map((n) => ({
      pos: xScaleNum(n),
      label: formatNumber(n),
      show: true,
    }));
  } else {
    xTicks = categories.map((label, i) => ({
      pos: catCenter(i),
      label,
      show: showAt(i),
    }));
  }

  return {
    rows,
    series,
    categories,
    linearX,
    xTicks,
    yTicks,
    xScaleNum,
    yScale,
    catCenter,
    catStep,
    plot,
    legend,
    rotateX: frame.rotateX,
    bins,
    compact,
    titleUnit: unitWithCompact(chart.unit, compact),
    styles,
    height: frame.height,
    showValueLabels: labelBars,
    showInteriorGrid,
    useEndLabels,
  };
}

function drawLegend(prepared: Prepared): string[] {
  if (prepared.legend.items.length === 0) {
    return [];
  }
  const lines: string[] = [
    `  <g ${attrs({
      "font-size": TYPE.legend.size,
      "font-weight": TYPE.legend.weight,
      fill: TYPE.legend.fill,
    })}>`,
  ];
  for (const item of prepared.legend.items) {
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
  return lines;
}

function interiorGridTicks(
  yTicks: { pos: number; label: string }[],
  plotBottom: number,
): { pos: number; label: string }[] {
  const interior = yTicks.filter(
    (tick) => Math.abs(tick.pos - plotBottom) > 0.5,
  );
  if (interior.length <= MAX_INTERIOR_GRID) {
    return interior;
  }
  const picked: { pos: number; label: string }[] = [];
  const seen = new Set<number>();
  for (let i = 0; i < MAX_INTERIOR_GRID; i++) {
    const idx = Math.round(
      (i * (interior.length - 1)) / (MAX_INTERIOR_GRID - 1),
    );
    const tick = interior[idx]!;
    if (seen.has(tick.pos)) {
      continue;
    }
    seen.add(tick.pos);
    picked.push(tick);
  }
  return picked;
}

function drawGridAndAxes(prepared: Prepared): string[] {
  const { plot, xTicks, yTicks, rotateX } = prepared;
  const lines: string[] = [];
  if (prepared.showInteriorGrid) {
    const gridTicks = interiorGridTicks(yTicks, plot.bottom);
    if (gridTicks.length > 0) {
      lines.push(
        `  <g ${attrs({
          fill: "none",
          stroke: INK,
          "stroke-opacity": HAIRLINE_OPACITY,
          "stroke-width": 1,
        })}>`,
      );
      for (const tick of gridTicks) {
        lines.push(
          `    <line ${attrs({
            x1: fmtPx(plot.left),
            x2: fmtPx(plot.right),
            y1: fmtPx(tick.pos),
            y2: fmtPx(tick.pos),
          })}/>`,
        );
      }
      lines.push(`  </g>`);
    }
  }

  lines.push(
    `  <path ${attrs({
      d: `M${fmtPx(plot.left)} ${fmtPx(plot.bottom)} L${fmtPx(plot.right)} ${fmtPx(plot.bottom)}`,
      fill: "none",
      stroke: INK,
      "stroke-opacity": STRUCTURE_OPACITY,
      "stroke-width": 1,
    })}/>`,
  );

  const zeroTick = yTicks.find((tick) => tick.label === "0");
  if (
    zeroTick &&
    Math.abs(zeroTick.pos - plot.bottom) > 0.5 &&
    Math.abs(zeroTick.pos - plot.top) > 0.5
  ) {
    lines.push(
      `  <line ${attrs({
        x1: fmtPx(plot.left),
        x2: fmtPx(plot.right),
        y1: fmtPx(zeroTick.pos),
        y2: fmtPx(zeroTick.pos),
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
      })}/>`,
    );
  }

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  for (const tick of yTicks) {
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.left - TICK_TEXT_GAP),
        y: fmtPx(tick.pos),
        "text-anchor": "end",
        "dominant-baseline": "middle",
      })}>${escapeXml(tick.label)}</text>`,
    );
  }
  for (const tick of xTicks) {
    if (!tick.show) {
      continue;
    }
    if (rotateX) {
      const tx = fmtPx(tick.pos);
      const ty = fmtPx(plot.bottom + 8);
      lines.push(
        `    <text ${attrs({
          x: tx,
          y: ty,
          "text-anchor": "end",
          "dominant-baseline": "middle",
          "font-size": TYPE.tick.size,
          transform: `rotate(${LABEL_ROTATE_DEG} ${tx} ${ty})`,
          "data-full-label": tick.label,
        })}>${escapeXml(tick.label)}</text>`,
      );
    } else {
      lines.push(
        `    <text ${attrs({
          x: fmtPx(tick.pos),
          y: fmtPx(plot.bottom + TYPE.tick.size),
          "text-anchor": "middle",
          "font-size": TYPE.tick.size,
          "data-full-label": tick.label,
        })}>${escapeXml(tick.label)}</text>`,
      );
    }
  }
  lines.push(`  </g>`);
  return lines;
}

function roundedBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  roundAwayFromBaselineUp: boolean,
): string {
  const r = Math.min(BAR_RX, w / 2, Math.max(h, 0));
  const x0 = fmtPx(x);
  const y0 = fmtPx(y);
  const x1 = fmtPx(x + w);
  const y1 = fmtPx(y + h);
  if (h <= 0.01 || r <= 0) {
    return `M${x0} ${fmtPx(y + h)} L${x1} ${fmtPx(y + h)} L${x1} ${y0} L${x0} ${y0} Z`;
  }
  const rr = fmtPx(r);
  void rr;
  if (roundAwayFromBaselineUp) {
    return `M${x0} ${y1} L${x0} ${fmtPx(y + r)} Q${x0} ${y0} ${fmtPx(x + r)} ${y0} L${fmtPx(x + w - r)} ${y0} Q${x1} ${y0} ${x1} ${fmtPx(y + r)} L${x1} ${y1} Z`;
  }
  return `M${x0} ${y0} L${x1} ${y0} L${x1} ${fmtPx(y + h - r)} Q${x1} ${y1} ${fmtPx(x + w - r)} ${y1} L${fmtPx(x + r)} ${y1} Q${x0} ${y1} ${x0} ${fmtPx(y + h - r)} Z`;
}

function valueLabelY(
  roundUp: boolean,
  y: number,
  h: number,
  y0: number,
): number {
  if (h >= BAR_LABEL_INSIDE_H) {
    return roundUp ? y - BAR_LABEL_OFFSET : y + h + BAR_LABEL_OFFSET + 8;
  }
  if (h < 8) {
    return roundUp ? y0 - BAR_LABEL_OFFSET : y0 + BAR_LABEL_OFFSET + 8;
  }
  return roundUp ? y + 12 : y + h - 6;
}

function drawBars(prepared: Prepared): string[] {
  const {
    plot,
    series,
    categories,
    rows,
    catStep,
    yScale,
    styles,
    showValueLabels,
  } = prepared;
  const nS = Math.max(series.length, 1);
  const nCat = categories.length;
  const y0 = yScale(0);
  const lines: string[] = [`  <g>`];
  const labels: string[] = [];
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]!;
    for (let si = 0; si < series.length; si++) {
      const ser = series[si]!;
      const val = groupedValue(rows, ser, cat);
      const { x, barW } = barSlot(nCat, nS, catStep, plot.left, ci, si);
      const y1 = yScale(val);
      const y = Math.min(y0, y1);
      const h = Math.abs(y1 - y0);
      const style = styles[si]!;
      const roundUp = val >= 0;
      lines.push(
        `    <path ${attrs({
          d: roundedBarPath(x, y, barW, h, roundUp),
          fill: style.color,
          "fill-opacity": style.opacity === 1 ? undefined : style.opacity,
          "data-x": cat,
          "data-series": ser,
          "data-y": String(val),
        })}/>`,
      );
      if (!showValueLabels) {
        continue;
      }
      const text = formatNumber(val);
      const cx = x + barW / 2;
      const ly = valueLabelY(roundUp, y, h, y0);
      labels.push(
        `    <text ${attrs({
          x: fmtPx(cx),
          y: fmtPx(ly),
          "text-anchor": "middle",
          "font-size": TYPE.value.size,
          "font-weight": TYPE.value.weight,
          fill: TYPE.value.fill,
          "data-value-label": cat,
        })}>${escapeXml(text)}</text>`,
      );
    }
  }
  lines.push(`  </g>`);
  if (labels.length > 0) {
    lines.push(`  <g>`);
    lines.push(...labels);
    lines.push(`  </g>`);
  }
  return lines;
}

function xPos(
  prepared: Prepared,
  row: DataRow,
  catIndex: Map<string, number>,
): number {
  if (prepared.linearX && row.xNum !== undefined) {
    return prepared.xScaleNum(row.xNum);
  }
  const i = catIndex.get(row.xLabel) ?? 0;
  return prepared.catCenter(i);
}

function opacityAttr(opacity: number): number | undefined {
  return opacity === 1 ? undefined : opacity;
}

function lastPointBySeries(
  prepared: Prepared,
): { name: string; x: number; y: number; color: string }[] {
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const out: { name: string; x: number; y: number; color: string }[] = [];
  for (let si = 0; si < prepared.series.length; si++) {
    const ser = prepared.series[si]!;
    let last: { x: number; y: number } | undefined;
    for (const row of prepared.rows) {
      if (row.series !== ser) {
        continue;
      }
      last = {
        x: xPos(prepared, row, catIndex),
        y: prepared.yScale(row.y),
      };
    }
    if (!last) {
      continue;
    }
    out.push({
      name: ser,
      x: last.x,
      y: last.y,
      color: prepared.styles[si]!.color,
    });
  }
  return out;
}

function dodgeEndLabelYs(
  items: { name: string; x: number; y: number; color: string }[],
): number[] {
  const order = items
    .map((item, i) => ({ i, y: item.y }))
    .sort((a, b) => a.y - b.y);
  const ys = items.map((item) => item.y);
  for (let n = 0; n < order.length - 1; n++) {
    const a = order[n]!;
    const b = order[n + 1]!;
    const gap = ys[b.i]! - ys[a.i]!;
    if (gap < END_LABEL_MIN_SEP) {
      const nudge = (END_LABEL_MIN_SEP - gap) / 2;
      ys[a.i]! -= nudge;
      ys[b.i]! += nudge;
    }
  }
  return ys;
}

function drawEndLabels(prepared: Prepared): string[] {
  if (!prepared.useEndLabels) {
    return [];
  }
  const items = lastPointBySeries(prepared);
  if (items.length === 0) {
    return [];
  }
  const ys = dodgeEndLabelYs(items);
  const lines: string[] = [
    `  <g ${attrs({
      "font-size": TYPE.value.size,
      "font-weight": TYPE.value.weight,
    })}>`,
  ];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(item.x + END_LABEL_GAP),
        y: fmtPx(ys[i]!),
        "text-anchor": "start",
        "dominant-baseline": "middle",
        fill: item.color,
        "data-end-label": item.name,
      })}>${escapeXml(item.name)}</text>`,
    );
  }
  lines.push(`  </g>`);
  return lines;
}

function drawLineOrArea(prepared: Prepared, area: boolean): string[] {
  const { rows, series, yScale, styles } = prepared;
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const zero = yScale(0);
  const lines: string[] = [`  <g fill="none">`];
  for (let si = 0; si < series.length; si++) {
    const ser = series[si]!;
    const pts: { x: number; y: number }[] = [];
    for (const row of rows) {
      if (row.series !== ser) {
        continue;
      }
      pts.push({ x: xPos(prepared, row, catIndex), y: yScale(row.y) });
    }
    if (pts.length === 0) {
      continue;
    }
    const style = styles[si]!;
    const d = polyline(pts);
    if (area) {
      const first = pts[0]!;
      const last = pts[pts.length - 1]!;
      const fillD = `${d} L${fmtPx(last.x)} ${fmtPx(zero)} L${fmtPx(first.x)} ${fmtPx(zero)} Z`;
      lines.push(
        `    <path ${attrs({
          d: fillD,
          fill: style.color,
          "fill-opacity": AREA_OPACITY * style.opacity,
          stroke: "none",
          "data-series": ser,
        })}/>`,
      );
    }
    lines.push(
      `    <path ${attrs({
        d,
        fill: "none",
        stroke: style.color,
        "stroke-width": LINE_STROKE,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        "stroke-opacity": opacityAttr(style.opacity),
        "data-series": ser,
      })}/>`,
    );
    if (pts.length <= POINT_SKIP_AFTER) {
      for (const pt of pts) {
        lines.push(
          `    <circle ${attrs({
            cx: fmtPx(pt.x),
            cy: fmtPx(pt.y),
            r: LINE_POINT_R,
            fill: style.color,
            "fill-opacity": opacityAttr(style.opacity),
            stroke: "none",
            "data-series": ser,
          })}/>`,
        );
      }
    }
  }
  lines.push(`  </g>`);
  lines.push(...drawEndLabels(prepared));
  return lines;
}

function drawScatter(prepared: Prepared): string[] {
  const { rows, series, yScale, styles } = prepared;
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const styleOf = new Map(series.map((name, i) => [name, styles[i]!]));
  const lines: string[] = [`  <g>`];
  for (const row of rows) {
    if (row.xNum === undefined && prepared.linearX) {
      continue;
    }
    const cx = xPos(prepared, row, catIndex);
    const cy = yScale(row.y);
    const style = styleOf.get(row.series) ?? styles[0]!;
    lines.push(
      `    <circle ${attrs({
        cx: fmtPx(cx),
        cy: fmtPx(cy),
        r: SCATTER_R,
        fill: style.color,
        "fill-opacity": SCATTER_OPACITY * style.opacity,
        stroke: "none",
        "data-x": row.xLabel,
        "data-y": String(row.y),
        "data-series": row.series,
      })}/>`,
    );
  }
  lines.push(`  </g>`);
  return lines;
}

function drawHist(prepared: Prepared): string[] {
  const { bins, xScaleNum, yScale, styles, showValueLabels } = prepared;
  const y0 = yScale(0);
  const style = styles[0]!;
  const nCat = Math.max(bins.length, 1);
  const lines: string[] = [`  <g>`];
  const labels: string[] = [];
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i]!;
    const xLeft = xScaleNum(bin.left);
    const xRight = xScaleNum(bin.right);
    const band = xRight - xLeft;
    const { x, barW } = barSlot(nCat, 1, band, xLeft, 0, 0);
    const y1 = yScale(bin.weight);
    const y = Math.min(y0, y1);
    const h = Math.abs(y1 - y0);
    lines.push(
      `    <path ${attrs({
        d: roundedBarPath(x, y, barW, h, bin.weight >= 0),
        fill: style.color,
        "fill-opacity": opacityAttr(style.opacity),
        "data-bin-left": String(bin.left),
        "data-bin-right": String(bin.right),
        "data-weight": String(bin.weight),
        "data-count": String(bin.count),
      })}/>`,
    );
    if (!showValueLabels) {
      continue;
    }
    const roundUp = bin.weight >= 0;
    labels.push(
      `    <text ${attrs({
        x: fmtPx(x + barW / 2),
        y: fmtPx(valueLabelY(roundUp, y, h, y0)),
        "text-anchor": "middle",
        "font-size": TYPE.value.size,
        "font-weight": TYPE.value.weight,
        fill: TYPE.value.fill,
        "data-value-label": `${bin.left}–${bin.right}`,
      })}>${escapeXml(formatNumber(bin.weight))}</text>`,
    );
  }
  lines.push(`  </g>`);
  if (labels.length > 0) {
    lines.push(`  <g>`);
    lines.push(...labels);
    lines.push(`  </g>`);
  }
  return lines;
}

export function renderCartesian(chart: ChartIR, _id: string): Painted {
  const prepared = prepare(chart);
  const lines: string[] = [
    drawTitle(visibleTitle(chart), prepared.plot.left, prepared.titleUnit),
    ...drawLegend(prepared),
  ];
  lines.push(...drawGridAndAxes(prepared));
  if (chart.type === "bar") {
    lines.push(...drawBars(prepared));
  } else if (chart.type === "line") {
    lines.push(...drawLineOrArea(prepared, false));
  } else if (chart.type === "area") {
    lines.push(...drawLineOrArea(prepared, true));
  } else if (chart.type === "scatter") {
    lines.push(...drawScatter(prepared));
  } else if (chart.type === "hist") {
    lines.push(...drawHist(prepared));
  }
  return { lines, height: prepared.height };
}
