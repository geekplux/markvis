import type { ChartIR } from "@markvis/ir";
import {
  categoryNames,
  groupedValue,
  loadRows,
  seriesNames,
  usesLinearX,
  type DataRow,
} from "./data.js";
import { binHistogram, histSamplesFromChart, type HistBin } from "./hist.js";
import {
  cartesianMargins,
  layoutLegend,
  shouldRotateX,
  SVG_HEIGHT,
  SVG_WIDTH,
  type PlotBox,
} from "./layout.js";
import { seriesColor } from "./palette.js";
import {
  formatNumber,
  niceTicks,
  scaleLinear,
  xExtent,
  yExtent,
} from "./scale.js";
import { truncateLabel } from "./text.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

type Prepared = {
  rows: DataRow[];
  series: string[];
  categories: string[];
  linearX: boolean;
  xTicks: { pos: number; label: string }[];
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
};

function yAxisTitle(chart: ChartIR): string {
  const base = chart.type === "hist" ? (chart.y ?? "count") : (chart.y ?? "");
  if (base && chart.unit && chart.unit !== base) {
    return `${base} (${chart.unit})`;
  }
  if (base) {
    return base;
  }
  return chart.unit ?? "";
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
  const series = histMode
    ? [chart.y ?? "count"]
    : seriesNames(rows);
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
  const yTickLabels = yTickNums.map((n) => formatNumber(n));

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
  const rotateX = shouldRotateX(
    linearX && !histMode ? ["0000"] : xLabelTexts.length ? xLabelTexts : categories,
  );

  const showLegend =
    !histMode && (series.length > 1 || chart.series !== undefined);
  const legendColors = series.map((_, i) => seriesColor(i));
  const legendDraft = showLegend
    ? layoutLegend(series, legendColors, 72, 40, SVG_WIDTH - 96)
    : { items: [], height: 0 };

  const yTitle = yAxisTitle(chart);
  const xTitle = chart.x;
  const margins = cartesianMargins({
    yTickLabels,
    xLabels: linearX && !histMode ? ["0"] : categories,
    yAxisTitle: yTitle,
    xAxisTitle: xTitle,
    legendHeight: legendDraft.height,
    rotateX: linearX && !histMode ? false : rotateX,
  });

  const plot: PlotBox = {
    left: margins.left,
    right: SVG_WIDTH - margins.right,
    top: margins.top,
    bottom: SVG_HEIGHT - margins.bottom,
    width: SVG_WIDTH - margins.left - margins.right,
    height: SVG_HEIGHT - margins.top - margins.bottom,
  };

  const legend =
    showLegend
      ? layoutLegend(
          series,
          legendColors,
          plot.left,
          40,
          plot.width,
        )
      : legendDraft;

  const yScale = scaleLinear([yMin, yMax], [plot.bottom, plot.top]);
  const yTicks = yTickNums.map((n) => ({
    pos: yScale(n),
    label: formatNumber(n),
  }));

  let xScaleNum = scaleLinear([0, 1], [plot.left, plot.right]);
  let xTicks: { pos: number; label: string }[] = [];
  const nCat = Math.max(categories.length, 1);
  const catStep = plot.width / nCat;
  const catCenter = (i: number) => plot.left + (i + 0.5) * catStep;

  if (histMode && bins.length > 0) {
    const lo = bins[0]!.left;
    const hi = bins[bins.length - 1]!.right;
    xScaleNum = scaleLinear([lo, hi], [plot.left, plot.right]);
    const edges = bins.map((bin) => bin.left);
    edges.push(bins[bins.length - 1]!.right);
    xTicks = edges.map((edge) => ({
      pos: xScaleNum(edge),
      label: formatNumber(edge),
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
    }));
  } else {
    xTicks = categories.map((label, i) => ({
      pos: catCenter(i),
      label,
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
    rotateX: linearX && !histMode ? false : rotateX,
    bins,
  };
}

function drawTitle(chart: ChartIR): string {
  return `  <text ${attrs({
    x: SVG_WIDTH / 2,
    y: 24,
    "text-anchor": "middle",
    "font-size": 16,
    "font-weight": 600,
    fill: "#111111",
  })}>${escapeXml(chart.title)}</text>`;
}

function drawLegend(prepared: Prepared): string[] {
  if (prepared.legend.items.length === 0) {
    return [];
  }
  const lines: string[] = [`  <g ${attrs({ "font-size": 11, fill: "#222222" })}>`];
  for (const item of prepared.legend.items) {
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(item.x),
        y: fmtPx(item.y - 9),
        width: 10,
        height: 10,
        fill: item.color,
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
  lines.push(`  <g ${attrs({ fill: "none", stroke: "#e6e6e6", "stroke-width": 1 })}>`);
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
  if (prepared.linearX) {
    for (const tick of xTicks) {
      lines.push(
        `    <line ${attrs({
          x1: fmtPx(tick.pos),
          x2: fmtPx(tick.pos),
          y1: fmtPx(plot.top),
          y2: fmtPx(plot.bottom),
        })}/>`,
      );
    }
  }
  lines.push(`  </g>`);

  lines.push(
    `  <path ${attrs({
      d: `M${fmtPx(plot.left)} ${fmtPx(plot.top)} L${fmtPx(plot.left)} ${fmtPx(plot.bottom)} L${fmtPx(plot.right)} ${fmtPx(plot.bottom)}`,
      fill: "none",
      stroke: "#444444",
      "stroke-width": 1,
    })}/>`,
  );

  lines.push(`  <g ${attrs({ fill: "#333333", "font-size": 10 })}>`);
  for (const tick of yTicks) {
    lines.push(
      `    <line ${attrs({
        x1: fmtPx(plot.left - 4),
        x2: fmtPx(plot.left),
        y1: fmtPx(tick.pos),
        y2: fmtPx(tick.pos),
        stroke: "#444444",
      })}/>`,
    );
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.left - 8),
        y: fmtPx(tick.pos),
        "text-anchor": "end",
        "dominant-baseline": "middle",
      })}>${escapeXml(tick.label)}</text>`,
    );
  }
  const xFont = rotateX ? 9 : 10;
  for (const tick of xTicks) {
    lines.push(
      `    <line ${attrs({
        x1: fmtPx(tick.pos),
        x2: fmtPx(tick.pos),
        y1: fmtPx(plot.bottom),
        y2: fmtPx(plot.bottom + 4),
        stroke: "#444444",
      })}/>`,
    );
    const maxPx = rotateX ? 110 : Math.max(24, prepared.catStep - 4);
    const shown = truncateLabel(tick.label, maxPx, xFont);
    if (rotateX) {
      const tx = fmtPx(tick.pos);
      const ty = fmtPx(plot.bottom + 10);
      lines.push(
        `    <text ${attrs({
          x: tx,
          y: ty,
          "text-anchor": "end",
          "dominant-baseline": "middle",
          "font-size": xFont,
          transform: `rotate(-55 ${tx} ${ty})`,
          "data-full-label": tick.label,
        })}>${escapeXml(shown)}</text>`,
      );
    } else {
      lines.push(
        `    <text ${attrs({
          x: fmtPx(tick.pos),
          y: fmtPx(plot.bottom + 16),
          "text-anchor": "middle",
          "font-size": xFont,
          "data-full-label": tick.label,
        })}>${escapeXml(shown)}</text>`,
      );
    }
  }
  lines.push(`  </g>`);

  if (yAxisTitle) {
    const cx = 14;
    const cy = (plot.top + plot.bottom) / 2;
    lines.push(
      `  <text ${attrs({
        x: fmtPx(cx),
        y: fmtPx(cy),
        "text-anchor": "middle",
        "font-size": 11,
        fill: "#444444",
        transform: `rotate(-90 ${fmtPx(cx)} ${fmtPx(cy)})`,
      })}>${escapeXml(yAxisTitle)}</text>`,
    );
  }
  if (xAxisTitle) {
    lines.push(
      `  <text ${attrs({
        x: fmtPx((plot.left + plot.right) / 2),
        y: SVG_HEIGHT - 10,
        "text-anchor": "middle",
        "font-size": 11,
        fill: "#444444",
      })}>${escapeXml(xAxisTitle)}</text>`,
    );
  }
  return lines;
}

function drawBars(prepared: Prepared): string[] {
  const { plot, series, categories, rows, catStep, yScale } = prepared;
  const nS = Math.max(series.length, 1);
  const groupPad = catStep * 0.22;
  const inner = Math.max(catStep - groupPad, 1);
  const barW = inner / nS;
  const lines: string[] = [`  <g ${attrs({ "shape-rendering": "crispEdges" })}>`];
  for (let ci = 0; ci < categories.length; ci++) {
    const cat = categories[ci]!;
    for (let si = 0; si < series.length; si++) {
      const ser = series[si]!;
      const val = groupedValue(rows, ser, cat);
      const x = plot.left + ci * catStep + groupPad / 2 + si * barW;
      const y0 = yScale(0);
      const y1 = yScale(val);
      const y = Math.min(y0, y1);
      const h = Math.abs(y1 - y0);
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(x),
          y: fmtPx(y),
          width: fmtPx(Math.max(barW - 1, 0.5)),
          height: fmtPx(h),
          fill: seriesColor(si),
          "data-x": cat,
          "data-series": ser,
          "data-y": String(val),
        })}/>`,
      );
    }
  }
  lines.push(`  </g>`);
  return lines;
}

function xPos(prepared: Prepared, row: DataRow, catIndex: Map<string, number>): number {
  if (prepared.linearX && row.xNum !== undefined) {
    return prepared.xScaleNum(row.xNum);
  }
  const i = catIndex.get(row.xLabel) ?? 0;
  return prepared.catCenter(i);
}

function drawLineOrArea(
  prepared: Prepared,
  area: boolean,
): string[] {
  const { rows, series, yScale } = prepared;
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
    const color = seriesColor(si);
    const d = polyline(pts);
    if (area) {
      const first = pts[0]!;
      const last = pts[pts.length - 1]!;
      const fillD = `${d} L${fmtPx(last.x)} ${fmtPx(zero)} L${fmtPx(first.x)} ${fmtPx(zero)} Z`;
      lines.push(
        `    <path ${attrs({
          d: fillD,
          fill: color,
          "fill-opacity": 0.28,
          stroke: "none",
          "data-series": ser,
        })}/>`,
      );
    }
    lines.push(
      `    <path ${attrs({
        d,
        fill: "none",
        stroke: color,
        "stroke-width": 2,
        "stroke-linejoin": "round",
        "stroke-linecap": "round",
        "data-series": ser,
      })}/>`,
    );
  }
  lines.push(`  </g>`);
  return lines;
}

function drawScatter(prepared: Prepared): string[] {
  const { rows, series, yScale } = prepared;
  const catIndex = new Map(prepared.categories.map((c, i) => [c, i]));
  const colorOf = new Map(series.map((name, i) => [name, seriesColor(i)]));
  const lines: string[] = [`  <g>`];
  for (const row of rows) {
    if (row.xNum === undefined && prepared.linearX) {
      continue;
    }
    const cx = xPos(prepared, row, catIndex);
    const cy = yScale(row.y);
    lines.push(
      `    <circle ${attrs({
        cx: fmtPx(cx),
        cy: fmtPx(cy),
        r: 4,
        fill: colorOf.get(row.series) ?? seriesColor(0),
        stroke: "#ffffff",
        "stroke-width": 1,
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
  const { bins, xScaleNum, yScale } = prepared;
  const y0 = yScale(0);
  const color = seriesColor(0);
  const lines: string[] = [`  <g ${attrs({ "shape-rendering": "crispEdges" })}>`];
  for (const bin of bins) {
    const x = xScaleNum(bin.left);
    const x2 = xScaleNum(bin.right);
    const y1 = yScale(bin.weight);
    const y = Math.min(y0, y1);
    const h = Math.abs(y1 - y0);
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(x),
        y: fmtPx(y),
        width: fmtPx(Math.max(x2 - x - 0.5, 0.5)),
        height: fmtPx(h),
        fill: color,
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
  const lines: string[] = [drawTitle(chart), ...drawLegend(prepared)];
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
