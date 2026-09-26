import type { ChartIR } from "@markvis/ir";
import {
  categoryNames,
  finiteValues,
  groupedValue,
  loadRows,
  seriesNames,
  usesLinearX,
  type DataRow,
} from "./data.js";
import { countTitleLines, drawTitle, visibleTitle } from "./figure.js";
import { binHistogram, histSamplesFromChart, type HistBin } from "./hist.js";
import {
  layoutFrame,
  layoutLegend,
  setTitleLineCount,
  showBarValueLabels,
  SVG_WIDTH,
  tickLeftMargin,
  type Painted,
  type PlotBox,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import {
  compactScale,
  formatNumber,
  labelTicks,
  niceTicks,
  scaleLinear,
  unitWithCompact,
  xExtent,
  yExtent,
  type CompactScale,
} from "./scale.js";
import { placeHorizontalLabel, textWidth } from "./text.js";
import {
  AREA_OPACITY,
  AXIS_TITLES,
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
  LEGEND_BELOW,
  LINE_POINT_R,
  LINE_STROKE,
  MAX_INTERIOR_GRID,
  VERTICAL_GRID,
  POINT_SKIP_AFTER,
  PLOT_BG,
  PLOT_BORDER,
  PLOT_BORDER_WIDTH,
  SCATTER_MARK,
  SCATTER_OPACITY,
  SCATTER_R,
  STRUCTURE_OPACITY,
  TICK_TEXT_GAP,
  TITLE_BASELINE,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

type LayoutMode = "grouped" | "stacked" | "percent";

type Prepared = {
  rows: DataRow[];
  series: string[];
  categories: string[];
  linearX: boolean;
  layout: LayoutMode;
  xTicks: { pos: number; label: string; show: boolean; lines: string[] }[];
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
  axisXTitle: string | undefined;
  axisYTitle: string | undefined;
};

function finiteRuns(
  points: { x: number; y: number }[],
): { x: number; y: number }[][] {
  const runs: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];
  for (const point of points) {
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
      if (run.length > 0) {
        runs.push(run);
        run = [];
      }
      continue;
    }
    run.push(point);
  }
  if (run.length > 0) {
    runs.push(run);
  }
  return runs;
}

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


function resolveLayout(chart: ChartIR): LayoutMode {
  if (chart.type !== "bar" && chart.type !== "line" && chart.type !== "area") {
    return "grouped";
  }
  const layout = chart.layout;
  if (layout === "stacked" || layout === "percent") {
    return layout;
  }
  return "grouped";
}

/** Segment heights [series][category]. Null is missing and is not a zero. */
function segmentMatrix(
  rows: DataRow[],
  series: string[],
  categories: string[],
  percent: boolean,
): Array<Array<number | null>> {
  const raw = series.map((ser) =>
    categories.map((cat) => groupedValue(rows, ser, cat)),
  );
  if (!percent) {
    return raw;
  }
  const out: Array<Array<number | null>> = series.map(() =>
    categories.map(() => null),
  );
  for (let ci = 0; ci < categories.length; ci++) {
    let total = 0;
    for (let si = 0; si < series.length; si++) {
      const value = raw[si]?.[ci];
      if (typeof value === "number") {
        total += value;
      }
    }
    for (let si = 0; si < series.length; si++) {
      const value = raw[si]?.[ci];
      const rowOut = out[si];
      if (!rowOut) {
        continue;
      }
      if (typeof value !== "number") {
        rowOut[ci] = null;
      } else {
        rowOut[ci] = total === 0 ? 0 : (value / total) * 100;
      }
    }
  }
  return out;
}

function stackTotals(matrix: Array<Array<number | null>>): number[] {
  if (matrix.length === 0) {
    return [];
  }
  const nCat = matrix[0]!.length;
  const totals: number[] = [];
  for (let ci = 0; ci < nCat; ci++) {
    let sum = 0;
    for (let si = 0; si < matrix.length; si++) {
      const value = matrix[si]?.[ci];
      if (typeof value === "number") {
        sum += value;
      }
    }
    totals.push(sum);
  }
  return totals;
}

const SERIES_DASH = ["", "6 4", "2 2", "7 3 2 3"] as const;

function seriesDash(index: number): string | undefined {
  const dash = SERIES_DASH[index % SERIES_DASH.length] ?? "";
  return dash === "" ? undefined : dash;
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

  const layout = resolveLayout(chart);
  const stacking = layout === "stacked" || layout === "percent";
  let yValues: number[];
  if (histMode) {
    yValues = bins.map((bin) => bin.weight);
  } else if (layout === "percent") {
    yValues = [0, 100];
  } else if (stacking) {
    const matrix = segmentMatrix(rows, series, categories, false);
    yValues = stackTotals(matrix);
  } else {
    yValues = finiteValues(rows.map((row) => row.y));
  }
  const forceZero =
    chart.type === "bar" ||
    chart.type === "area" ||
    chart.type === "hist" ||
    stacking;
  const yDom = yExtent(yValues, forceZero);
  const yTickNums = niceTicks(yDom[0], yDom[1]);
  const yMin = yTickNums[0] ?? yDom[0];
  const yMax = yTickNums[yTickNums.length - 1] ?? yDom[1];
  const compact = compactScale(yTickNums, yMax - yMin);
  const yTickLabels = labelTicks(yTickNums);

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

  const namedAxes =
    AXIS_TITLES || chart.type === "scatter" || chart.type === "hist";

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

  const categoryLabels =
    xLabelTexts.length ? xLabelTexts : linearX ? [] : categories;

  setTitleLineCount(
    countTitleLines(
      visibleTitle(chart),
      tickLeftMargin(yTickLabels, namedAxes),
      unitWithCompact(chart.unit, compact),
    ),
  );

  let frame = layoutFrame({
    yTickLabels,
    categoryLabels,
    legendHeight: legendDraft.height,
    rightMin,
    axisTitles: namedAxes,
  });

  let legend = showLegend
    ? layoutLegend(
        series,
        styles.map((s) => s.color),
        styles.map((s) => s.opacity),
        frame.plot.left,
        LEGEND_BELOW
          ? Math.max(
              frame.plot.bottom + TYPE.tick.size + 16,
              frame.height - legendDraft.height,
            )
          : TITLE_BASELINE + 18,
        frame.plot.width,
      )
    : legendDraft;

  if (showLegend && (legend.height !== legendDraft.height || LEGEND_BELOW)) {
    if (legend.height !== legendDraft.height) {
      frame = layoutFrame({
        yTickLabels,
        categoryLabels,
        legendHeight: legend.height,
        rightMin,
        axisTitles: namedAxes,
      });
    }
    // After frame is final: place under plot (or keep title-band Y).
    // Under plot: after x ticks, clamped into the bottom legend reserve.
    const y = LEGEND_BELOW
      ? Math.max(
          frame.plot.bottom + TYPE.tick.size + 16,
          frame.height - legend.height,
        )
      : TITLE_BASELINE + 18;
    legend = layoutLegend(
      series,
      styles.map((s) => s.color),
      styles.map((s) => s.opacity),
      frame.plot.left,
      y,
      frame.plot.width,
    );
  }

  const plot = frame.plot;
  const nCat = Math.max(histMode ? bins.length : categories.length, 1);
  const catStep = plot.width / nCat;
  const nS = Math.max(series.length, 1);
  const barSeriesCount = stacking && chart.type === "bar" ? 1 : nS;
  const barW = typicalBarWidth(nCat, barSeriesCount, catStep);
  const labelBars =
    (chart.type === "bar" || chart.type === "hist") &&
    showBarValueLabels(nCat, barW);
  const showInteriorGrid =
    chart.type === "bar" || chart.type === "hist" ? !labelBars : true;

  const yScale = scaleLinear([yMin, yMax], [plot.bottom, plot.top]);
  const yTicks = yTickNums.map((n, i) => ({
    pos: yScale(n),
    label: yTickLabels[i] ?? formatNumber(n),
  }));

  let xScaleNum = scaleLinear([0, 1], [plot.left, plot.right]);
  let xTicks: { pos: number; label: string; show: boolean; lines: string[] }[] = [];
  const catCenter = (i: number) => plot.left + (i + 0.5) * catStep;
  const showAt = (i: number) => frame.show[i] ?? true;

  if (histMode && bins.length > 0) {
    const lo = bins[0]!.left;
    const hi = bins[bins.length - 1]!.right;
    xScaleNum = scaleLinear([lo, hi], [plot.left, plot.right]);
    const edges = bins.map((bin) => bin.left);
    edges.push(bins[bins.length - 1]!.right);
    const edgeLabels = labelTicks(edges);
    xTicks = edges.map((edge, i) => ({
      pos: xScaleNum(edge),
      label: edgeLabels[i] ?? formatNumber(edge),
      show: showAt(i),
      lines: [edgeLabels[i] ?? formatNumber(edge)],
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
    const xLabels = labelTicks(xTickNums);
    xTicks = xTickNums.map((n, i) => ({
      pos: xScaleNum(n),
      label: xLabels[i] ?? formatNumber(n),
      show: true,
      lines: [xLabels[i] ?? formatNumber(n)],
    }));
  } else {
    xTicks = categories.map((label, i) => ({
      pos: catCenter(i),
      label,
      show: showAt(i),
      lines: frame.labelLines[i] ?? [label],
    }));
  }

  return {
    rows,
    series,
    categories,
    linearX,
    layout,
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
    axisXTitle: namedAxes
      ? chart.type === "hist"
        ? `${chart.x} · Sturges bins`
        : chart.x
      : undefined,
    axisYTitle: namedAxes
      ? [
          chart.type === "hist" ? (chart.y ?? "count") : chart.y,
          chart.unit,
        ]
          .filter((part): part is string => Boolean(part))
          .join(" · ") || undefined
      : undefined,
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
  const { plot, xTicks, yTicks } = prepared;
  const lines: string[] = [];

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

  if (VERTICAL_GRID && prepared.xTicks.length > 0) {
    lines.push(
      `  <g ${attrs({
        fill: "none",
        stroke: INK,
        "stroke-opacity": HAIRLINE_OPACITY,
        "stroke-width": 1,
        "data-v-grid": "1",
      })}>`,
    );
    for (const tick of prepared.xTicks) {
      lines.push(
        `    <line ${attrs({
          x1: fmtPx(tick.pos),
          x2: fmtPx(tick.pos),
          y1: fmtPx(plot.top),
          y2: fmtPx(plot.bottom),
          "data-v-grid": "1",
        })}/>`,
      );
    }
    lines.push(`  </g>`);
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
    const display = tick.lines.length > 0 ? tick.lines : [tick.label];
    const lineH = TYPE.tick.size + 3;
    let widest = display[0] ?? "";
    for (const line of display) {
      if (textWidth(line, TYPE.tick.size) > textWidth(widest, TYPE.tick.size)) {
        widest = line;
      }
    }
    const placed = placeHorizontalLabel(
      tick.pos,
      widest,
      TYPE.tick.size,
      SVG_WIDTH,
      4,
    );
    const shown =
      placed.text === widest
        ? display
        : [placed.text];
    const body =
      shown.length === 1
        ? escapeXml(shown[0] ?? "")
        : shown
            .map((line, i) => {
              const dy = i === 0 ? 0 : lineH;
              return `<tspan x="${fmtPx(placed.x)}" dy="${dy}">${escapeXml(line)}</tspan>`;
            })
            .join("");
    lines.push(
      `    <text ${attrs({
        x: fmtPx(placed.x),
        y: fmtPx(plot.bottom + TYPE.tick.size),
        "text-anchor": placed.anchor,
        "font-size": TYPE.tick.size,
        "data-full-label": tick.label,
      })}><title>${escapeXml(tick.label)}</title>${body}</text>`,
    );
  }
  lines.push(`  </g>`);

  if (prepared.axisXTitle || prepared.axisYTitle) {
    lines.push(
      `  <g ${attrs({
        fill: TYPE.unit.fill,
        "font-size": TYPE.unit.size,
        "font-weight": TYPE.unit.weight,
        "data-axis-titles": "1",
      })}>`,
    );
    if (prepared.axisYTitle) {
      const cx = plot.left - TICK_TEXT_GAP - 14;
      const cy = (plot.top + plot.bottom) / 2;
      lines.push(
        `    <text ${attrs({
          x: fmtPx(cx),
          y: fmtPx(cy),
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          transform: `rotate(-90 ${fmtPx(cx)} ${fmtPx(cy)})`,
          "data-axis": "y",
        })}>${escapeXml(prepared.axisYTitle)}</text>`,
      );
    }
    if (prepared.axisXTitle) {
      lines.push(
        `    <text ${attrs({
          x: fmtPx((plot.left + plot.right) / 2),
          y: fmtPx(plot.bottom + TYPE.tick.size + 16),
          "text-anchor": "middle",
          "dominant-baseline": "hanging",
          "data-axis": "x",
        })}>${escapeXml(prepared.axisXTitle)}</text>`,
      );
    }
    lines.push(`  </g>`);
  }

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

function luminance(hex: string): number {
  const body = hex.replace("#", "");
  const n = Number.parseInt(body.length === 3 ? body.replace(/./g, "$&$&") : body, 16);
  if (!Number.isFinite(n)) {
    return 0;
  }
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ink that stays readable on a bar fill. */
function inkOnFill(fill: string): string {
  return luminance(fill) > 0.62 ? "#171717" : "#fafaf9";
}

/**
 * Place a value label outside the bar when it fits in the plot.
 * A bar that reaches the plot edge would otherwise draw through the title,
 * so that label moves inside the bar.
 */
function valueLabelPlacement(
  roundUp: boolean,
  y: number,
  h: number,
  y0: number,
  plotTop: number,
  plotBottom: number,
): { y: number; inside: boolean } {
  const outside = (() => {
    if (h >= BAR_LABEL_INSIDE_H) {
      return roundUp ? y - BAR_LABEL_OFFSET : y + h + BAR_LABEL_OFFSET + 8;
    }
    if (h < 8) {
      return roundUp ? y0 - BAR_LABEL_OFFSET : y0 + BAR_LABEL_OFFSET + 8;
    }
    return roundUp ? y + 12 : y + h - 6;
  })();
  const hitsTitle = roundUp && outside < plotTop + 2;
  const hitsBottom = !roundUp && outside > plotBottom - 2;
  if ((hitsTitle || hitsBottom) && h >= 16) {
    return {
      y: roundUp ? Math.min(y + 14, y + h - 6) : Math.max(y + h - 14, y + 6),
      inside: true,
    };
  }
  return { y: outside, inside: false };
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
    layout,
  } = prepared;
  const stacking = layout === "stacked" || layout === "percent";
  const nS = Math.max(series.length, 1);
  const nCat = categories.length;
  const y0 = yScale(0);
  const lines: string[] = [`  <g>`];
  const labels: string[] = [];
  const matrix = stacking
    ? segmentMatrix(rows, series, categories, layout === "percent")
    : null;

  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]!;
    if (stacking && matrix) {
      let base = 0;
      const { x, barW } = barSlot(nCat, 1, catStep, plot.left, ci, 0);
      for (let si = 0; si < series.length; si++) {
        const ser = series[si]!;
        const val = matrix[si]?.[ci];
        if (typeof val !== "number") {
          lines.push(
            `    <rect ${attrs({
              x: fmtPx(x),
              y: fmtPx(y0),
              width: fmtPx(barW),
              height: 0,
              fill: "none",
              "data-x": cat,
              "data-series": ser,
              "data-missing": "1",
              "data-layout": layout,
            })}/>`,
          );
          continue;
        }
        const yBottom = yScale(base);
        const yTop = yScale(base + val);
        const y = Math.min(yBottom, yTop);
        const h = Math.abs(yTop - yBottom);
        const style = styles[si]!;
        const roundUp = val >= 0;
        // Only round the outermost (top) segment away from baseline.
        const isOuter = si === series.length - 1;
        lines.push(
          `    <path ${attrs({
            d: roundedBarPath(x, y, barW, h, isOuter && roundUp),
            fill: style.color,
            "fill-opacity": style.opacity === 1 ? undefined : style.opacity,
            "data-x": cat,
            "data-series": ser,
            "data-y": String(val),
            "data-layout": layout,
          })}/>`,
        );
        base += val;
        if (!showValueLabels) {
          continue;
        }
        const text = formatNumber(val);
        const cx = x + barW / 2;
        const placed = valueLabelPlacement(roundUp, y, h, y0, plot.top, plot.bottom);
        labels.push(
          `    <text ${attrs({
            x: fmtPx(cx),
            y: fmtPx(placed.y),
            "text-anchor": "middle",
            "font-size": TYPE.value.size,
            "font-weight": TYPE.value.weight,
            fill: placed.inside ? inkOnFill(style.color) : TYPE.value.fill,
            "data-value-label": cat,
          })}>${escapeXml(text)}</text>`,
        );
      }
      continue;
    }

    for (let si = 0; si < series.length; si++) {
      const ser = series[si]!;
      const val = groupedValue(rows, ser, cat);
      const { x, barW } = barSlot(nCat, nS, catStep, plot.left, ci, si);
      const style = styles[si]!;
      if (val === null) {
        lines.push(
          `    <rect ${attrs({
            x: fmtPx(x),
            y: fmtPx(y0),
            width: fmtPx(barW),
            height: 0,
            fill: "none",
            "data-x": cat,
            "data-series": ser,
            "data-missing": "1",
          })}/>`,
        );
        continue;
      }
      if (val === 0) {
        lines.push(
          `    <line ${attrs({
            x1: fmtPx(x),
            x2: fmtPx(x + barW),
            y1: fmtPx(y0),
            y2: fmtPx(y0),
            stroke: style.color,
            "stroke-width": 2,
            "data-x": cat,
            "data-series": ser,
            "data-y": "0",
          })}/>`,
        );
        if (showValueLabels) {
          labels.push(
            `    <text ${attrs({
              x: fmtPx(x + barW / 2),
              y: fmtPx(y0 - BAR_LABEL_OFFSET),
              "text-anchor": "middle",
              "font-size": TYPE.value.size,
              "font-weight": TYPE.value.weight,
              fill: TYPE.value.fill,
              "data-value-label": cat,
            })}>0</text>`,
          );
        }
        continue;
      }
      const y1 = yScale(val);
      const y = Math.min(y0, y1);
      const h = Math.abs(y1 - y0);
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
      const placed = valueLabelPlacement(roundUp, y, h, y0, plot.top, plot.bottom);
      labels.push(
        `    <text ${attrs({
          x: fmtPx(cx),
          y: fmtPx(placed.y),
          "text-anchor": "middle",
          "font-size": TYPE.value.size,
          "font-weight": TYPE.value.weight,
          fill: placed.inside ? inkOnFill(style.color) : TYPE.value.fill,
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
  const stacking =
    prepared.layout === "stacked" || prepared.layout === "percent";
  if (stacking && prepared.categories.length > 0) {
    const matrix = segmentMatrix(
      prepared.rows,
      prepared.series,
      prepared.categories,
      prepared.layout === "percent",
    );
    const lastCi = prepared.categories.length - 1;
    let run = 0;
    for (let si = 0; si < prepared.series.length; si++) {
      run += matrix[si]![lastCi]!;
      out.push({
        name: prepared.series[si]!,
        x: prepared.catCenter(lastCi),
        y: prepared.yScale(run),
        color: prepared.styles[si]!.color,
      });
    }
    return out;
  }
  for (let si = 0; si < prepared.series.length; si++) {
    const ser = prepared.series[si]!;
    let last: { x: number; y: number } | undefined;
    for (const row of prepared.rows) {
      if (row.series !== ser || row.y === null) {
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
  const { rows, series, yScale, styles, layout, categories } = prepared;
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const stacking = layout === "stacked" || layout === "percent";
  const lines: string[] = [`  <g fill="none">`];

  if (stacking) {
    const matrix = segmentMatrix(rows, series, categories, layout === "percent");
    const cum: number[][] = series.map(() => categories.map(() => 0));
    for (let ci = 0; ci < categories.length; ci++) {
      let run = 0;
      for (let si = 0; si < series.length; si++) {
        const value = matrix[si]?.[ci];
        if (typeof value === "number") {
          run += value;
        }
        const cumRow = cum[si];
        if (cumRow) {
          cumRow[ci] = typeof value === "number" ? run : Number.NaN;
        }
      }
    }
    for (let si = 0; si < series.length; si++) {
      const ser = series[si]!;
      const style = styles[si]!;
      const topPts: { x: number; y: number }[] = [];
      const botPts: { x: number; y: number }[] = [];
      for (let ci = 0; ci < categories.length; ci++) {
        const top = cum[si]![ci];
        if (top === undefined || Number.isNaN(top)) {
          topPts.push({ x: Number.NaN, y: Number.NaN });
          botPts.push({ x: Number.NaN, y: Number.NaN });
          continue;
        }
        const x = prepared.catCenter(ci);
        const bot = si === 0 ? 0 : (cum[si - 1]![ci] ?? 0);
        const botValue = Number.isNaN(bot) ? 0 : bot;
        topPts.push({ x, y: yScale(top) });
        botPts.push({ x, y: yScale(botValue) });
      }
      const topRuns = finiteRuns(topPts);
      const botRuns = finiteRuns(botPts);
      if (topRuns.length === 0) {
        continue;
      }
      if (area) {
        for (let r = 0; r < topRuns.length; r++) {
          const top = topRuns[r]!;
          const bot = botRuns[r] ?? [];
          const revBot = [...bot].reverse();
          const fillPts = [...top, ...revBot];
          if (fillPts.length < 2) {
            continue;
          }
          const d = `${polyline(fillPts)} Z`;
          lines.push(
            `    <path ${attrs({
              d,
              fill: style.color,
              "fill-opacity": AREA_OPACITY * style.opacity,
              stroke: "none",
              "data-series": ser,
              "data-layout": layout,
            })}/>`,
          );
        }
      }
      for (const pts of topRuns) {
        const d = polyline(pts);
        lines.push(
          `    <path ${attrs({
            d,
            fill: "none",
            stroke: style.color,
            "stroke-width": LINE_STROKE,
            "stroke-linejoin": "round",
            "stroke-linecap": "round",
            "stroke-dasharray": seriesDash(si),
            "stroke-opacity": opacityAttr(style.opacity),
            "data-series": ser,
            "data-layout": layout,
          })}/>`,
        );
      }
      const finiteTop = topRuns.flat();
      if (finiteTop.length <= POINT_SKIP_AFTER) {
        for (const pt of finiteTop) {
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

  const zero = yScale(0);
  for (let si = 0; si < series.length; si++) {
    const ser = series[si]!;
    const runs: { x: number; y: number }[][] = [];
    let run: { x: number; y: number }[] = [];
    for (const row of rows) {
      if (row.series !== ser) {
        continue;
      }
      if (row.y === null) {
        if (run.length > 0) {
          runs.push(run);
          run = [];
        }
        continue;
      }
      run.push({ x: xPos(prepared, row, catIndex), y: yScale(row.y) });
    }
    if (run.length > 0) {
      runs.push(run);
    }
    if (runs.length === 0) {
      continue;
    }
    const style = styles[si]!;
    const dash = seriesDash(si);
    for (const pts of runs) {
      const d = polyline(pts);
      if (area && pts.length > 0) {
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
          "stroke-dasharray": dash,
          "stroke-opacity": opacityAttr(style.opacity),
          "data-series": ser,
        })}/>`,
      );
    }
    const pointCount = runs.reduce((sum, pts) => sum + pts.length, 0);
    if (pointCount <= POINT_SKIP_AFTER) {
      for (const pts of runs) {
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
  }
  lines.push(`  </g>`);
  lines.push(...drawEndLabels(prepared));
  return lines;
}

function drawScatter(prepared: Prepared): string[] {
  const { rows, series, yScale, styles } = prepared;
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const styleOf = new Map(series.map((name, i) => [name, styles[i]!]));
  const ring = SCATTER_MARK === "ring";
  const lines: string[] = [`  <g>`];
  for (const row of rows) {
    if (row.y === null) {
      continue;
    }
    if (row.xNum === undefined && prepared.linearX) {
      continue;
    }
    const cx = xPos(prepared, row, catIndex);
    const cy = yScale(row.y);
    const style = styleOf.get(row.series) ?? styles[0]!;
    const seriesIndex = Math.max(0, series.indexOf(row.series));
    const shape = (["circle", "square", "triangle"] as const)[seriesIndex % 3]!;
    if (shape === "square") {
      const s = SCATTER_R * 2;
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(cx - SCATTER_R),
          y: fmtPx(cy - SCATTER_R),
          width: fmtPx(s),
          height: fmtPx(s),
          fill: style.color,
          "fill-opacity": SCATTER_OPACITY * style.opacity,
          "data-x": row.xLabel,
          "data-y": formatNumber(row.y),
          "data-series": row.series,
          "data-scatter-mark": "square",
        })}/>`,
      );
      continue;
    }
    if (shape === "triangle") {
      const r = SCATTER_R + 1;
      const d = `M${fmtPx(cx)} ${fmtPx(cy - r)} L${fmtPx(cx + r)} ${fmtPx(cy + r)} L${fmtPx(cx - r)} ${fmtPx(cy + r)} Z`;
      lines.push(
        `    <path ${attrs({
          d,
          fill: style.color,
          "fill-opacity": SCATTER_OPACITY * style.opacity,
          "data-x": row.xLabel,
          "data-y": formatNumber(row.y),
          "data-series": row.series,
          "data-scatter-mark": "triangle",
        })}/>`,
      );
      continue;
    }
    if (ring) {
      lines.push(
        `    <circle ${attrs({
          cx: fmtPx(cx),
          cy: fmtPx(cy),
          r: SCATTER_R,
          fill: PLOT_BG ?? "none",
          stroke: style.color,
          "stroke-width": 1.5,
          "stroke-opacity": SCATTER_OPACITY * style.opacity,
          "data-x": row.xLabel,
          "data-y": String(row.y),
          "data-series": row.series,
          "data-scatter-mark": "ring",
        })}/>`,
      );
    } else {
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
    const placed = valueLabelPlacement(
      roundUp,
      y,
      h,
      y0,
      prepared.plot.top,
      prepared.plot.bottom,
    );
    labels.push(
      `    <text ${attrs({
        x: fmtPx(x + barW / 2),
        y: fmtPx(placed.y),
        "text-anchor": "middle",
        "font-size": TYPE.value.size,
        "font-weight": TYPE.value.weight,
        fill: placed.inside ? inkOnFill(style.color) : TYPE.value.fill,
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
