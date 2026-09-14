import type { FallbackTable, ParseFailure } from "@markvis/parser";
import type { ChartStats } from "./stats.js";

export const STATS_HEADER = "file\ttype\tn\tmin\tmax\tseries";

export function formatNum(n: number): string {
  if (!Number.isFinite(n)) {
    return "-";
  }
  return String(n);
}

export function formatStatsRow(file: string, stats: ChartStats): string {
  return `${file}\t${stats.type}\t${stats.n}\t${formatNum(stats.min)}\t${formatNum(stats.max)}\t${stats.series}`;
}

export function tableToGfm(table: FallbackTable): string {
  if (table.columns.length === 0) {
    return "";
  }
  const header = `| ${table.columns.join(" | ")} |`;
  const sep = `| ${table.columns.map(() => "---").join(" | ")} |`;
  const body = table.rows.map((row) => {
    const cells = table.columns.map((_, i) => row[i] ?? "");
    return `| ${cells.join(" | ")} |`;
  });
  return [header, sep, ...body].join("\n");
}

export function failureToGfm(failure: ParseFailure): string {
  if (failure.table.columns.length > 0) {
    return tableToGfm(failure.table);
  }
  const raw = failure.raw.trim();
  if (!raw) {
    return "";
  }
  return tableToGfm({ columns: ["_raw"], rows: [[raw]] });
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
