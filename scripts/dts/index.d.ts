export { parse, parseBlock, parseMarkdown, parseDocument, extractCharts, ERROR_CODES } from "./parser.js";
export type {
  ErrorCode,
  FallbackTable,
  ParseError,
  ParseFailure,
  ParseOptions,
  ParseResult,
  ParseSuccess,
  ChartForm,
  ExtractedChart,
} from "./parser.js";
export { renderSvg } from "./render-svg.js";
export { remarkMarkvis } from "./remark.js";
export { markdownItMarkvis } from "./markdown-it.js";
export { CHART_TYPES, THEMES, PALETTES, ChartIRSchema } from "./ir.js";
export type { ChartIR, ChartType, ChartTheme, ChartPalette } from "./ir.js";

import type { ChartIR, ChartPalette, ChartTheme } from "./ir.js";
import type { FallbackTable, ParseError } from "./parser.js";

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

/**
 * One chart block to SVG and HTML in one call. Takes the inside of a block
 * or the whole block. A block's own `theme:` / `palette:` / `surface:` win
 * over the options. Never throws: on failure `html` is the rows as a table
 * plus one error line.
 */
export declare function render(text: string, options?: RenderOptions): RenderResult;
