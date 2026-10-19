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
 * colorAttr(). In host mode each Paint also yields a style declaration; they
 * are joined into one `style` attribute, after a caller-passed `style` when
 * there is one (at its place), else at the end.
 */
export function attrs(
  record: Record<string, string | number | Paint | undefined>,
): string {
  const parts: string[] = [];
  const styles: string[] = [];
  let styleAt = -1;
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }
    if (typeof value === "object") {
      if (isColorKey(key)) {
        const color = colorAttr(key, value, COLOR_MODE);
        parts.push(color.attr);
        if (color.style !== undefined) {
          styles.push(color.style);
        }
      } else {
        parts.push(`${key}="${escapeXml(value.hex)}"`);
      }
      continue;
    }
    if (key === "style") {
      styleAt = parts.length;
      styles.unshift(escapeXml(String(value)));
      parts.push("");
      continue;
    }
    parts.push(`${key}="${escapeXml(String(value))}"`);
  }
  if (styles.length > 0) {
    const style = `style="${styles.join(";")}"`;
    if (styleAt === -1) {
      parts.push(style);
    } else {
      parts[styleAt] = style;
    }
  }
  return parts.join(" ");
}
