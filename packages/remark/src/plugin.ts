import { extractCharts } from "@markvis/parser";
import { render, type RenderOptions } from "@markvis/html";

const LANGS = new Set(["chart", "markvis", "vis"]);

type Point = { offset?: number };

type PosNode = {
  type: string;
  lang?: string | null;
  value?: string;
  position?: { start: Point; end: Point };
  children?: PosNode[];
};

type Rep = {
  start: number;
  end: number;
  html: string;
};

type VFileLike = {
  value?: unknown;
  path?: string;
};

function htmlNode(value: string): PosNode {
  return { type: "html", value };
}

function filenameOf(file: VFileLike): string | undefined {
  return file.path ? file.path : undefined;
}

function sourceOf(file: VFileLike): string {
  if (typeof file.value === "string") {
    return file.value;
  }
  if (file.value == null) {
    return "";
  }
  return String(file.value);
}

function replaceInParent(parent: PosNode, reps: Rep[]): void {
  const children = parent.children;
  if (!children || children.length === 0) {
    return;
  }

  const next: PosNode[] = [];
  let i = 0;
  while (i < children.length) {
    const child = children[i]!;
    const start = child.position?.start.offset;
    const rep =
      start === undefined
        ? undefined
        : reps.find((r) => start >= r.start && start < r.end);
    if (!rep) {
      next.push(child);
      i += 1;
      continue;
    }
    let j = i + 1;
    while (j < children.length) {
      const siblingStart = children[j]!.position?.start.offset;
      if (
        siblingStart === undefined ||
        siblingStart < rep.start ||
        siblingStart >= rep.end
      ) {
        break;
      }
      j += 1;
    }
    next.push(htmlNode(rep.html));
    i = j;
  }
  parent.children = next;

  for (const child of parent.children) {
    if (child.type === "html") {
      continue;
    }
    replaceInParent(child, reps);
  }
}

function options(filename: string | undefined): RenderOptions {
  return filename === undefined ? {} : { filename };
}

function replaceRemainingFences(
  node: PosNode,
  filename: string | undefined,
): void {
  const children = node.children;
  if (!children) {
    return;
  }
  for (let i = 0; i < children.length; i++) {
    const child = children[i]!;
    if (child.type === "code") {
      const lang = (child.lang ?? "").toLowerCase();
      if (LANGS.has(lang)) {
        children[i] = htmlNode(render(child.value ?? "", options(filename)).html);
        continue;
      }
    }
    replaceRemainingFences(child, filename);
  }
}

function transform(tree: PosNode, file: VFileLike): void {
  const filename = filenameOf(file);
  const source = sourceOf(file);
  if (source) {
    const charts = extractCharts(source);
    const reps: Rep[] = charts.map((chart) => ({
      start: chart.index,
      end: chart.index + chart.raw.length,
      html: render(chart.raw, options(filename)).html,
    }));
    if (reps.length > 0) {
      replaceInParent(tree, reps);
    }
  }
  replaceRemainingFences(tree, filename);
}

export function remarkMarkvis() {
  return (tree: unknown, file: VFileLike) => {
    transform(tree as PosNode, file);
  };
}
