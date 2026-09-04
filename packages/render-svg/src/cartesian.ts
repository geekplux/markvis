import type { ChartIR } from "@markvis/ir";
import {
  categoryNames,
  groupedValue,
  loadRows,
  seriesNames,
  usesLinearX,
  type DataRow,
} from "./data.js";
import { drawTitle } from "./figure.js";
import { binHistogram, histSamplesFromChart, type HistBin } from "./hist.js";
import {
  cartesianMargins,
  categoryLayout,
  layoutLegend,
  SVG_HEIGHT,
  SVG_WIDTH,
  type CategoryLayout,
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
import {
  AREA_OPACITY,
  AXIS,
  BAR_GAP,
  BAR_LABEL_INSIDE_H,
  BAR_LABEL_MIN_WIDTH,
  BAR_LABEL_OFFSET,
  BAR_RX,
  GROUP_GAP_PX,
  HAIRLINE,
  LABEL_ROTATE_DEG,
  LINE_POINT_R,
  LINE_STROKE,
  POINT_SKIP_AFTER,
  SCATTER_OPACITY,
  SCATTER_R,
  TICK_MARK,
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
  yAxisTitle: string;
  xAxisTitle: string;
  rotateX: boolean;
  bins: HistBin[];
  compact: CompactScale | null;
  titleUnit: string | undefined;
  styles: { color: string; opacity: number }[];
};

function fieldYAxisTitle(chart: ChartIR): string {
  if (chart.type === "hist") {
    return chart.y ?? "count";
  }
  return chart.y ?? "";
}

function polyline(points: { x: number; y: number }[]): string {
  return points
    .map((point, i) => {
      const cmd = i === 0 ? "M" : "L";
      return `${cmd}${fmtPx(point.x)} ${fmtPx(point.y)}`;
    })
    .join(" ");
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
  const showLegend = !histMode && series.length > 1;
  const legendDraft = showLegend
    ? layoutLegend(
        series,
        styles.map((s) => s.color),
        styles.map((s) => s.opacity),
        72,
        TITLE_BASELINE + 22,
        SVG_WIDTH - 96,
      )
    : { items: [], height: 0 };

  const yTitle = fieldYAxisTitle(chart);
  const xTitle = chart.x;

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

  const draftMargins = cartesianMargins({
    yTickLabels,
    xLabels: linearX && !histMode ? ["0"] : categories,
    yAxisTitle: yTitle,
    xAxisTitle: xTitle,
    legendHeight: legendDraft.height,
    rotateX: false,
  });
  const draftWidth = SVG_WIDTH - draftMargins.left - draftMargins.right;
  const nCat = Math.max(categories.length, 1);
  const draftStep = draftWidth / nCat;
  const catLay: CategoryLayout =
    linearX && !histMode
      ? { rotate: false, show: categories.map(() => true) }
      : categoryLayout(
          xLabelTexts.length ? xLabelTexts : categories,
          draftStep,
        );

  const margins = cartesianMargins({
    yTickLabels,
    xLabels: linearX && !histMode ? ["0"] : categories,
    yAxisTitle: yTitle,
    xAxisTitle: xTitle,
    legendHeight: legendDraft.height,
    rotateX: catLay.rotate,
  });

  const plot: PlotBox = {
    left: margins.left,
    right: SVG_WIDTH - margins.right,
    top: margins.top,
    bottom: SVG_HEIGHT - margins.bottom,
    width: SVG_WIDTH - margins.left - margins.right,
    height: SVG_HEIGHT - margins.top - margins.bottom,
  };

  const legend = showLegend
    ? layoutLegend(
        series,
        styles.map((s) => s.color),
        styles.map((s) => s.opacity),
        plot.left,
        TITLE_BASELINE + 22,
        plot.width,
      )
    : legendDraft;

  if (legend.height !== legendDraft.height && showLegend) {
    const remargins = cartesianMargins({
      yTickLabels,
      xLabels: linearX && !histMode ? ["0"] : categories,
      yAxisTitle: yTitle,
      xAxisTitle: xTitle,
      legendHeight: legend.height,
      rotateX: catLay.rotate,
    });
    plot.top = remargins.top;
    plot.height = plot.bottom - plot.top;
  }

  const yScale = scaleLinear([yMin, yMax], [plot.bottom, plot.top]);
  const yTicks = yTickNums.map((n) => ({
    pos: yScale(n),
    label: formatTick(n, compact),
  }));

  let xScaleNum = scaleLinear([0, 1], [plot.left, plot.right]);
  let xTicks: { pos: number; label: string; show: boolean }[] = [];
  const catStep = plot.width / nCat;
  const catCenter = (i: number) => plot.left + (i + 0.5) * catStep;
  const showAt = (i: number) => catLay.show[i] ?? true;

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
    yAxisTitle: yTitle,
    xAxisTitle: xTitle,
    rotateX: catLay.rotate,
    bins,
    compact,
    titleUnit: unitWithCompact(chart.unit, compact),
    styles,
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

function drawGridAndAxes(prepared: Prepared): string[] {
  const { plot, xTicks, yTicks, rotateX, yAxisTitle, xAxisTitle } = prepared;
  const lines: string[] = [];
  lines.push(
    `  <g ${attrs({ fill: "none", stroke: HAIRLINE, "stroke-width": 1 })}>`,
  );
  for (const tick of yTicks) {
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

  lines.push(
    `  <path ${attrs({
      d: `M${fmtPx(plot.left)} ${fmtPx(plot.top)} L${fmtPx(plot.left)} ${fmtPx(plot.bottom)} L${fmtPx(plot.right)} ${fmtPx(plot.bottom)}`,
      fill: "none",
      stroke: AXIS,
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
        stroke: AXIS,
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
      `    <line ${attrs({
        x1: fmtPx(plot.left - TICK_MARK),
        x2: fmtPx(plot.left),
        y1: fmtPx(tick.pos),
        y2: fmtPx(tick.pos),
        stroke: AXIS,
      })}/>`,
    );
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
    lines.push(
      `    <line ${attrs({
        x1: fmtPx(tick.pos),
        x2: fmtPx(tick.pos),
        y1: fmtPx(plot.bottom),
        y2: fmtPx(plot.bottom + TICK_MARK),
        stroke: AXIS,
      })}/>`,
    );
    if (!tick.show) {
      continue;
    }
    if (rotateX) {
      const tx = fmtPx(tick.pos);
      const ty = fmtPx(plot.bottom + 10);
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
          y: fmtPx(plot.bottom + 16),
          "text-anchor": "middle",
          "font-size": TYPE.tick.size,
          "data-full-label": tick.label,
        })}>${escapeXml(tick.label)}</text>`,
      );
    }
  }
  lines.push(`  </g>`);

  if (yAxisTitle) {
    const cx = 12;
    const cy = (plot.top + plot.bottom) / 2;
    lines.push(
      `  <text ${attrs({
        x: fmtPx(cx),
        y: fmtPx(cy),
        "text-anchor": "middle",
        "font-size": TYPE.axisName.size,
        "font-weight": TYPE.axisName.weight,
        fill: TYPE.axisName.fill,
        transform: `rotate(-90 ${fmtPx(cx)} ${fmtPx(cy)})`,
      })}>${escapeXml(yAxisTitle)}</text>`,
    );
  }
  if (xAxisTitle) {
    lines.push(
      `  <text ${attrs({
        x: fmtPx((plot.left + plot.right) / 2),
        y: SVG_HEIGHT - 12,
        "text-anchor": "middle",
        "font-size": TYPE.axisName.size,
        "font-weight": TYPE.axisName.weight,
        fill: TYPE.axisName.fill,
      })}>${escapeXml(xAxisTitle)}</text>`,
    );
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
  if (roundAwayFromBaselineUp) {
    return `M${x0} ${y1} L${x0} ${fmtPx(y + r)} Q${x0} ${y0} ${fmtPx(x + r)} ${y0} L${fmtPx(x + w - r)} ${y0} Q${x1} ${y0} ${x1} ${fmtPx(y + r)} L${x1} ${y1} Z`;
  }
  return `M${x0} ${y0} L${x1} ${y0} L${x1} ${fmtPx(y + h - r)} Q${x1} ${y1} ${fmtPx(x + w - r)} ${y1} L${fmtPx(x + r)} ${y1} Q${x0} ${y1} ${x0} ${fmtPx(y + h - r)} Z`;
}

function drawBars(prepared: Prepared): string[] {
  const { plot, series, categories, rows, catStep, yScale, styles } = prepared;
  const nS = Math.max(series.length, 1);
  const bandGap = catStep * BAR_GAP;
  const inner = Math.max(catStep - bandGap, 1);
  const seriesGap = nS > 1 ? GROUP_GAP_PX : 0;
  const barW = Math.max(0.5, (inner - seriesGap * (nS - 1)) / nS);
  const y0 = yScale(0);
  const lines: string[] = [`  <g>`];
  const labels: string[] = [];
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]!;
    for (let si = 0; si < series.length; si++) {
      const ser = series[si]!;
      const val = groupedValue(rows, ser, cat);
      const x = plot.left + ci * catStep + bandGap / 2 + si * (barW + seriesGap);
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
      if (barW < BAR_LABEL_MIN_WIDTH) {
        continue;
      }
      const text = formatNumber(val);
      const cx = x + barW / 2;
      let ly: number;
      if (h < 12) {
        ly = roundUp ? y - BAR_LABEL_OFFSET : y + h + BAR_LABEL_OFFSET + 8;
      } else if (h < BAR_LABEL_INSIDE_H) {
        ly = roundUp ? y + 12 : y + h - 6;
      } else {
        ly = roundUp ? y - BAR_LABEL_OFFSET : y + h + BAR_LABEL_OFFSET + 8;
      }
      if (roundUp && ly < plot.top + 10 && h >= 12) {
        ly = y + 12;
      }
      if (!roundUp && ly > plot.bottom - 4 && h >= 12) {
        ly = y + h - 6;
      }
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
  const { bins, xScaleNum, yScale, styles } = prepared;
  const y0 = yScale(0);
  const style = styles[0]!;
  const lines: string[] = [`  <g>`];
  for (const bin of bins) {
    const xLeft = xScaleNum(bin.left);
    const xRight = xScaleNum(bin.right);
    const band = xRight - xLeft;
    const gap = band * BAR_GAP;
    const barW = Math.max(band - gap, 0.5);
    const x = xLeft + gap / 2;
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
  }
  lines.push(`  </g>`);
  return lines;
}

export function renderCartesian(chart: ChartIR, _id: string): string[] {
  const prepared = prepare(chart);
  const lines: string[] = [
    drawTitle(chart, prepared.titleUnit),
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
  return lines;
}
