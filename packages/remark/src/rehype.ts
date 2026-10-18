import { render } from "@markvis/html";
import { htmlToHast, type HastNode } from "./hast.js";

const CHART_CLASS = /^language-(?:chart|markvis|vis)$/i;
const COMMENT = /^\s*(?:chart|markvis|vis)\s*:/i;

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

type FileLike = { path?: string };

function classes(node: Node): string[] {
  const value = node.properties?.["className"];
  if (Array.isArray(value)) return value.map(String);
  return typeof value === "string" ? value.split(/\s+/) : [];
}

function textOf(node: Node): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function isElement(node: Node | undefined, tagName: string): node is Node {
  return node?.type === "element" && node.tagName === tagName;
}

/** The `code` of a `pre > code.language-chart|markvis|vis`, if this is one. */
function chartCode(node: Node): Node | undefined {
  if (!isElement(node, "pre")) return undefined;
  const code = (node.children ?? []).find((child) => isElement(child, "code"));
  return code && classes(code).some((c) => CHART_CLASS.test(c)) ? code : undefined;
}

/** A hast `<table>` back to GFM rows for the comment form. */
function tableToGfm(table: Node): string | undefined {
  const rows: string[][] = [];
  const walk = (node: Node) => {
    if (isElement(node, "tr")) {
      rows.push((node.children ?? []).filter((c) => isElement(c, "th") || isElement(c, "td")).map((c) => textOf(c).replace(/\s+/g, " ").trim()));
      return;
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(table);
  const [head, ...body] = rows;
  if (!head) return undefined;
  const line = (cells: string[]) => `| ${cells.join(" | ")} |`;
  return [line(head), line(head.map(() => "---")), ...body.map(line)].join("\n");
}

function blockNodes(text: string, filename: string | undefined): HastNode[] {
  return htmlToHast(render(text, filename === undefined ? {} : { filename }).html);
}

function transform(parent: Node, filename: string | undefined): void {
  const children = parent.children;
  if (!children) return;
  for (let i = 0; i < children.length; i++) {
    const child = children[i]!;
    const code = chartCode(child);
    if (code) {
      const nodes = blockNodes(textOf(code).replace(/\n$/, ""), filename);
      children.splice(i, 1, ...nodes);
      i += nodes.length - 1;
      continue;
    }
    if (child.type === "comment" && COMMENT.test(child.value ?? "")) {
      let j = i + 1;
      while (j < children.length && children[j]!.type === "text" && (children[j]!.value ?? "").trim() === "") j++;
      const table = children[j];
      const rows = isElement(table, "table") ? tableToGfm(table) : undefined;
      if (rows) {
        const nodes = blockNodes(`<!--${child.value}-->\n${rows}\n`, filename);
        children.splice(i, j - i + 1, ...nodes);
        i += nodes.length - 1;
        continue;
      }
    }
    transform(child, filename);
  }
}

/**
 * rehype plugin: `pre > code.language-chart|markvis|vis` becomes a real
 * hast figure (SVG subtree, caption, data table), or the table and one
 * error line. No raw HTML nodes, so it works in MDX and with
 * react-markdown. A chart comment followed by a table (when the pipeline
 * keeps comments) becomes a figure too.
 */
export function rehypeMarkvis() {
  return (tree: unknown, file?: FileLike) => {
    transform(tree as Node, file?.path ? file.path : undefined);
  };
}
