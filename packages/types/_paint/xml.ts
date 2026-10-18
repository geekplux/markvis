import type { ChartIR } from "@markvis/ir";
import { colorAttr, isColorKey, type Paint } from "./paint.js";
import { COLOR_MODE } from "./tokens.js";

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function canonicalJson(chart: ChartIR): string {
  return JSON.stringify({
    markvis: chart.markvis,
    type: chart.type,
    title: chart.title,
    unit: chart.unit ?? "",
    x: chart.x,
    y: chart.y ?? "",
    series: chart.series ?? "",
    columns: chart.table.columns,
    rows: chart.table.rows,
  });
}

export function fmtPx(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  const value = Object.is(rounded, -0) ? 0 : rounded;
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(value);
}

/**
 * Serialize attributes in insertion order; undefined values are skipped. A
 * Paint on a color attribute (fill, stroke, stop-color, color) is written by
 * colorAttr().
 */
export function attrs(
  record: Record<string, string | number | Paint | undefined>,
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }
    if (typeof value === "object") {
      parts.push(
        isColorKey(key)
          ? colorAttr(key, value, COLOR_MODE).trimStart()
          : `${key}="${escapeXml(value.hex)}"`,
      );
      continue;
    }
    parts.push(`${key}="${escapeXml(String(value))}"`);
  }
  return parts.join(" ");
}
