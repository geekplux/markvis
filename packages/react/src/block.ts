/** Header fields of a chart given as an object. Same names as a fence header. */
export type ChartFields = {
  type: string;
  [field: string]: string | number | null | undefined;
};

export type DataRow = Record<string, unknown>;

/** Fields whose value names a column. Their columns come first, in this order. */
const COLUMN_FIELDS = ["x", "y", "series", "role", "target"] as const;

/** CSV is read line by line, so a value cannot span lines. */
function oneLine(value: string): string {
  return value.replace(/\r\n|\r|\n/g, " ");
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  return oneLine(String(value));
}

function csvCell(text: string): string {
  if (/[",]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function csvLine(cells: string[]): string {
  const line = cells.map(csvCell).join(",");
  // A blank line is skipped by the reader; keep the row.
  if (line.trim() === "") {
    return cells.length > 1 ? line : '""';
  }
  return line;
}

/** Column order: columns named by the chart, then other keys as first seen. */
function columnsOf(chart: ChartFields, data: readonly DataRow[]): string[] {
  const seen: string[] = [];
  for (const row of data) {
    for (const key of Object.keys(row)) {
      if (!seen.includes(key)) {
        seen.push(key);
      }
    }
  }
  const named: string[] = [];
  for (const field of COLUMN_FIELDS) {
    const name = chart[field];
    if (typeof name === "string" && seen.includes(name) && !named.includes(name)) {
      named.push(name);
    }
  }
  return [...named, ...seen.filter((key) => !named.includes(key))];
}

/**
 * A chart object plus rows to the text of one block: header lines, a blank
 * line, then CSV. The parser validates it like any typed block, so the
 * error codes are the same.
 */
export function chartBlock(chart: ChartFields, data: readonly DataRow[]): string {
  const header = Object.entries(chart)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${key}: ${oneLine(String(value))}`);
  const columns = columnsOf(chart, data);
  const names = columns.map(oneLine);
  const lines = [csvLine(names)];
  // The header row decides CSV vs GFM vs JSON; quote a first name that could mislead.
  if (/^\s*[|[{]/.test(lines[0]!)) {
    lines[0] = [`"${names[0]!.replace(/"/g, '""')}"`, ...names.slice(1).map(csvCell)].join(",");
  }
  for (const row of data) {
    lines.push(csvLine(columns.map((col) => cellText(row[col]))));
  }
  return `${header.join("\n")}\n\n${lines.join("\n")}\n`;
}
