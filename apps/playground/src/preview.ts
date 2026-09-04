import {
  parseMarkdown,
  type FallbackTable,
  type ParseResult,
} from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

export type PlaygroundView = {
  ok: boolean;
  svg: string;
  table: FallbackTable;
  error: string | undefined;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function fallbackTable(
  table: FallbackTable,
  raw: string,
): FallbackTable {
  if (table.columns.length > 0) {
    return table;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { columns: [], rows: [] };
  }
  return { columns: ["_raw"], rows: [[trimmed]] };
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

function parseSource(source: string, filename?: string): ParseResult {
  return filename === undefined
    ? parseMarkdown(source)
    : parseMarkdown(source, { filename });
}

export function previewSource(
  source: string,
  filename?: string,
): PlaygroundView {
  try {
    const result = parseSource(source, filename);
    if (result.ok) {
      return {
        ok: true,
        svg: renderSvg(result.chart),
        table: result.chart.table,
        error: undefined,
      };
    }
    return {
      ok: false,
      svg: "",
      table: fallbackTable(result.table, result.raw),
      error: result.error.message,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      svg: "",
      table: fallbackTable({ columns: [], rows: [] }, source),
      error: message,
    };
  }
}

export function copyFence(source: string): string {
  return source;
}

export function copySvg(view: PlaygroundView): string {
  return view.svg;
}
