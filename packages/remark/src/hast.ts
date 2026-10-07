/**
 * A small parser from markvis's own HTML (figure, SVG, table, error line)
 * to hast. It reads only what render() writes: tags with double-quoted
 * attributes, `/>` self-closing tags, text, and the entities escapeHtml
 * and render-svg emit. Anything else is kept as text, never as markup.
 */

export type HastText = { type: "text"; value: string };
export type HastElement = {
  type: "element";
  tagName: string;
  properties: Record<string, string | string[]>;
  children: HastNode[];
};
export type HastNode = HastText | HastElement;

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

export function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (whole, ref: string) => {
    if (ref[0] === "#") {
      const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
      return Number.isFinite(code) && code >= 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
    }
    return NAMED[ref.toLowerCase()] ?? whole;
  });
}

const TAG = /<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=/>]+="[^"]*")*)\s*(\/?)>/g;
const ATTR = /([^\s=/>]+)="([^"]*)"/g;

function properties(attrs: string): Record<string, string | string[]> {
  const props: Record<string, string | string[]> = {};
  for (const m of attrs.matchAll(ATTR)) {
    const name = m[1]!;
    const value = decodeEntities(m[2]!);
    if (name === "class") {
      props["className"] = value.split(/\s+/).filter(Boolean);
    } else {
      props[name] = value;
    }
  }
  return props;
}

/** markvis HTML to hast nodes. Unclosed tags close at the end. */
export function htmlToHast(html: string): HastNode[] {
  const root: HastElement = { type: "element", tagName: "#root", properties: {}, children: [] };
  const stack: HastElement[] = [root];
  let last = 0;
  const text = (value: string) => {
    if (value !== "") stack[stack.length - 1]!.children.push({ type: "text", value: decodeEntities(value) });
  };
  for (const m of html.matchAll(TAG)) {
    text(html.slice(last, m.index));
    last = m.index! + m[0].length;
    const [, closing, tagName, attrs, selfClosing] = m;
    if (closing) {
      const at = stack.map((el) => el.tagName).lastIndexOf(tagName!);
      if (at > 0) stack.length = at;
      continue;
    }
    const el: HastElement = { type: "element", tagName: tagName!, properties: properties(attrs ?? ""), children: [] };
    stack[stack.length - 1]!.children.push(el);
    if (!selfClosing) stack.push(el);
  }
  text(html.slice(last));
  return root.children;
}
