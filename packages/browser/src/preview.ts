import { parseMarkdown, type FallbackTable, type ParseResult } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

export type PreviewView = {
  ok: boolean;
  svg: string;
  table: FallbackTable;
  error: string | undefined;
};

export { escapeHtml, htmlTable } from "@markvis/html";

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
  return filename === undefined ? parseMarkdown(source) : parseMarkdown(source, { filename });
}

/**
 * Play and the Examples detail: a whole Markdown source (prose around the
 * block included) to its first chart. Hosts that hold one block use
 * `render()`; this takes a document, so it reads it with `parseMarkdown`.
 */
export function previewSource(source: string, filename?: string): PreviewView {
  try {
    const result = parseSource(source, filename);
    if (result.ok) {
      return { ok: true, svg: renderSvg(result.chart), table: result.chart.table, error: undefined };
    }
    return { ok: false, svg: "", table: fallbackTable(result.table, result.raw), error: result.error.message };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, svg: "", table: fallbackTable({ columns: [], rows: [] }, source), error: message };
  }
}

export function copyFence(source: string): string {
  return source;
}

export function copySvg(view: PreviewView): string {
  return view.svg;
}
