export type LooseTable = {
  columns: string[];
  rows: string[][];
};

export function isNumericString(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") {
    return false;
  }
  return Number.isFinite(Number(trimmed));
}

export function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  let wasQuoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i += 1;
          continue;
        }
        quoted = false;
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === '"') {
      quoted = true;
      wasQuoted = true;
      continue;
    }
    if (ch === ",") {
      cells.push(wasQuoted ? current : current.trim());
      current = "";
      wasQuoted = false;
      continue;
    }
    current += ch;
  }
  cells.push(wasQuoted ? current : current.trim());
  return cells;
}

export function splitNonEmptyLines(text: string): string[] {
  return text.split(/\r?\n/).filter((line) => line.trim() !== "");
}

export function parseCsv(text: string): LooseTable {
  const lines = splitNonEmptyLines(text);
  if (lines.length === 0) {
    return { columns: [], rows: [] };
  }
  const columns = parseCsvLine(lines[0]!);
  const rows = lines.slice(1).map((line) => parseCsvLine(line));
  return { columns, rows };
}

export function parseCsvRows(text: string): string[][] {
  return splitNonEmptyLines(text).map((line) => parseCsvLine(line));
}

function splitGfmRow(line: string): string[] {
  let inner = line.trim();
  if (inner.startsWith("|")) {
    inner = inner.slice(1);
  }
  if (inner.endsWith("|")) {
    inner = inner.slice(0, -1);
  }
  return inner.split("|").map((cell) => cell.trim());
}

export function isGfmSeparatorLine(line: string): boolean {
  const cells = splitGfmRow(line);
  if (cells.length === 0) {
    return false;
  }
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, "")));
}

export function looksLikeGfm(text: string): boolean {
  const first = splitNonEmptyLines(text)[0];
  return first !== undefined && first.trim().startsWith("|");
}

export function parseGfm(text: string): LooseTable {
  const lines = splitNonEmptyLines(text);
  if (lines.length === 0) {
    return { columns: [], rows: [] };
  }
  const columns = splitGfmRow(lines[0]!);
  let start = 1;
  if (lines[1] !== undefined && isGfmSeparatorLine(lines[1])) {
    start = 2;
  }
  const rows = lines.slice(start).map((line) => splitGfmRow(line));
  return { columns, rows };
}

export function hasDuplicateColumns(columns: string[]): boolean {
  return new Set(columns).size !== columns.length;
}

export function hasWidthMismatch(
  columns: string[],
  rows: string[][],
): boolean {
  return rows.some((row) => row.length !== columns.length);
}

export function columnIsNumeric(
  table: LooseTable,
  colIndex: number,
): boolean {
  let seen = false;
  for (const row of table.rows) {
    const cell = row[colIndex];
    if (cell === undefined || cell.trim() === "") {
      continue;
    }
    if (!isNumericString(cell)) {
      return false;
    }
    seen = true;
  }
  return seen;
}
