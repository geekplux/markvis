export type ChartForm = "fence" | "comment";

export type ExtractedChart = {
  index: number;
  lang: string;
  form: ChartForm;
  body: string;
  raw: string;
};

const FENCE_RE =
  /^```(chart|markvis|vis)[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/gm;

const COMMENT_RE = /<!--\s*(chart|markvis|vis)\s*:\s*([\s\S]*?)-->/gi;

function parseCommentInner(inner: string): {
  type: string;
  attrs: Record<string, string>;
} {
  const trimmed = inner.trim();
  const typeMatch = trimmed.match(/^([A-Za-z0-9_-]+)/);
  const type = typeMatch?.[1] ?? "";
  const rest = typeMatch ? trimmed.slice(typeMatch[0].length) : trimmed;
  const attrs: Record<string, string> = {};
  const attrRe =
    /([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"([^"]*)"|(\S+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(rest)) !== null) {
    const key = match[1]!;
    attrs[key] = match[2] ?? match[3] ?? "";
  }
  return { type, attrs };
}

function readGfmAfter(source: string, start: number): string {
  const after = source.slice(start).replace(/^[ \t]*\r?\n/, "");
  const lines = after.split(/\r?\n/);
  const tableLines: string[] = [];
  for (const line of lines) {
    if (line.trim().startsWith("|")) {
      tableLines.push(line);
      continue;
    }
    if (tableLines.length === 0 && line.trim() === "") {
      continue;
    }
    break;
  }
  return tableLines.join("\n");
}

function headersToBody(
  type: string,
  attrs: Record<string, string>,
  gfm: string,
): string {
  const lines = [`type: ${type}`];
  for (const [key, value] of Object.entries(attrs)) {
    lines.push(`${key}: ${value}`);
  }
  return `${lines.join("\n")}\n\n${gfm}`;
}

export function extractCharts(source: string): ExtractedChart[] {
  const found: ExtractedChart[] = [];

  FENCE_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = FENCE_RE.exec(source)) !== null) {
    found.push({
      index: match.index,
      lang: match[1]!.toLowerCase(),
      form: "fence",
      body: match[2] ?? "",
      raw: match[0],
    });
  }

  COMMENT_RE.lastIndex = 0;
  while ((match = COMMENT_RE.exec(source)) !== null) {
    const lang = match[1]!.toLowerCase();
    const inner = match[2] ?? "";
    const end = match.index + match[0].length;
    const gfm = readGfmAfter(source, end);
    const { type, attrs } = parseCommentInner(inner);
    found.push({
      index: match.index,
      lang,
      form: "comment",
      body: headersToBody(type, attrs, gfm),
      raw: gfm ? `${match[0]}\n${gfm}` : match[0],
    });
  }

  found.sort((a, b) => a.index - b.index);
  return found;
}
