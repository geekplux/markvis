import type { ChartIR } from "@markvis/ir";
import { loadRows } from "./data.js";
import { SVG_HEIGHT, SVG_WIDTH } from "./layout.js";
import { seriesColor } from "./palette.js";
import { textWidth } from "./text.js";
import { attrs, escapeXml, fmtPx } from "./xml.js";

function slicePath(
  cx: number,
  cy: number,
  r: number,
  a0: number,
  a1: number,
): string {
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${fmtPx(cx)} ${fmtPx(cy)} L${fmtPx(x0)} ${fmtPx(y0)} A${fmtPx(r)} ${fmtPx(r)} 0 ${large} 1 ${fmtPx(x1)} ${fmtPx(y1)} Z`;
}

export function renderPie(chart: ChartIR, _id: string): string[] {
  const rows = loadRows(chart);
  const slices = rows.map((row, i) => ({
    label: row.xLabel,
    value: Math.max(0, row.y),
    color: seriesColor(i),
  }));
  const sum = slices.reduce((acc, slice) => acc + slice.value, 0);

  const cx = 260;
  const cy = 270;
  const r = 150;
  const lines: string[] = [];

  lines.push(
    `  <text ${attrs({
      x: SVG_WIDTH / 2,
      y: 26,
      "text-anchor": "middle",
      "font-size": 16,
      "font-weight": 600,
      fill: "#111111",
    })}>${escapeXml(chart.title)}</text>`,
  );

  const legendX = cx + r + 36;
  let legendY = Math.max(56, cy - (slices.length * 20) / 2);
  if (legendY + slices.length * 20 > SVG_HEIGHT - 16) {
    legendY = 56;
  }

  lines.push(`  <g ${attrs({ "aria-hidden": "true" })}>`);
  if (sum <= 0) {
    lines.push(
      `    <circle ${attrs({
        cx,
        cy,
        r,
        fill: "none",
        stroke: "#cccccc",
        "stroke-width": 1.5,
        "data-empty": "true",
      })}/>`,
    );
  } else {
    let angle = -Math.PI / 2;
    for (const slice of slices) {
      if (slice.value <= 0) {
        continue;
      }
      if (slice.value === sum) {
        lines.push(
          `    <circle ${attrs({
            cx,
            cy,
            r,
            fill: slice.color,
            stroke: "#ffffff",
            "stroke-width": 1,
            "data-label": slice.label,
            "data-raw-value": String(slice.value),
          })}/>`,
        );
        angle += Math.PI * 2;
        continue;
      }
      const sweep = (slice.value / sum) * Math.PI * 2;
      const next = angle + sweep;
      lines.push(
        `    <path ${attrs({
          d: slicePath(cx, cy, r, angle, next),
          fill: slice.color,
          stroke: "#ffffff",
          "stroke-width": 1,
          "data-label": slice.label,
          "data-raw-value": String(slice.value),
        })}/>`,
      );
      angle = next;
    }
  }
  lines.push(`  </g>`);

  lines.push(`  <g ${attrs({ "font-size": 12, fill: "#222222" })}>`);
  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i]!;
    const y = legendY + i * 20;
    const swatchY = y - 9;
    lines.push(
      `    <rect ${attrs({
        x: legendX,
        y: swatchY,
        width: 10,
        height: 10,
        fill: slice.color,
        rx: 1,
      })}/>`,
    );
    const label = `${slice.label} (${String(slice.value)})`;
    const maxW = SVG_WIDTH - legendX - 28;
    let shown = label;
    if (textWidth(shown, 12) > maxW) {
      shown = slice.label;
    }
    lines.push(
      `    <text ${attrs({
        x: legendX + 16,
        y,
        "data-legend": slice.label,
      })}>${escapeXml(shown)}</text>`,
    );
  }
  lines.push(`  </g>`);

  return lines;
}
