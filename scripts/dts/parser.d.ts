import type { ChartIR } from "./ir.js";

export declare const ERROR_CODES: readonly [
  "E_UNKNOWN_TYPE",
  "E_TYPE_TYPO",
  "E_JSON_DATA",
  "E_MISSING_HEADER",
  "E_EMPTY_DATA",
  "E_EXTRA_COLUMN",
  "E_DUP_COLUMN",
  "E_UNKNOWN_FIELD",
  "E_PIE_NEGATIVE",
  "E_NEGATIVE_VALUE",
  "E_YAML_TABLE_CONFLICT",
  "E_EMPTY_FENCE",
  "E_UNKNOWN_THEME",
  "E_UNKNOWN_PALETTE",
  "E_BAD_VERSION",
  "E_BAD_NUMBER",
  "E_MISSING_VALUE",
  "E_DUP_KEY",
  "E_SANKEY_CYCLE",
];
export type ErrorCode = (typeof ERROR_CODES)[number];

export type FallbackTable = {
  columns: string[];
  rows: string[][];
};

export type ParseError = {
  code: ErrorCode;
  message: string;
  row?: number;
  column?: string;
};

export type ParseSuccess = {
  ok: true;
  chart: ChartIR;
};

export type ParseFailure = {
  ok: false;
  error: ParseError;
  table: FallbackTable;
  raw: string;
};

export type ParseResult = ParseSuccess | ParseFailure;

export type ParseOptions = {
  filename?: string;
};

export type ChartForm = "fence" | "comment";

export type ExtractedChart = {
  index: number;
  lang: string;
  form: ChartForm;
  body: string;
  raw: string;
};

export declare function parseMarkdown(
  source: string,
  options?: ParseOptions,
): ParseResult;
export declare function parse(
  source: string,
  options?: ParseOptions,
): ParseResult;
export type LocatedChart = {
  index: number;
  line: number;
  result: ParseResult;
};

export declare function parseDocument(
  source: string,
  options?: ParseOptions,
): LocatedChart[];
export declare function extractCharts(source: string): ExtractedChart[];
