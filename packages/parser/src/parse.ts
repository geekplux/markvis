import {
  ChartIRSchema,
  CHART_TYPES,
  isChartType,
  type ChartIR,
  type ChartType,
} from "@markvis/ir";
import { extractCharts, type ChartForm } from "./extract.js";
import {
  columnIsNumeric,
  hasDuplicateColumns,
  hasWidthMismatch,
  isNumericString,
  looksLikeGfm,
  parseCsv,
  parseCsvRows,
  parseGfm,
  type LooseTable,
} from "./table.js";

export const ERROR_CODES = [
  "E_UNKNOWN_TYPE",
  "E_TYPE_TYPO",
  "E_JSON_DATA",
  "E_MISSING_HEADER",
  "E_EMPTY_DATA",
  "E_EXTRA_COLUMN",
  "E_DUP_COLUMN",
  "E_UNKNOWN_FIELD",
  "E_PIE_NEGATIVE",
  "E_YAML_TABLE_CONFLICT",
  "E_EMPTY_FENCE",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type FallbackTable = {
  columns: string[];
  rows: string[][];
};

export type ParseError = {
  code: ErrorCode;
  message: string;
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

const EMPTY_TABLE: FallbackTable = { columns: [], rows: [] };

function fail(
  code: ErrorCode,
  detail: string,
  table: FallbackTable,
  raw: string,
): ParseFailure {
  return {
    ok: false,
    error: { code, message: `${code}: ${detail}` },
    table,
    raw,
  };
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0),
  );
  for (let i = 0; i <= m; i++) {
    dp[i]![0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0]![j] = j;
  }
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }
  return dp[m]![n]!;
}

function classifyType(
  type: string,
): "ok" | "typo" | "unknown" {
  if (isChartType(type)) {
    return "ok";
  }
  const near = CHART_TYPES.some((known) => levenshtein(type, known) === 1);
  return near ? "typo" : "unknown";
}

function splitHeaderAndData(body: string): {
  headers: Record<string, string>;
  data: string;
} {
  const lines = body.split(/\r?\n/);
  const headers: Record<string, string> = {};
  let i = 0;
  for (; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim() === "") {
      i += 1;
      break;
    }
    const match = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*?)\s*$/);
    if (!match) {
      break;
    }
    headers[match[1]!] = match[2]!;
  }
  return { headers, data: lines.slice(i).join("\n") };
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith("[") || trimmed.startsWith("{");
}

function looksLikeMissingCsvHeader(
  columns: string[],
  headers: Record<string, string>,
): boolean {
  if (columns.length === 0) {
    return false;
  }
  if (!columns.some((cell) => isNumericString(cell))) {
    return false;
  }
  const mapped = [headers["x"], headers["y"], headers["series"]].filter(
    (name): name is string => Boolean(name),
  );
  if (mapped.length === 0) {
    return true;
  }
  return mapped.some((name) => !columns.includes(name));
}

function recoverUnheadedCsv(
  data: string,
  headers: Record<string, string>,
): LooseTable {
  const rows = parseCsvRows(data);
  const width = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const columns: string[] = [];
  const x = headers["x"];
  const y = headers["y"];
  const series = headers["series"];
  for (let i = 0; i < width; i++) {
    if (i === 0 && x) {
      columns.push(x);
    } else if (i === 1 && y) {
      columns.push(y);
    } else if (i === 2 && series) {
      columns.push(series);
    } else {
      columns.push(`col${i + 1}`);
    }
  }
  return { columns, rows };
}

function firstNumericColumn(
  table: LooseTable,
  exclude?: string,
): string | undefined {
  for (let i = 0; i < table.columns.length; i++) {
    const name = table.columns[i]!;
    if (exclude !== undefined && name === exclude) {
      continue;
    }
    if (columnIsNumeric(table, i)) {
      return name;
    }
  }
  return undefined;
}

function firstCategoryColumn(table: LooseTable): string | undefined {
  for (let i = 0; i < table.columns.length; i++) {
    const name = table.columns[i]!;
    if (!columnIsNumeric(table, i)) {
      return name;
    }
  }
  return undefined;
}

function inferX(type: ChartType, table: LooseTable): string {
  if (type === "scatter" || type === "hist") {
    return firstNumericColumn(table) ?? table.columns[0]!;
  }
  if (type === "bar" || type === "pie") {
    return firstCategoryColumn(table) ?? table.columns[0]!;
  }
  return table.columns[0]!;
}

function inferY(
  type: ChartType,
  table: LooseTable,
  x: string,
): string | undefined {
  const numeric = firstNumericColumn(table, x);
  if (type === "hist") {
    return numeric;
  }
  if (numeric) {
    return numeric;
  }
  return table.columns.find((name) => name !== x);
}

function basename(filename: string): string {
  const parts = filename.split(/[/\\]/);
  return parts[parts.length - 1] ?? filename;
}

function deriveTitle(opts: {
  filename?: string | undefined;
  y?: string | undefined;
  firstColumn?: string | undefined;
}): string {
  if (opts.filename) {
    const base = basename(opts.filename).replace(/\.md$/i, "");
    const rest = base.replace(/^\d+-/, "").replace(/-/g, " ").trim();
    if (rest) {
      return rest;
    }
  }
  if (opts.y) {
    return opts.y;
  }
  if (opts.firstColumn) {
    return opts.firstColumn;
  }
  return "chart";
}

function buildIR(fields: {
  type: ChartType;
  title: string;
  unit?: string | undefined;
  x: string;
  y?: string | undefined;
  series?: string | undefined;
  table: LooseTable;
}): ChartIR {
  return ChartIRSchema.parse({
    markvis: 2 as const,
    type: fields.type,
    title: fields.title,
    x: fields.x,
    table: fields.table,
    ...(fields.unit ? { unit: fields.unit } : {}),
    ...(fields.y ? { y: fields.y } : {}),
    ...(fields.series && fields.type !== "pie" && fields.type !== "hist"
      ? { series: fields.series }
      : {}),
  });
}

function parseBody(
  body: string,
  opts: { form: ChartForm; filename?: string | undefined; raw: string },
): ParseResult {
  const raw = opts.raw;
  if (body.trim() === "") {
    return fail("E_EMPTY_FENCE", "fence body empty", EMPTY_TABLE, raw);
  }

  const { headers, data } = splitHeaderAndData(body);
  const dataTrim = data.trim();

  if (dataTrim === "") {
    return fail(
      "E_EMPTY_DATA",
      "header only, or zero data rows",
      EMPTY_TABLE,
      raw,
    );
  }

  if (looksLikeJson(dataTrim)) {
    return fail(
      "E_JSON_DATA",
      "data body is JSON; use CSV or a GFM table",
      { columns: ["_raw"], rows: [[dataTrim]] },
      raw,
    );
  }

  const parsed = looksLikeGfm(dataTrim) ? parseGfm(dataTrim) : parseCsv(dataTrim);

  if (!looksLikeGfm(dataTrim) && looksLikeMissingCsvHeader(parsed.columns, headers)) {
    const recovered = recoverUnheadedCsv(dataTrim, headers);
    return fail(
      "E_MISSING_HEADER",
      "no CSV/GFM header row",
      recovered,
      raw,
    );
  }

  if (parsed.columns.length === 0) {
    return fail(
      "E_MISSING_HEADER",
      "no CSV/GFM header row",
      EMPTY_TABLE,
      raw,
    );
  }

  if (hasDuplicateColumns(parsed.columns)) {
    return fail(
      "E_DUP_COLUMN",
      "duplicate header names",
      parsed,
      raw,
    );
  }

  if (hasWidthMismatch(parsed.columns, parsed.rows)) {
    return fail(
      "E_EXTRA_COLUMN",
      "row width does not match header width",
      parsed,
      raw,
    );
  }

  if (parsed.rows.length === 0) {
    return fail(
      "E_EMPTY_DATA",
      "header only, or zero data rows",
      parsed,
      raw,
    );
  }

  const typeRaw = (headers["type"] ?? "").trim();
  const typeKind = classifyType(typeRaw);
  if (typeKind === "typo") {
    return fail(
      "E_TYPE_TYPO",
      "type looks like a misspelling of a known type",
      parsed,
      raw,
    );
  }
  if (typeKind === "unknown") {
    return fail(
      "E_UNKNOWN_TYPE",
      "type is not one of bar|line|area|scatter|pie|hist",
      parsed,
      raw,
    );
  }
  const type = typeRaw as ChartType;

  const specified = {
    x: headers["x"]?.trim() || undefined,
    y: headers["y"]?.trim() || undefined,
    series: headers["series"]?.trim() || undefined,
  };
  const mapped = [specified.x, specified.y, specified.series].filter(
    (name): name is string => Boolean(name),
  );
  const missing = mapped.filter((name) => !parsed.columns.includes(name));
  if (missing.length > 0) {
    if (opts.form === "comment") {
      return fail(
        "E_YAML_TABLE_CONFLICT",
        "comment fields disagree with table columns",
        parsed,
        raw,
      );
    }
    return fail(
      "E_UNKNOWN_FIELD",
      "x, y, or series names a missing column",
      parsed,
      raw,
    );
  }

  const x = specified.x ?? inferX(type, parsed);
  const y = specified.y ?? inferY(type, parsed, x);
  const series =
    specified.series && type !== "pie" && type !== "hist"
      ? specified.series
      : undefined;

  if (type !== "hist" && !y) {
    return fail(
      "E_UNKNOWN_FIELD",
      "x, y, or series names a missing column",
      parsed,
      raw,
    );
  }

  if (type === "pie" && y) {
    const yIndex = parsed.columns.indexOf(y);
    const negative = parsed.rows.some((row) => {
      const cell = row[yIndex];
      if (cell === undefined || !isNumericString(cell)) {
        return false;
      }
      return Number(cell) < 0;
    });
    if (negative) {
      return fail("E_PIE_NEGATIVE", "pie values must be >= 0", parsed, raw);
    }
  }

  const title =
    headers["title"]?.trim() ||
    deriveTitle({
      filename: opts.filename,
      y,
      firstColumn: parsed.columns[0],
    });
  const unit = headers["unit"]?.trim() || undefined;

  const chart = buildIR({
    type,
    title,
    unit,
    x,
    y,
    series,
    table: parsed,
  });
  return { ok: true, chart };
}

export function parseMarkdown(
  source: string,
  options: ParseOptions = {},
): ParseResult {
  const charts = extractCharts(source);
  const first = charts[0];
  if (!first) {
    return fail("E_EMPTY_FENCE", "fence body empty", EMPTY_TABLE, source);
  }
  return parseBody(first.body, {
    form: first.form,
    filename: options.filename,
    raw: first.raw,
  });
}

export function parse(
  source: string,
  options: ParseOptions = {},
): ParseResult {
  return parseMarkdown(source, options);
}
