import { chartBlockHtml, isChartLang, unescapeHtml } from "./html.js";

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

function langFromClass(cls: string): string | undefined {
  const match = cls.match(LANG_CLASS);
  const lang = match?.[1]?.toLowerCase();
  return lang && isChartLang(lang) ? lang : undefined;
}

function decodeBody(html: string): string {
  return unescapeHtml(html.replace(/<br\s*\/?>/gi, "\n")).replace(
    /^\n+|\n+$/g,
    "",
  );
}

export function replaceLanguageBlocks(html: string): string {
  const replacedPre = html.replace(
    PRE_RE,
    (full, preAttrs: string, codeAttrs: string | undefined, inner: string) => {
      const lang =
        langFromClass(classAttr(preAttrs ?? "")) ??
        langFromClass(classAttr(codeAttrs ?? ""));
      if (!lang) {
        return full;
      }
      return chartBlockHtml(decodeBody(inner), undefined, lang);
    },
  );
  return replacedPre.replace(
    CODE_RE,
    (full, attrs: string, inner: string) => {
      const lang = langFromClass(classAttr(attrs ?? ""));
      if (!lang) {
        return full;
      }
      return chartBlockHtml(decodeBody(inner), undefined, lang);
    },
  );
}

const SELECTOR = [
  "pre.language-chart",
  "pre.language-markvis",
  "pre.language-vis",
  "code.language-chart",
  "code.language-markvis",
  "code.language-vis",
].join(",");

function outerHost(el: Element): Element {
  if (el.tagName.toLowerCase() === "code") {
    const parent = el.parentElement;
    if (parent && parent.tagName.toLowerCase() === "pre") {
      return parent;
    }
  }
  return el;
}

export function replaceInDocument(root: ParentNode = document): number {
  const seen = new Set<Element>();
  const nodes = root.querySelectorAll(SELECTOR);
  let count = 0;
  for (const node of Array.from(nodes)) {
    const host = outerHost(node);
    if (seen.has(host)) {
      continue;
    }
    seen.add(host);
    const langMatch = `${host.className} ${node.className}`.match(LANG_CLASS);
    const lang = langMatch?.[1]?.toLowerCase() ?? "chart";
    const text = (host.textContent ?? "").replace(/^\n+|\n+$/g, "");
    const html = chartBlockHtml(text, undefined, lang);
    const wrap = host.ownerDocument.createElement("div");
    wrap.innerHTML = html;
    const parent = host.parentNode;
    if (!parent) {
      continue;
    }
    const frag = host.ownerDocument.createDocumentFragment();
    while (wrap.firstChild) {
      frag.appendChild(wrap.firstChild);
    }
    parent.replaceChild(frag, host);
    count += 1;
  }
  return count;
}

export function init(root?: ParentNode): number {
  if (typeof document === "undefined") {
    return 0;
  }
  return replaceInDocument(root ?? document);
}

export function autoReplace(): void {
  if (typeof document === "undefined") {
    return;
  }
  const run = (): void => {
    init();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
}
