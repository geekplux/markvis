import { columnValues, type ChartIR } from "@markvis/ir";

export type DataRow = {
  xLabel: string;
  xNum: number | undefined;
  y: number;
  series: string;
};

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

function parseOptionalNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return undefined;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function loadRows(chart: ChartIR): DataRow[] {
  const xValues = columnValues(chart.table, chart.x);
  const yValues =
    chart.y === undefined
      ? undefined
      : columnValues(chart.table, chart.y);
  const seriesValues =
    chart.series === undefined
      ? undefined
      : columnValues(chart.table, chart.series);
  const fallbackSeries = chart.y ?? "value";
  const rows: DataRow[] = [];
  for (let i = 0; i < xValues.length; i++) {
    const xLabel = xValues[i] ?? "";
    const yRaw = yValues ? (yValues[i] ?? "") : "1";
    const yParsed = Number(yRaw.trim());
    rows.push({
      xLabel,
      xNum: parseOptionalNumber(xLabel),
      y: Number.isFinite(yParsed) ? yParsed : 0,
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

/** Last row wins for a (series, category) pair. Missing → 0. */
export function groupedValue(
  rows: DataRow[],
  series: string,
  category: string,
): number {
  let found: number | undefined;
  for (const row of rows) {
    if (row.series === series && row.xLabel === category) {
      found = row.y;
    }
  }
  return found ?? 0;
}
