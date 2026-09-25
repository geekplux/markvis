import { columnValues, type ChartIR } from "@markvis/ir";

export type DataRow = {
  xLabel: string;
  xNum: number | undefined;
  /** Finite measure. Null is a missing cell, never a coerced zero. */
  y: number | null;
  series: string;
};

export type NumericClass =
  | { kind: "number"; value: number }
  | { kind: "missing" }
  | { kind: "invalid"; raw: string };

/** Empty cells are missing. Any other non-finite text is invalid. Zero stays zero. */
export function classifyNumeric(raw: string): NumericClass {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return { kind: "missing" };
  }
  const value = Number(trimmed);
  if (!Number.isFinite(value)) {
    return { kind: "invalid", raw: trimmed };
  }
  return { kind: "number", value: Object.is(value, -0) ? 0 : value };
}

export function uniqueInOrder(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value);
      out.push(value);
    }
  }
  return out;
}

export function loadRows(chart: ChartIR): DataRow[] {
  const xValues = columnValues(chart.table, chart.x);
  const yValues =
    chart.y === undefined ? undefined : columnValues(chart.table, chart.y);
  const seriesValues =
    chart.series === undefined
      ? undefined
      : columnValues(chart.table, chart.series);
  const fallbackSeries = chart.y ?? "value";
  const rows: DataRow[] = [];
  for (let i = 0; i < xValues.length; i++) {
    const xLabel = xValues[i] ?? "";
    const yRaw = yValues ? (yValues[i] ?? "") : "1";
    const yClass = classifyNumeric(yRaw);
    const xClass = classifyNumeric(xLabel);
    rows.push({
      xLabel,
      xNum: xClass.kind === "number" ? xClass.value : undefined,
      y: yClass.kind === "number" ? yClass.value : null,
      series: seriesValues ? (seriesValues[i] ?? "") : fallbackSeries,
    });
  }
  return rows;
}

export function seriesNames(rows: DataRow[]): string[] {
  return uniqueInOrder(rows.map((row) => row.series));
}

export function categoryNames(rows: DataRow[]): string[] {
  return uniqueInOrder(rows.map((row) => row.xLabel));
}

export function usesLinearX(chart: ChartIR, rows: DataRow[]): boolean {
  if (chart.type === "scatter" || chart.type === "hist") {
    return true;
  }
  if (chart.type === "bar" || chart.type === "pie") {
    return false;
  }
  return rows.length > 0 && rows.every((row) => row.xNum !== undefined);
}

/**
 * One value for a (series, category) pair.
 * Missing and unknown pairs are null. A repeated key is null so paint
 * cannot silently keep the last row; the parser rejects that case.
 */
export function groupedValue(
  rows: DataRow[],
  series: string,
  category: string,
): number | null {
  let found: number | null | undefined;
  let hits = 0;
  for (const row of rows) {
    if (row.series === series && row.xLabel === category) {
      hits += 1;
      if (hits > 1) {
        return null;
      }
      found = row.y;
    }
  }
  if (hits === 0 || found === undefined) {
    return null;
  }
  return found;
}

export function finiteValues(values: Array<number | null | undefined>): number[] {
  const out: number[] = [];
  for (const value of values) {
    if (value !== null && value !== undefined && Number.isFinite(value)) {
      out.push(value);
    }
  }
  return out;
}
