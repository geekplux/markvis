import { render, type RenderOptions } from "@markvis/html";
import { unescapeHtml } from "./html.js";

const LANG_CLASS = /\blanguage-(chart|markvis|vis)\b/i;

const PRE_RE =
  /<pre([^>]*)>(?:\s*<code([^>]*)>)?([\s\S]*?)(?:<\/code>\s*)?<\/pre>/gi;

const CODE_RE =
  /<code([^>]*\blanguage-(?:chart|markvis|vis)\b[^>]*)>([\s\S]*?)<\/code>/gi;

function classAttr(attrs: string): string {
  const dq = attrs.match(/\bclass\s*=\s*"([^"]*)"/i);
  if (dq) {
    return dq[1] ?? "";
  }
  const sq = attrs.match(/\bclass\s*=\s*'([^']*)'/i);
  return sq?.[1] ?? "";
}

function decodeBody(html: string): string {
  return unescapeHtml(html.replace(/<br\s*\/?>/gi, "\n")).replace(
    /^\n+|\n+$/g,
    "",
  );
}

/** Page defaults set by `initialize`. A block's own fields still win. */
export type PageDefaults = Pick<RenderOptions, "theme" | "palette" | "surface" | "width">;

let pageDefaults: PageDefaults = {};

/**
 * Set page defaults for `run`, `init`, and `render`: `theme`, `palette`,
 * `surface`, and `width`. A block's own `theme:` / `palette:` /
 * `surface:` win. Calling it again replaces the defaults.
 */
export function initialize(defaults: PageDefaults = {}): void {
  const next: PageDefaults = {};
  if (defaults.theme !== undefined) next.theme = defaults.theme;
  if (defaults.palette !== undefined) next.palette = defaults.palette;
  if (defaults.surface !== undefined) next.surface = defaults.surface;
  if (defaults.width !== undefined) next.width = defaults.width;
  pageDefaults = next;
}

/** `render` with the page defaults under the call's own options. */
export function renderWithDefaults(text: string, options: RenderOptions = {}) {
  return render(text, { ...pageDefaults, ...options });
}

/** HTML from a Markdown renderer, with chart code blocks drawn. */
export function replaceLanguageBlocks(html: string): string {
  const replacedPre = html.replace(
    PRE_RE,
    (full, preAttrs: string, codeAttrs: string | undefined, inner: string) => {
      const lang =
        LANG_CLASS.test(classAttr(preAttrs ?? "")) ||
        LANG_CLASS.test(classAttr(codeAttrs ?? ""));
      return lang ? renderWithDefaults(decodeBody(inner)).html : full;
    },
  );
  return replacedPre.replace(CODE_RE, (full, attrs: string, inner: string) =>
    LANG_CLASS.test(classAttr(attrs ?? "")) ? renderWithDefaults(decodeBody(inner)).html : full,
  );
}

const CHART_LANG = /^(?:chart|markvis|vis)$/i;
const PREFIXED = /^(?:language|lang)-(.+)$/i;
/** Wrappers a highlighter puts around `pre`; replaced with it, chrome and all. */
const WRAPPER_CLASS = /(?:^|\s)(?:highlight|highlighter-rouge|sourceCode|codehilite|code-block|language-[\w-]+)(?:\s|$)/i;

/** The chart language an element declares through its class or `data-lang`. */
function declaredLang(el: Element, bareClass: boolean): boolean {
  const dataLang = el.getAttribute("data-lang");
  if (dataLang && CHART_LANG.test(dataLang.trim())) {
    return true;
  }
  for (const token of Array.from(el.classList)) {
    const prefixed = PREFIXED.exec(token);
    if (prefixed ? CHART_LANG.test(prefixed[1]!) : bareClass && CHART_LANG.test(token)) {
      return true;
    }
  }
  return false;
}

function isTag(el: Element | null, tag: string): el is Element {
  return el !== null && el.tagName.toLowerCase() === tag;
}

/**
 * True when a `pre` is a chart block: `chart`, `markvis`, or `vis` as
 * `language-X`, `lang-X`, or `data-lang="X"` on its `code`, on the `pre`,
 * or on a wrapper `div` up to two levels out, or as a bare class on the
 * `pre` (Pandoc).
 */
export function isChartBlock(pre: Element): boolean {
  const code = Array.from(pre.children).find((child) => isTag(child, "code"));
  if (code && declaredLang(code, false)) return true;
  if (declaredLang(pre, true)) return true;
  let el = pre.parentElement;
  for (let depth = 0; depth < 2 && isTag(el, "div"); depth++) {
    if (declaredLang(el, false)) return true;
    el = el.parentElement;
  }
  return false;
}

/** The element to replace: the `pre`, or the highlighter wrappers around it. */
function outermost(pre: Element): Element {
  let host = pre;
  for (let depth = 0; depth < 2; depth++) {
    const parent = host.parentElement;
    if (!isTag(parent, "div") || !WRAPPER_CLASS.test(parent.className)) break;
    host = parent;
  }
  return host;
}

function replaceWith(nodes: Node[], html: string): void {
  const first = nodes[0];
  const parent = first?.parentNode;
  if (!first || !parent) return;
  const doc = first.ownerDocument ?? document;
  const wrap = doc.createElement("div");
  wrap.innerHTML = html;
  const frag = doc.createDocumentFragment();
  while (wrap.firstChild) frag.appendChild(wrap.firstChild);
  parent.insertBefore(frag, first);
  for (const node of nodes) node.parentNode?.removeChild(node);
}

/** Text of a block; highlighter spans and `<br>` do not matter. */
function blockText(el: Element): string {
  const clone = el.cloneNode(true) as Element;
  for (const br of Array.from(clone.querySelectorAll("br"))) br.replaceWith("\n");
  return (clone.textContent ?? "").replace(/^\n+|\n+$/g, "");
}

function drawBlock(el: Element): boolean {
  const host = isTag(el, "pre") ? outermost(el) : el;
  if (!host.parentNode) return false;
  replaceWith([host], renderWithDefaults(blockText(el)).html);
  return true;
}

const COMMENT = /^\s*(?:chart|markvis|vis)\s*:/i;
const SEPARATOR_CELL = /^:?[-–—]+:?$/;

function cellText(cell: Element): string {
  return (cell.textContent ?? "").replace(/\s+/g, " ").trim();
}

function gfmRow(cells: string[]): string {
  return `| ${cells.join(" | ")} |`;
}

/** A rendered `<table>` back to GFM rows: header, separator, body. */
function tableToGfm(table: Element): string | undefined {
  const rows = Array.from(table.querySelectorAll("tr"));
  const head = rows[0];
  if (!head) return undefined;
  const columns = Array.from(head.children).map(cellText);
  const body = rows.slice(1).map((row) => gfmRow(Array.from(row.children).map(cellText)));
  return [gfmRow(columns), gfmRow(columns.map(() => "---")), ...body].join("\n");
}

/**
 * A paragraph of pipe rows, from a renderer that did not make a table
 * right after a comment (kramdown). Typographic dashes in the separator
 * row go back to `---`.
 */
function pipeParagraphToGfm(p: Element): string | undefined {
  const lines = (p.textContent ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length < 2 || !lines.every((line) => line.startsWith("|"))) return undefined;
  return lines
    .map((line) => {
      const cells = line.replace(/^\||\|$/g, "").split("|").map((cell) => cell.trim());
      return cells.every((cell) => SEPARATOR_CELL.test(cell)) ? gfmRow(cells.map(() => "---")) : line;
    })
    .join("\n");
}

/** The next element after a node, with only whitespace text between. */
function nextElement(node: Node): Element | undefined {
  let next = node.nextSibling;
  while (next) {
    if (next.nodeType === 1) return next as Element;
    if (next.nodeType === 3 && (next.textContent ?? "").trim() !== "") return undefined;
    next = next.nextSibling;
  }
  return undefined;
}

function drawComments(root: ParentNode): number {
  const doc = (root as Node).ownerDocument ?? (root as Document);
  const walker = doc.createTreeWalker(root as Node, 128 /* NodeFilter.SHOW_COMMENT */);
  const comments: Comment[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (COMMENT.test((node as Comment).data)) comments.push(node as Comment);
  }
  let count = 0;
  for (const comment of comments) {
    const next = nextElement(comment);
    if (!next) continue;
    const rows = isTag(next, "table")
      ? tableToGfm(next)
      : isTag(next, "p")
        ? pipeParagraphToGfm(next)
        : undefined;
    if (!rows) continue;
    replaceWith([comment, next], renderWithDefaults(`<!--${comment.data}-->\n${rows}\n`).html);
    count += 1;
  }
  return count;
}

export type RunOptions = {
  /** Elements that hold chart text. Each is drawn, whatever its class. */
  nodes?: Iterable<Element> | ArrayLike<Element>;
  /** A selector for elements that hold chart text. */
  querySelector?: string;
  /** Where to look for chart blocks and comments. Default: the document. */
  root?: ParentNode;
};

/**
 * Draw chart blocks and chart comments. With `nodes` or `querySelector`,
 * draw exactly those elements; otherwise find every chart code block and
 * every chart comment followed by a table under `root`. Returns how many
 * were drawn. A drawn block is gone from the page, so running twice
 * never draws twice.
 */
export function run(options: RunOptions = {}): number {
  if (typeof document === "undefined") {
    return 0;
  }
  const root = options.root ?? document;
  if (options.nodes !== undefined || options.querySelector !== undefined) {
    const picked = [
      ...Array.from(options.nodes ?? []),
      ...(options.querySelector ? Array.from(root.querySelectorAll(options.querySelector)) : []),
    ];
    return picked.filter((el) => el.parentNode !== null && drawBlock(el)).length;
  }
  let count = 0;
  for (const pre of Array.from(root.querySelectorAll("pre"))) {
    if (pre.parentNode && isChartBlock(pre) && drawBlock(pre)) count += 1;
  }
  // A chart `code` used as a block on its own, outside any `pre`.
  for (const code of Array.from(root.querySelectorAll("code"))) {
    if (code.parentNode && !code.closest("pre") && declaredLang(code, false) && drawBlock(code)) {
      count += 1;
    }
  }
  return count + drawComments(root);
}

/** Short form of `run({ root })`. */
export function init(root?: ParentNode): number {
  return run(root === undefined ? {} : { root });
}

/** @deprecated Same as `init(root)`. */
export function replaceInDocument(root: ParentNode = document): number {
  return init(root);
}

/** Run once the DOM is ready (now, if it already is). */
export function autoReplace(): void {
  if (typeof document === "undefined") {
    return;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => run(), { once: true });
  } else {
    run();
  }
}
