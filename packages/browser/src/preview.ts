import {
  parseMarkdown,
  type FallbackTable,
  type ParseResult,
} from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

export type PreviewView = {
  ok: boolean;
  svg: string;
  table: FallbackTable;
  error: string | undefined;
};

/** @deprecated Prefer PreviewView — kept for playground call sites. */
export type PlaygroundView = PreviewView;

export { escapeHtml, htmlTable } from "./html.js";

function fallbackTable(table: FallbackTable, raw: string): FallbackTable {
  if (table.columns.length > 0) {
    return table;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return { columns: [], rows: [] };
  }
  return { columns: ["_raw"], rows: [[trimmed]] };
}

function parseSource(source: string, filename?: string): ParseResult {
  return filename === undefined
    ? parseMarkdown(source)
    : parseMarkdown(source, { filename });
}

/** Shared parse → render path for Play + Examples detail. */
export function previewSource(
  source: string,
  filename?: string,
): PreviewView {
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

export function copySvg(view: PreviewView): string {
  return view.svg;
}
