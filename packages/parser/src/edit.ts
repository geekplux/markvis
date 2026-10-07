/**
 * Read and set one header field on the first chart in a Markdown source,
 * in either form: a `key: value` header line in a fence, or a `key=value`
 * pair inside a `<!-- chart: … -->` comment. Everything else is kept byte
 * for byte, so a playground or gallery can switch a chart's look without
 * touching its data.
 */

const FENCE_RE = /^```(?:chart|markvis|vis)[ \t]*\r?\n([\s\S]*?)^```[ \t]*$/m;
const COMMENT_RE = /<!--\s*(?:chart|markvis|vis)\s*:([\s\S]*?)-->/i;

/** Header keys that sit together at the top of a fence, in this order. */
const ORDER = ["markvis", "theme", "palette", "surface"];

type Located =
  | { form: "fence"; start: number; header: string; headerEnd: number }
  | { form: "comment"; start: number; inner: string; innerStart: number };

function firstChart(source: string): Located | null {
  const fence = FENCE_RE.exec(source);
  const comment = COMMENT_RE.exec(source);
  const fenceAt = fence?.index ?? Infinity;
  const commentAt = comment?.index ?? Infinity;
  if (fence && fenceAt <= commentAt) {
    const bodyStart = fence.index + fence[0].indexOf("\n") + 1;
    const body = fence[1]!;
    const blank = body.search(/^[ \t]*\r?$/m);
    const header = blank === -1 ? body : body.slice(0, blank);
    return { form: "fence", start: bodyStart, header, headerEnd: bodyStart + header.length };
  }
  if (comment) {
    return {
      form: "comment",
      start: comment.index,
      inner: comment[1]!,
      innerStart: comment.index + comment[0].indexOf(":") + 1,
    };
  }
  // A bare body (header lines, a blank line, data), as typed into a playground.
  if (/^\s*[A-Za-z][\w]*[ \t]*:/.test(source)) {
    const blank = source.search(/^[ \t]*\r?$/m);
    const header = blank === -1 ? source : source.slice(0, blank);
    return { form: "fence", start: 0, header, headerEnd: header.length };
  }
  return null;
}

const headerLine = (key: string) => new RegExp(`^[ \\t]*${key}[ \\t]*:[ \\t]*(.*?)[ \\t]*$`, "m");
/**
 * The `key=value` pair for `key`, scanned left to right like the parser
 * reads a chart comment, so text inside a quoted value is never a match.
 */
function findCommentAttr(
  inner: string,
  key: string,
): { start: number; end: number; value: string } | undefined {
  const pairs = /(\s)([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:"([^"]*)"|(\S+))/g;
  for (const m of inner.matchAll(pairs)) {
    if (m[2] === key) {
      const start = m.index! + m[1]!.length;
      return { start, end: m.index! + m[0].length, value: m[3] ?? m[4] ?? "" };
    }
  }
  return undefined;
}

/** The field's value on the first chart, or undefined when it is not set. */
export function readChartField(source: string, key: string): string | undefined {
  const chart = firstChart(source);
  if (!chart) return undefined;
  if (chart.form === "fence") {
    const value = chart.header.match(headerLine(key))?.[1];
    return value === undefined || value === "" ? undefined : value;
  }
  return findCommentAttr(chart.inner, key)?.value;
}

/** Set the field on the first chart, or remove it when `value` is null. */
export function setChartField(source: string, key: string, value: string | null): string {
  const chart = firstChart(source);
  if (!chart) return source;
  if (chart.form === "fence") {
    const next = setHeaderLine(chart.header, key, value);
    return source.slice(0, chart.start) + next + source.slice(chart.headerEnd);
  }
  const next = setCommentAttr(chart.inner, key, value);
  return source.slice(0, chart.innerStart) + next + source.slice(chart.innerStart + chart.inner.length);
}

function setHeaderLine(header: string, key: string, value: string | null): string {
  const re = headerLine(key);
  if (re.test(header)) {
    return value === null
      ? header.replace(new RegExp(`^[ \\t]*${key}[ \\t]*:.*(?:\\r?\\n|$)`, "m"), "")
      : header.replace(re, `${key}: ${value}`);
  }
  if (value === null) return header;
  const line = `${key}: ${value}`;
  // After the nearest earlier key in ORDER, else at the top.
  const earlier = ORDER.slice(0, Math.max(0, ORDER.indexOf(key))).reverse();
  for (const prev of earlier) {
    const match = header.match(headerLine(prev));
    if (match && match.index !== undefined) {
      const end = match.index + match[0].length;
      return `${header.slice(0, end)}\n${line}${header.slice(end)}`;
    }
  }
  return header === "" ? line : `${line}\n${header}`;
}

function setCommentAttr(inner: string, key: string, value: string | null): string {
  const pair = value === null ? "" : `${key}=${/\s/.test(value) ? `"${value}"` : value}`;
  const found = findCommentAttr(inner, key);
  if (found) {
    // Removing also drops the space before the pair.
    const from = value === null ? found.start - 1 : found.start;
    return inner.slice(0, from) + pair + inner.slice(found.end);
  }
  if (value === null) return inner;
  const trailing = inner.match(/\s*$/)?.[0] ?? "";
  return `${inner.slice(0, inner.length - trailing.length)} ${pair}${trailing}`;
}
