import {
  ChartIRSchema,
  CHART_TYPES,
  isChartPalette,
  isChartTheme,
  isChartType,
  type ChartIR,
  type ChartPalette,
  type ChartTheme,
  type ChartType,
} from "@markvis/ir";
import { allowedFenceKeys } from "@markvis/types";
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
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type FallbackTable = {
  columns: string[];
  rows: string[][];
};

export type ParseError = {
  code: ErrorCode;
  message: string;
  /** 1-based data row when the failure is a cell or a repeated key. */
  row?: number;
  /** Column name when the failure is a cell or a repeated key. */
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

const EMPTY_TABLE: FallbackTable = { columns: [], rows: [] };

function fail(
  code: ErrorCode,
  detail: string,
  table: FallbackTable,
  raw: string,
  loc?: { row?: number; column?: string },
): ParseFailure {
  const error: ParseError = { code, message: `${code}: ${detail}` };
  if (loc?.row !== undefined) {
    error.row = loc.row;
  }
  if (loc?.column !== undefined) {
    error.column = loc.column;
  }
  return {
    ok: false,
    error,
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
  if (
    type === "bar" ||
    type === "pie" ||
    type === "heatmap" ||
    type === "funnel" ||
    type === "waterfall" ||
    type === "radar" ||
    type === "gauge" ||
    type === "sankey" ||
    type === "treemap"
  ) {
    return firstCategoryColumn(table) ?? table.columns[0]!;
  }
  return table.columns[0]!;
}

/** pie/hist/funnel/waterfall/gauge ignore series on IR; heatmap/sankey require it; radar/treemap optional. */
function keepSeriesOnIR(type: ChartType): boolean {
  return (
    type !== "pie" &&
    type !== "hist" &&
    type !== "funnel" &&
    type !== "waterfall" &&
    type !== "gauge"
  );
}

function cellAt(table: LooseTable, row: string[], column: string): string {
  const index = table.columns.indexOf(column);
  if (index === -1) {
    return "";
  }
  return row[index] ?? "";
}

function missingPolicy(
  type: ChartType,
  layout: "grouped" | "stacked" | "percent" | undefined,
): "required" | "gap" {
  if (
    (type === "bar" || type === "line" || type === "area") &&
    (layout === "stacked" || layout === "percent")
  ) {
    return "required";
  }
  if (
    type === "bar" ||
    type === "line" ||
    type === "area" ||
    type === "scatter" ||
    type === "hist" ||
    type === "heatmap" ||
    type === "radar"
  ) {
    return "gap";
  }
  return "required";
}

function measureColumns(
  type: ChartType,
  x: string,
  y: string | undefined,
): string[] {
  if (type === "scatter") {
    return [x, y].filter((name): name is string => Boolean(name));
  }
  if (type === "hist") {
    return [x, y].filter((name): name is string => Boolean(name));
  }
  return y ? [y] : [];
}

function duplicateKey(
  type: ChartType,
  xValue: string,
  seriesValue: string,
): string | null {
  if (type === "scatter" || type === "hist" || type === "waterfall") {
    return null;
  }
  if (type === "pie" || type === "funnel" || type === "gauge") {
    return xValue;
  }
  if (type === "sankey" || type === "treemap") {
    return `${xValue}\0${seriesValue}`;
  }
  return `${seriesValue}\0${xValue}`;
}

function sankeyCycleNode(
  links: Array<{ source: string; target: string }>,
): string | null {
  const outs = new Map<string, string[]>();
  const nodes = new Set<string>();
  for (const link of links) {
    nodes.add(link.source);
    nodes.add(link.target);
    const list = outs.get(link.source) ?? [];
    list.push(link.target);
    outs.set(link.source, list);
    if (!outs.has(link.target)) {
      outs.set(link.target, []);
    }
  }
  const state = new Map<string, 0 | 1 | 2>();
  function walk(id: string): string | null {
    state.set(id, 1);
    for (const next of outs.get(id) ?? []) {
      const seen = state.get(next) ?? 0;
      if (seen === 1) {
        return next;
      }
      if (seen === 0) {
        const hit = walk(next);
        if (hit) {
          return hit;
        }
      }
    }
    state.set(id, 2);
    return null;
  }
  for (const id of nodes) {
    if ((state.get(id) ?? 0) === 0) {
      const hit = walk(id);
      if (hit) {
        return hit;
      }
    }
  }
  return null;
}

function columnHasNegative(
  table: LooseTable,
  column: string,
): boolean {
  const index = table.columns.indexOf(column);
  if (index === -1) {
    return false;
  }
  return table.rows.some((row) => {
    const cell = row[index];
    if (cell === undefined || !isNumericString(cell)) {
      return false;
    }
    return Number(cell) < 0;
  });
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
  theme: ChartTheme;
  palette?: ChartPalette | undefined;
  unit?: string | undefined;
  x: string;
  y?: string | undefined;
  series?: string | undefined;
  layout?: "grouped" | "stacked" | "percent" | undefined;
  innerRadius?: number | undefined;
  min?: number | undefined;
  max?: number | undefined;
  surface?: "light" | "dark" | "export" | undefined;
  orient?: "horizontal" | "vertical" | undefined;
  role?: string | undefined;
  table: LooseTable;
}): ChartIR {
  return ChartIRSchema.parse({
    markvis: 2 as const,
    type: fields.type,
    title: fields.title,
    theme: fields.theme,
    x: fields.x,
    table: fields.table,
    ...(fields.palette ? { palette: fields.palette } : {}),
    ...(fields.unit ? { unit: fields.unit } : {}),
    ...(fields.y ? { y: fields.y } : {}),
    ...(fields.series && keepSeriesOnIR(fields.type)
      ? { series: fields.series }
      : {}),
    ...(fields.layout ? { layout: fields.layout } : {}),
    ...(fields.innerRadius !== undefined
      ? { innerRadius: fields.innerRadius }
      : {}),
    ...(fields.min !== undefined ? { min: fields.min } : {}),
    ...(fields.max !== undefined ? { max: fields.max } : {}),
    ...(fields.surface ? { surface: fields.surface } : {}),
    ...(fields.orient ? { orient: fields.orient } : {}),
    ...(fields.role ? { role: fields.role } : {}),
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
      "type is not one of bar|line|area|scatter|pie|hist|heatmap|funnel|waterfall|radar|gauge|sankey|treemap",
      parsed,
      raw,
    );
  }
  const type = typeRaw as ChartType;

  const allowedKeys = allowedFenceKeys(type);
  const unknownKeys = Object.keys(headers).filter((key) => !allowedKeys.has(key));
  if (unknownKeys.length > 0) {
    return fail(
      "E_UNKNOWN_FIELD",
      `undeclared fence field: ${unknownKeys[0]}`,
      parsed,
      raw,
    );
  }

  const themeRaw = headers["theme"]?.trim() ?? "";
  let theme: ChartTheme = "folio";
  if (themeRaw !== "") {
    if (!isChartTheme(themeRaw)) {
      return fail(
        "E_UNKNOWN_THEME",
        "theme is not one of folio|highcharts|shadcn|docs|ant|recharts",
        parsed,
        raw,
      );
    }
    theme = themeRaw;
  }

  const paletteRaw = headers["palette"]?.trim() ?? "";
  let palette: ChartPalette | undefined;
  if (paletteRaw !== "") {
    if (!isChartPalette(paletteRaw)) {
      return fail(
        "E_UNKNOWN_PALETTE",
        "palette is not one of ink|porcelain|warm|cool|vivid",
        parsed,
        raw,
      );
    }
    palette = paletteRaw;
  }

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

  if (type === "heatmap" && !specified.series) {
    return fail("E_UNKNOWN_FIELD", "heatmap requires series", parsed, raw);
  }

  if (type === "sankey" && !specified.series) {
    return fail("E_UNKNOWN_FIELD", "sankey requires series", parsed, raw);
  }

  const x = specified.x ?? inferX(type, parsed);
  const y = specified.y ?? inferY(type, parsed, x);
  const series =
    specified.series && keepSeriesOnIR(type) ? specified.series : undefined;

  if (type !== "hist" && !y) {
    return fail(
      "E_UNKNOWN_FIELD",
      "x, y, or series names a missing column",
      parsed,
      raw,
    );
  }

  if (type === "pie" && y && columnHasNegative(parsed, y)) {
    return fail("E_PIE_NEGATIVE", "pie values must be >= 0", parsed, raw);
  }

  if (
    (type === "funnel" ||
      type === "radar" ||
      type === "sankey" ||
      type === "treemap") &&
    y &&
    columnHasNegative(parsed, y)
  ) {
    return fail(
      "E_NEGATIVE_VALUE",
      `${type} values must be >= 0`,
      parsed,
      raw,
    );
  }

  if (type === "sankey" && specified.series && y) {
    const xi = parsed.columns.indexOf(x);
    const si = parsed.columns.indexOf(specified.series);
    if (xi !== -1 && si !== -1) {
      for (const row of parsed.rows) {
        const src = (row[xi] ?? "").trim();
        const tgt = (row[si] ?? "").trim();
        if (src !== "" && src === tgt) {
          return fail(
            "E_UNKNOWN_FIELD",
            "sankey self-link (source equals target)",
            parsed,
            raw,
          );
        }
      }
    }
  }

  let layout: "grouped" | "stacked" | "percent" | undefined;
  const layoutRaw = headers["layout"]?.trim();
  if (layoutRaw !== undefined && layoutRaw !== "") {
    if (layoutRaw !== "grouped" && layoutRaw !== "stacked" && layoutRaw !== "percent") {
      return fail(
        "E_UNKNOWN_FIELD",
        `layout must be grouped|stacked|percent (got ${layoutRaw})`,
        parsed,
        raw,
      );
    }
    layout = layoutRaw;
  }

  let innerRadius: number | undefined;
  const innerRaw = headers["innerRadius"]?.trim();
  if (innerRaw !== undefined && innerRaw !== "") {
    const n = Number(innerRaw);
    if (!Number.isFinite(n) || n < 0 || n > 1) {
      return fail(
        "E_UNKNOWN_FIELD",
        `innerRadius must be a number in [0, 1] (got ${innerRaw})`,
        parsed,
        raw,
      );
    }
    innerRadius = n;
  }

  let min: number | undefined;
  let max: number | undefined;
  const minRaw = headers["min"]?.trim();
  if (minRaw !== undefined && minRaw !== "") {
    const n = Number(minRaw);
    if (!Number.isFinite(n)) {
      return fail(
        "E_UNKNOWN_FIELD",
        `min must be a number (got ${minRaw})`,
        parsed,
        raw,
      );
    }
    min = n;
  }
  const maxRaw = headers["max"]?.trim();
  if (maxRaw !== undefined && maxRaw !== "") {
    const n = Number(maxRaw);
    if (!Number.isFinite(n)) {
      return fail(
        "E_UNKNOWN_FIELD",
        `max must be a number (got ${maxRaw})`,
        parsed,
        raw,
      );
    }
    max = n;
  }
  if (
    (type === "gauge" || type === "heatmap") &&
    min !== undefined &&
    max !== undefined &&
    min >= max
  ) {
    return fail(
      "E_UNKNOWN_FIELD",
      `${type} min must be less than max`,
      parsed,
      raw,
    );
  }

  const versionRaw = headers["markvis"];
  if (versionRaw !== undefined && versionRaw.trim() !== "" && versionRaw.trim() !== "2") {
    return fail(
      "E_BAD_VERSION",
      `markvis version "${versionRaw.trim()}" is not supported; use 2 or omit the field`,
      parsed,
      raw,
    );
  }

  let surface: "light" | "dark" | "export" | undefined;
  const surfaceRaw = headers["surface"]?.trim();
  if (surfaceRaw !== undefined && surfaceRaw !== "") {
    if (surfaceRaw !== "light" && surfaceRaw !== "dark" && surfaceRaw !== "export") {
      return fail(
        "E_UNKNOWN_FIELD",
        `surface must be light|dark|export (got ${surfaceRaw})`,
        parsed,
        raw,
      );
    }
    surface = surfaceRaw;
  }

  let orient: "horizontal" | "vertical" | undefined;
  const orientRaw = headers["orient"]?.trim();
  if (orientRaw !== undefined && orientRaw !== "") {
    if (orientRaw !== "horizontal" && orientRaw !== "vertical") {
      return fail(
        "E_UNKNOWN_FIELD",
        `orient must be horizontal|vertical (got ${orientRaw})`,
        parsed,
        raw,
      );
    }
    orient = orientRaw;
  }

  const role = headers["role"]?.trim() || undefined;
  if (role && !parsed.columns.includes(role)) {
    return fail(
      "E_UNKNOWN_FIELD",
      "role names a missing column",
      parsed,
      raw,
    );
  }

  const measures = measureColumns(type, x, y);
  const policy = missingPolicy(type, layout);
  for (const column of measures) {
    const index = parsed.columns.indexOf(column);
    if (index === -1) {
      continue;
    }
    for (let r = 0; r < parsed.rows.length; r++) {
      const cell = parsed.rows[r]![index] ?? "";
      const trimmed = cell.trim();
      if (trimmed === "") {
        if (policy === "required") {
          return fail(
            "E_MISSING_VALUE",
            `row ${r + 1}, column ${column}: empty value is not allowed on ${type}`,
            parsed,
            raw,
            { row: r + 1, column },
          );
        }
        continue;
      }
      if (!isNumericString(trimmed)) {
        return fail(
          "E_BAD_NUMBER",
          `row ${r + 1}, column ${column}: "${trimmed}" is not a number`,
          parsed,
          raw,
          { row: r + 1, column },
        );
      }
    }
  }

  if (
    layout === "percent" &&
    y &&
    columnHasNegative(parsed, y)
  ) {
    return fail(
      "E_NEGATIVE_VALUE",
      "percent layout cannot include negative values",
      parsed,
      raw,
    );
  }

  if (type === "gauge" && parsed.rows.length > 1) {
    return fail(
      "E_DUP_KEY",
      `gauge accepts a single observation (got ${parsed.rows.length} rows)`,
      parsed,
      raw,
      { row: 2, column: x },
    );
  }

  if (role && type === "waterfall") {
    const roleIndex = parsed.columns.indexOf(role);
    for (let r = 0; r < parsed.rows.length; r++) {
      const cell = (parsed.rows[r]![roleIndex] ?? "").trim();
      if (cell === "" || cell === "delta" || cell === "total" || cell === "subtotal") {
        continue;
      }
      return fail(
        "E_UNKNOWN_FIELD",
        `row ${r + 1}, column ${role}: role must be delta|total|subtotal (got ${cell})`,
        parsed,
        raw,
        { row: r + 1, column: role },
      );
    }
  }

  const seenKeys = new Map<string, number>();
  const seriesColumn = specified.series;
  for (let r = 0; r < parsed.rows.length; r++) {
    const row = parsed.rows[r]!;
    const xValue = cellAt(parsed, row, x);
    const seriesValue = seriesColumn ? cellAt(parsed, row, seriesColumn) : "";
    const key = duplicateKey(type, xValue, seriesValue);
    if (key === null) {
      continue;
    }
    const previous = seenKeys.get(key);
    if (previous !== undefined) {
      const where =
        type === "sankey"
          ? `duplicate link "${xValue}" → "${seriesValue}"`
          : seriesColumn && type !== "pie" && type !== "funnel" && type !== "gauge"
            ? `duplicate ${x} "${xValue}" for ${seriesColumn} "${seriesValue}"`
            : `duplicate ${x} "${xValue}"`;
      return fail(
        "E_DUP_KEY",
        `row ${r + 1}: ${where}`,
        parsed,
        raw,
        { row: r + 1, column: x },
      );
    }
    seenKeys.set(key, r);
  }

  if (type === "sankey" && seriesColumn) {
    const links = parsed.rows.map((row) => ({
      source: cellAt(parsed, row, x).trim(),
      target: cellAt(parsed, row, seriesColumn).trim(),
    }));
    const cycle = sankeyCycleNode(links);
    if (cycle) {
      return fail(
        "E_SANKEY_CYCLE",
        `sankey cycle involves "${cycle}"; a flow chart here is a directed acyclic graph`,
        parsed,
        raw,
      );
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
    theme,
    palette,
    unit,
    x,
    y,
    series,
    layout,
    innerRadius,
    min,
    max,
    surface,
    orient,
    role,
    table: parsed,
  });
  return { ok: true, chart };
}

function lineAt(source: string, index: number): number {
  let line = 1;
  const end = Math.min(Math.max(index, 0), source.length);
  for (let i = 0; i < end; i++) {
    if (source.charCodeAt(i) === 10) {
      line += 1;
    }
  }
  return line;
}

export type LocatedChart = {
  /** 1-based chart order in the file. */
  index: number;
  /** 1-based line of the chart block. */
  line: number;
  result: ParseResult;
};

/** Parse every chart block. An empty document is one E_EMPTY_FENCE result. */
export function parseDocument(
  source: string,
  options: ParseOptions = {},
): LocatedChart[] {
  const charts = extractCharts(source);
  if (charts.length === 0) {
    return [
      {
        index: 1,
        line: 1,
        result: fail("E_EMPTY_FENCE", "fence body empty", EMPTY_TABLE, source),
      },
    ];
  }
  return charts.map((chart, i) => ({
    index: i + 1,
    line: lineAt(source, chart.index),
    result: parseBody(chart.body, {
      form: chart.form,
      filename: options.filename,
      raw: chart.raw,
    }),
  }));
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
