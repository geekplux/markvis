import type { ChartIR, ChartPalette, ChartTheme } from "@markvis/ir";
import {
  parseBlock,
  parseMarkdown,
  type FallbackTable,
  type ParseDefaults,
  type ParseError,
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

/** Every cell is kept, including cells past the header width. */
export function htmlTable(table: FallbackTable): string {
  if (table.columns.length === 0) {
    return "";
  }
  const head = table.columns
    .map((col) => `<th>${escapeHtml(col)}</th>`)
    .join("");
  const body = table.rows
    .map((row) => {
      const width = Math.max(table.columns.length, row.length);
      const cells = Array.from({ length: width }, (_, i) => {
        return `<td>${escapeHtml(row[i] ?? "")}</td>`;
      }).join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/** The rows a failure keeps, or the raw text as one cell when none were read. */
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

function figureHtml(chart: ChartIR, svg: string): string {
  const caption = escapeHtml(chart.title);
  const type = escapeHtml(chart.type);
  const table = htmlTable(chart.table);
  return `<figure class="markvis" data-markvis="2" data-chart-type="${type}">\n${svg.trimEnd()}\n<figcaption>${caption}</figcaption>\n${table}\n</figure>`;
}

function failureHtml(table: FallbackTable, error: ParseError): string {
  const parts: string[] = [];
  const rows = htmlTable(table);
  if (rows) {
    parts.push(rows);
  }
  parts.push(`<p class="markvis-error">${escapeHtml(error.message)}</p>`);
  return parts.join("\n");
}

export function resultToHtml(result: ParseResult): string {
  if (result.ok) {
    return figureHtml(result.chart, renderSvg(result.chart));
  }
  return failureHtml(fallbackTable(result), result.error);
}

/** A whole chart block (fence lines or comment included) to HTML. */
export function chartBlockHtml(raw: string, filename?: string): string {
  const result =
    filename === undefined
      ? parseMarkdown(raw)
      : parseMarkdown(raw, { filename });
  return resultToHtml(result);
}

export type RenderOptions = {
  /** Display width in px. Default 720. */
  width?: number;
  /** Used when the block has no `surface:`. */
  surface?: "light" | "dark" | "export";
  /** Used when the block has no `theme:`. */
  theme?: ChartTheme;
  /** Used when the block has no `palette:`. */
  palette?: ChartPalette;
  /** For a derived title when the block has no `title:`. */
  filename?: string;
};

export type RenderResult =
  | { ok: true; svg: string; html: string; chart: ChartIR }
  | { ok: false; error: ParseError; html: string; table: FallbackTable };

function defaultsOf(options: RenderOptions): ParseDefaults {
  const defaults: ParseDefaults = {};
  if (options.theme !== undefined) {
    defaults.theme = options.theme;
  }
  if (options.palette !== undefined) {
    defaults.palette = options.palette;
  }
  if (options.surface !== undefined) {
    defaults.surface = options.surface;
  }
  return defaults;
}

/**
 * One chart block to SVG and HTML in one call. Takes the inside of a block
 * or the whole block. A block's own `theme:` / `palette:` / `surface:` win
 * over the options. On failure the rows stay, with one error line.
 */
export function render(text: string, options: RenderOptions = {}): RenderResult {
  const result = parseBlock(text, {
    ...(options.filename !== undefined ? { filename: options.filename } : {}),
    defaults: defaultsOf(options),
  });
  if (!result.ok) {
    const table = fallbackTable(result);
    return {
      ok: false,
      error: result.error,
      html: failureHtml(table, result.error),
      table: result.table,
    };
  }
  const width =
    options.width !== undefined && Number.isFinite(options.width) && options.width > 0
      ? options.width
      : undefined;
  const svg = renderSvg(result.chart, width === undefined ? {} : { width });
  return {
    ok: true,
    svg,
    html: figureHtml(result.chart, svg),
    chart: result.chart,
  };
}
