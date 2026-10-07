import type { ChartIR } from "@markvis/ir";
import { drawTitle, reserveTitle, visibleTitle } from "./figure.js";
import { layoutLegend, titleBlockTop, type LegendLayout, type PlotBox } from "./layout.js";
import { legendSwatch } from "./legend.js";
import { formatNumber, labelTicks, niceTicks, scaleLinear } from "./scale.js";
import { textWidth, wrapText, type WrappedText } from "./text.js";
import {
  FONT_NUMERIC,
  GRID,
  HAIRLINE_OPACITY,
  INK,
  MARGIN,
  PAPER,
  STRUCTURE_OPACITY,
  SVG_WIDTH,
  TICK_TEXT_GAP,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

/** One row per category, a shared value axis along the bottom. */
export type RowFrame = {
  title: string;
  plot: PlotBox;
  height: number;
  rowH: number;
  domain: [number, number];
  ticks: number[];
  tickLabels: string[];
  xScale: (value: number) => number;
  wrapped: WrappedText[];
  legend: LegendLayout;
  legendMarks: RowOptions["legendMarks"];
};

export type RowOptions = {
  categories: string[];
  /** Value domain. Ticks inside it are labeled; the ends are the plot edges. */
  domain: [number, number];
  /** Labeled ticks; nice ticks of the domain when omitted. */
  ticks?: number[];
  /** Room right of the plot for per-row labels. */
  rightPad: number;
  legendNames: string[];
  legendColors: string[];
  /** Draw the legend key as the mark itself instead of the theme swatch. */
  legendMarks?: readonly ("hollow" | "filled" | "rule")[] | undefined;
};

/** Nice ticks and the domain they span, from data that may or may not include zero. */
export function niceDomain(values: number[], includeZero: boolean): {
  domain: [number, number];
  ticks: number[];
} {
  const finite = values.filter((value) => Number.isFinite(value));
  let lo = finite.length > 0 ? Math.min(...finite) : 0;
  let hi = finite.length > 0 ? Math.max(...finite) : 1;
  if (includeZero) {
    lo = Math.min(lo, 0);
    hi = Math.max(hi, 0);
  }
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const ticks = niceTicks(lo, hi);
  return {
    domain: [ticks[0] ?? lo, ticks[ticks.length - 1] ?? hi],
    ticks,
  };
}

export function layoutRows(chart: ChartIR, opts: RowOptions): RowFrame {
  const labelBudget = Math.min(220, Math.max(96, SVG_WIDTH * 0.34));
  const wrapped = opts.categories.map((label) =>
    wrapText(label, TYPE.tick.size, labelBudget, 3, TYPE.tick.weight),
  );
  const labelW = Math.max(
    40,
    ...wrapped.map((item) =>
      Math.max(0, ...item.lines.map((line) => textWidth(line, TYPE.tick.size, TYPE.tick.weight))),
    ),
  );
  const rowH = Math.max(
    34,
    ...wrapped.map((item) => item.lines.length * (TYPE.tick.size + 3) + 12),
  );
  const legend =
    opts.legendNames.length > 0
      ? layoutLegend(
          opts.legendNames,
          opts.legendColors,
          opts.legendNames.map(() => 1),
          MARGIN.left,
          0,
          SVG_WIDTH - MARGIN.left - MARGIN.right,
        )
      : { items: [], height: 0 };

  const left = Math.max(MARGIN.left, labelW + TICK_TEXT_GAP + 6);
  const right = Math.max(MARGIN.right, opts.rightPad);
  reserveTitle(visibleTitle(chart), MARGIN.left, chart.unit);
  const top = titleBlockTop(0);
  const title = drawTitle(visibleTitle(chart), MARGIN.left, chart.unit);
  const bottomPad =
    TYPE.tick.size + 24 + (legend.height > 0 ? legend.height + 12 : 0);
  const height = Math.max(
    160,
    Math.ceil(top + Math.max(opts.categories.length, 1) * rowH + bottomPad),
  );
  const plot: PlotBox = {
    left,
    right: SVG_WIDTH - right,
    top,
    bottom: height - bottomPad,
    width: SVG_WIDTH - left - right,
    height: height - top - bottomPad,
  };
  const ticks = (opts.ticks ?? niceTicks(opts.domain[0], opts.domain[1])).filter(
    (tick) => tick >= opts.domain[0] && tick <= opts.domain[1],
  );
  const placedLegend =
    legend.height > 0
      ? layoutLegend(
          opts.legendNames,
          opts.legendColors,
          opts.legendNames.map(() => 1),
          plot.left,
          plot.bottom + TYPE.tick.size + 30,
          plot.width,
        )
      : legend;
  return {
    title,
    plot,
    height,
    rowH,
    domain: opts.domain,
    ticks,
    tickLabels: labelTicks(ticks),
    xScale: scaleLinear(opts.domain, [plot.left, plot.right]),
    wrapped,
    legend: placedLegend,
    legendMarks: opts.legendMarks,
  };
}

/** Grid at value ticks, a zero rule when zero is inside, row labels, tick labels, legend. */
export function drawRowAxes(frame: RowFrame, categories: string[]): string[] {
  const { plot, ticks, xScale } = frame;
  const lines: string[] = [
    `  <g ${attrs({
      fill: "none",
      stroke: INK,
      "stroke-opacity": HAIRLINE_OPACITY,
      "stroke-width": GRID.width,
      "stroke-dasharray": GRID.dash || undefined,
    })}>`,
  ];
  for (const tick of ticks) {
    if (tick === 0) {
      continue;
    }
    const px = fmtPx(xScale(tick));
    lines.push(
      `    <line ${attrs({ x1: px, x2: px, y1: fmtPx(plot.top), y2: fmtPx(plot.bottom) })}/>`,
    );
  }
  lines.push(`  </g>`);
  if (frame.domain[0] <= 0 && frame.domain[1] >= 0) {
    const zero = fmtPx(xScale(0));
    lines.push(
      `  <line ${attrs({
        x1: zero,
        x2: zero,
        y1: fmtPx(plot.top),
        y2: fmtPx(plot.bottom),
        stroke: INK,
        "stroke-opacity": STRUCTURE_OPACITY,
        "stroke-width": 1,
        "data-baseline": "0",
      })}/>`,
    );
  }
  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-family": FONT_NUMERIC,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  const lineH = TYPE.tick.size + 3;
  for (let i = 0; i < categories.length; i++) {
    const full = categories[i]!;
    const item = frame.wrapped[i]!;
    const cy = plot.top + (i + 0.5) * frame.rowH;
    const startY = cy - ((item.lines.length - 1) * lineH) / 2;
    const x = fmtPx(plot.left - TICK_TEXT_GAP);
    const body = item.lines
      .map((line, li) => `<tspan x="${x}" dy="${li === 0 ? 0 : lineH}">${escapeXml(line)}</tspan>`)
      .join("");
    lines.push(
      `    <text ${attrs({
        x,
        y: fmtPx(startY),
        "text-anchor": "end",
        "dominant-baseline": "middle",
        "data-full-label": full,
      })}><title>${escapeXml(full)}</title>${body}</text>`,
    );
  }
  for (let i = 0; i < ticks.length; i++) {
    const tick = ticks[i]!;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(xScale(tick)),
        y: fmtPx(plot.bottom + TYPE.tick.size + 6),
        "text-anchor": "middle",
      })}>${escapeXml(frame.tickLabels[i] ?? formatNumber(tick))}</text>`,
    );
  }
  lines.push(`  </g>`);
  if (frame.legend.items.length > 0) {
    lines.push(
      `  <g ${attrs({
        "font-size": TYPE.legend.size,
        "font-weight": TYPE.legend.weight,
        fill: TYPE.legend.fill,
      })}>`,
    );
    frame.legend.items.forEach((item, i) => {
      const mark = frame.legendMarks?.[i];
      lines.push(`    ${mark ? legendMark(mark, item.x, item.y - 9, item.color) : legendSwatch(item.x, item.y - 9, item.color)}`);
      lines.push(
        `    <text ${attrs({
          x: fmtPx(item.x + 14),
          y: fmtPx(item.y),
          "data-legend": item.name,
        })}>${escapeXml(item.name)}</text>`,
      );
    });
    lines.push(`  </g>`);
  }
  return lines;
}

/** Legend key drawn as the chart's own mark, so it reads in black and white. */
function legendMark(
  mark: "hollow" | "filled" | "rule",
  x: number,
  top: number,
  color: string,
): string {
  if (mark === "rule") {
    return `<rect ${attrs({ x: fmtPx(x + 4), y: fmtPx(top - 1), width: 2.5, height: 12, fill: color })}/>`;
  }
  return `<circle ${attrs({
    cx: fmtPx(x + 5),
    cy: fmtPx(top + 5),
    r: 4.5,
    fill: mark === "hollow" ? PAPER : color,
    stroke: mark === "hollow" ? color : undefined,
    "stroke-width": mark === "hollow" ? 1.5 : undefined,
  })}/>`;
}

/** Bar from x0 to x0 + w, rounded only at the end away from the base. */
export function roundedEndPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  roundRight: boolean,
): string {
  const x0 = fmtPx(x);
  const x1 = fmtPx(x + w);
  const y0 = fmtPx(y);
  const y1 = fmtPx(y + h);
  if (r <= 0) {
    return `M${x0} ${y0} L${x1} ${y0} L${x1} ${y1} L${x0} ${y1} Z`;
  }
  if (roundRight) {
    return `M${x0} ${y0} L${fmtPx(x + w - r)} ${y0} Q${x1} ${y0} ${x1} ${fmtPx(y + r)} L${x1} ${fmtPx(y + h - r)} Q${x1} ${y1} ${fmtPx(x + w - r)} ${y1} L${x0} ${y1} Z`;
  }
  return `M${x1} ${y0} L${fmtPx(x + r)} ${y0} Q${x0} ${y0} ${x0} ${fmtPx(y + r)} L${x0} ${fmtPx(y + h - r)} Q${x0} ${y1} ${fmtPx(x + r)} ${y1} L${x1} ${y1} Z`;
}
