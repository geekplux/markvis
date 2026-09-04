import { createHash } from "node:crypto";
import type { ChartIR } from "@markvis/ir";

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

/** Stable id from a SHA-256 of the canonical IR. No clocks or random. */
export function chartId(chart: ChartIR): string {
  const hash = createHash("sha256")
    .update(canonicalJson(chart), "utf8")
    .digest("hex")
    .slice(0, 16);
  return `mv-${hash}`;
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

export function attrs(
  record: Record<string, string | number | undefined>,
): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) {
      continue;
    }
    parts.push(`${key}="${escapeXml(String(value))}"`);
  }
  return parts.join(" ");
}
