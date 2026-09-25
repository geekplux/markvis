import type { ChartIR } from "@markvis/ir";
import {
  categoryNames,
  finiteValues,
  groupedValue,
  loadRows,
  seriesNames,
} from "./data.js";
import { drawTitle, reserveTitle, visibleTitle } from "./figure.js";
import {
  categoryBottomMargin,
  categoryLayout,
  fitFrameHeight,
  tickLeftMargin,
  titleBlockTop,
  SVG_WIDTH,
  type Painted,
} from "./layout.js";
import { seriesStyle } from "./palette.js";
import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";
import {
  MARGIN,
  PLOT_BG,
  TICK_TEXT_GAP,
  TYPE,
} from "./tokens.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

function hexChannels(hex: string): [number, number, number] {
  const body = hex.replace("#", "");
  const n = Number.parseInt(body.length === 3 ? body.split("").map((c) => c + c).join("") : body, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mixHex(from: string, to: string, t: number): string {
  const a = hexChannels(from);
  const b = hexChannels(to);
  const u = Math.max(0, Math.min(1, t));
  const ch = (i: number) => Math.round(a[i]! + (b[i]! - a[i]!) * u);
  return `#${[ch(0), ch(1), ch(2)].map((n) => n.toString(16).padStart(2, "0")).join("")}`;
}

export function renderHeatmap(chart: ChartIR, svgId: string): Painted {
  const rows = loadRows(chart);
  const xCats = categoryNames(rows);
  const yCats = seriesNames(rows);
  const present = finiteValues(rows.map((row) => row.y));
  const dataMin = present.length > 0 ? Math.min(...present) : 0;
  const dataMax = present.length > 0 ? Math.max(...present) : 1;
  const ymin = chart.min ?? dataMin;
  const ymax = chart.max ?? dataMax;
  const span = ymax - ymin;

  // The ramp starts 16px past the plot and the label 16px past that.
  // A label that only slightly overruns the 8px pad slides left. A label
  // that would cover the ramp grows the right reserve instead.
  const scaleLabelW = Math.max(
    textWidth(formatNumber(ymax), TYPE.tick.size),
    textWidth(formatNumber(ymin), TYPE.tick.size),
  );
  const rampW = 56;
  const baseRight = MARGIN.right + rampW;
  const basePlotRight = SVG_WIDTH - baseRight;
  const naturalEnd = basePlotRight + 32 + scaleLabelW;
  const barEnd = basePlotRight + 28;
  const shifted = SVG_WIDTH - 8 - scaleLabelW;
  const legendW =
    naturalEnd <= SVG_WIDTH - 8 + 0.5 || shifted >= barEnd + 2
      ? rampW
      : Math.max(rampW, scaleLabelW + 40 - MARGIN.right);
  const left = tickLeftMargin(yCats);
  const right = MARGIN.right + legendW;
  reserveTitle(visibleTitle(chart), left, chart.unit);
  const top = titleBlockTop(0);
  const draftW = Math.max(SVG_WIDTH - left - right, 1);
  const catLay =
    xCats.length > 0
      ? categoryLayout(xCats, draftW / Math.max(xCats.length, 1))
      : { rotate: false, show: [] as boolean[], lines: [] as string[][], full: [] as string[] };
  const bottom = categoryBottomMargin(catLay);
  const height = fitFrameHeight(top, bottom);
  const plot = {
    left,
    right: SVG_WIDTH - right,
    top,
    bottom: height - bottom,
    width: SVG_WIDTH - left - right,
    height: height - top - bottom,
  };

  const hue = seriesStyle(0).color;
  const nX = Math.max(xCats.length, 1);
  const nY = Math.max(yCats.length, 1);
  const cellW = plot.width / nX;
  const cellH = plot.height / nY;
  const patternId = `${svgId}-missing`;

  const lines: string[] = [
    drawTitle(visibleTitle(chart), plot.left, chart.unit),
    `  <defs>`,
    `    <pattern ${attrs({
      id: patternId,
      patternUnits: "userSpaceOnUse",
      width: 6,
      height: 6,
    })}>`,
    `      <rect width="6" height="6" fill="#f4f1ea"/>`,
    `      <path d="M0 6 L6 0" stroke="#a8a29e" stroke-width="1"/>`,
    `    </pattern>`,
    `  </defs>`,
  ];

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

  lines.push(`  <g ${attrs({ "data-heatmap": "1" })}>`);
  for (let row = 0; row < yCats.length; row++) {
    const series = yCats[row]!;
    for (let col = 0; col < xCats.length; col++) {
      const cat = xCats[col]!;
      const value = groupedValue(rows, series, cat);
      const x = plot.left + col * cellW;
      const y = plot.top + row * cellH;
      const missing = value === null;
      const t = !missing && span !== 0 ? (value - ymin) / span : 1;
      const clamped = Math.max(0, Math.min(1, t));
      const fill = missing ? `url(#${patternId})` : mixHex("#f4f1ea", hue, 0.16 + 0.84 * clamped);
      lines.push(
        `    <rect ${attrs({
          x: fmtPx(x),
          y: fmtPx(y),
          width: fmtPx(Math.max(cellW, 0)),
          height: fmtPx(Math.max(cellH, 0)),
          fill,
          stroke: "#d6d3d1",
          "stroke-width": 1,
          "data-x": cat,
          "data-series": series,
          "data-y": missing ? undefined : formatNumber(value),
          "data-missing": missing ? "1" : undefined,
        })}/>`,
      );
      if (missing || value === null) {
        continue;
      }
      const label = formatNumber(value);
      if (
        cellW >= textWidth(label, TYPE.value.size) + 8 &&
        cellH >= TYPE.value.size + 8
      ) {
        const ink = clamped > 0.62 ? "#fafaf9" : "#171717";
        lines.push(
          `    <text ${attrs({
            x: fmtPx(x + cellW / 2),
            y: fmtPx(y + cellH / 2),
            "text-anchor": "middle",
            "dominant-baseline": "middle",
            "font-size": TYPE.value.size,
            "font-weight": TYPE.value.weight,
            fill: ink,
            "data-cell-label": `${cat}:${series}`,
          })}>${escapeXml(label)}</text>`,
        );
      }
    }
  }
  lines.push(`  </g>`);

  const scaleX = plot.right + 16;
  const scaleH = Math.max(plot.height, 24);
  const steps = 8;
  const labelX = Math.min(scaleX + 16, SVG_WIDTH - 8 - scaleLabelW);
  lines.push(`  <g ${attrs({ "data-color-scale": "1" })}>`);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const y = plot.top + ((steps - 1 - i) * scaleH) / steps;
    lines.push(
      `    <rect ${attrs({
        x: fmtPx(scaleX),
        y: fmtPx(y),
        width: 12,
        height: fmtPx(scaleH / steps + 0.5),
        fill: mixHex("#f4f1ea", hue, 0.16 + 0.84 * t),
      })}/>`,
    );
  }
  lines.push(
    `    <text ${attrs({
      x: fmtPx(labelX),
      y: fmtPx(plot.top + 4),
      "font-size": TYPE.tick.size,
      fill: TYPE.tick.fill,
      "dominant-baseline": "hanging",
      "data-scale-max": "1",
    })}>${escapeXml(formatNumber(ymax))}</text>`,
  );
  lines.push(
    `    <text ${attrs({
      x: fmtPx(labelX),
      y: fmtPx(plot.top + scaleH),
      "font-size": TYPE.tick.size,
      fill: TYPE.tick.fill,
      "data-scale-min": "1",
    })}>${escapeXml(formatNumber(ymin))}</text>`,
  );
  lines.push(`  </g>`);

  lines.push(
    `  <g ${attrs({
      fill: TYPE.tick.fill,
      "font-size": TYPE.tick.size,
      "font-weight": TYPE.tick.weight,
    })}>`,
  );
  for (let i = 0; i < yCats.length; i++) {
    const label = yCats[i]!;
    const cy = plot.top + (i + 0.5) * cellH;
    lines.push(
      `    <text ${attrs({
        x: fmtPx(plot.left - TICK_TEXT_GAP),
        y: fmtPx(cy),
        "text-anchor": "end",
        "dominant-baseline": "middle",
        "data-series-label": label,
      })}><title>${escapeXml(label)}</title>${escapeXml(label)}</text>`,
    );
  }
  for (let i = 0; i < xCats.length; i++) {
    const label = xCats[i]!;
    const display = catLay.lines[i] ?? [label];
    const cx = plot.left + (i + 0.5) * cellW;
    const lineH = TYPE.tick.size + 3;
    const body =
      display.length === 1
        ? escapeXml(display[0] ?? "")
        : display
            .map((line, li) => {
              const dy = li === 0 ? 0 : lineH;
              return `<tspan x="${fmtPx(cx)}" dy="${dy}">${escapeXml(line)}</tspan>`;
            })
            .join("");
    lines.push(
      `    <text ${attrs({
        x: fmtPx(cx),
        y: fmtPx(plot.bottom + TYPE.tick.size),
        "text-anchor": "middle",
        "data-full-label": label,
      })}><title>${escapeXml(label)}</title>${body}</text>`,
    );
  }
  lines.push(`  </g>`);

  return { lines, height };
}
