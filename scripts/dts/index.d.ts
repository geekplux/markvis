export { parse, parseMarkdown, extractCharts, ERROR_CODES } from "./parser.js";
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
