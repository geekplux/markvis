const CHART_LANG = /^(chart|markvis|vis)$/i;
const OPEN_FENCE = /^[ \t>]*(`{3,}|~{3,})/;
const CLOSE_FENCE = /^[ \t>]*(`{3,}|~{3,})[ \t]*$/;

type Point = { offset?: number };

type MdNode = {
  type: string;
  lang?: string | null;
  value?: string;
  position?: { start: Point; end: Point };
  data?: { hProperties?: Record<string, unknown> } & Record<string, unknown>;
  children?: MdNode[];
};

type FileLike = { value?: unknown };

/** The attribute a still-open chart block carries on its `code` element. */
export const OPEN_ATTRIBUTE = "data-markvis-open";

function closes(open: string, line: string): boolean {
  const close = CLOSE_FENCE.exec(line);
  if (!close) {
    return false;
  }
  const mark = close[1]!;
  return mark[0] === open[0] && mark.length >= open.length;
}

/**
 * True when a chart fence has no closing line yet and runs to the end of
 * the source: the part of a reply that is still arriving.
 */
function isOpen(source: string, start: number, end: number): boolean {
  if (source.slice(end).trim() !== "") {
    return false;
  }
  const lines = source.slice(start, end).split(/\r?\n/);
  const open = OPEN_FENCE.exec(lines[0] ?? "");
  if (!open) {
    return false;
  }
  return lines.length < 2 || !closes(open[1]!, lines[lines.length - 1]!);
}

function mark(node: MdNode, source: string): void {
  const start = node.position?.start.offset;
  const end = node.position?.end.offset;
  if (start === undefined || end === undefined || !isOpen(source, start, end)) {
    return;
  }
  // The last line may be cut mid-row; show only whole lines until it ends.
  if (!/[\r\n]/.test(source.slice(end))) {
    const value = node.value ?? "";
    const cut = value.search(/\r?\n[^\r\n]*$/);
    node.value = cut < 0 ? "" : value.slice(0, cut);
  }
  const data = node.data ?? {};
  data.hProperties = { ...data.hProperties, dataMarkvisOpen: "true" };
  node.data = data;
}

function walk(node: MdNode, source: string): void {
  if (node.type === "code" && CHART_LANG.test(node.lang ?? "")) {
    mark(node, source);
    return;
  }
  for (const child of node.children ?? []) {
    walk(child, source);
  }
}

/**
 * remark plugin for a reply that is still streaming. A chart fence with no
 * closing line yet is marked open, so `markvisComponents` shows a quiet
 * placeholder with the rows so far instead of an error. Leave it out once
 * the reply is complete, and an unclosed block draws as written.
 */
export function remarkMarkvisStreaming() {
  return (tree: unknown, file: FileLike) => {
    const source =
      typeof file?.value === "string" ? file.value : file?.value == null ? "" : String(file.value);
    if (source !== "") {
      walk(tree as MdNode, source);
    }
  };
}
