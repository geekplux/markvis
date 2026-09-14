import {
  parseMarkdown,
  type FallbackTable,
  type ParseFailure,
  type ParseResult,
} from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlTable(table: FallbackTable): string {
  if (table.columns.length === 0) {
    return "";
  }
  const head = table.columns
    .map((col) => `<th>${escapeHtml(col)}</th>`)
    .join("");
  const body = table.rows
    .map((row) => {
      const cells = table.columns
        .map((_, i) => `<td>${escapeHtml(row[i] ?? "")}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function fallbackTable(result: ParseFailure): FallbackTable {
  if (result.table.columns.length > 0) {
    return result.table;
  }
  const raw = result.raw.trim();
  if (!raw) {
    return { columns: [], rows: [] };
  }
  return { columns: ["_raw"], rows: [[raw]] };
}

export function resultToHtml(result: ParseResult): string {
  if (result.ok) {
    const svg = renderSvg(result.chart).trimEnd();
    const caption = escapeHtml(result.chart.title);
    const type = escapeHtml(result.chart.type);
    const table = htmlTable(result.chart.table);
    return `<figure class="markvis" data-markvis="2" data-chart-type="${type}">\n${svg}\n<figcaption>${caption}</figcaption>\n${table}\n</figure>`;
  }
  const table = htmlTable(fallbackTable(result));
  const error = escapeHtml(result.error.message);
  const parts: string[] = [];
  if (table) {
    parts.push(table);
  }
  parts.push(`<p class="markvis-error">${error}</p>`);
  return parts.join("\n");
}

export function chartBlockHtml(raw: string, filename?: string): string {
  const result =
    filename === undefined
      ? parseMarkdown(raw)
      : parseMarkdown(raw, { filename });
  return resultToHtml(result);
}
