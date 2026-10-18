/**
 * Seeded fuzz of markvis/rehype: random chart blocks and random text in
 * Markdown. It never throws, every chart block becomes a figure or one
 * error line, and every element in the output is one markvis writes.
 */
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import { describe, expect, it } from "vitest";
import { rehypeMarkvis } from "../src/index.js";

let seed = 20261010;
const rnd = (): number => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const pick = <T>(items: readonly T[]): T => items[Math.floor(rnd() * items.length)]!;

const TYPES = ["bar", "line", "pie", "hist", "sankey", "calendar", "gauge", "donut", ""];
const CELLS = ["A", "<b>", "&amp;", '"q"', "'s", "1", "-1", "1e308", "", "2026-01-01", "x/>y", "</svg>", "<!--"];
const ALLOWED = new Set([
  "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "p", "svg", "g", "path", "rect", "circle",
  "line", "polyline", "text", "tspan", "title", "desc", "defs", "pattern", "pre", "code", "h1", "ul", "li",
]);

function randomText(): string {
  let s = "";
  for (let i = Math.floor(rnd() * 120); i > 0; i--) s += String.fromCharCode(32 + Math.floor(rnd() * 0x250));
  return s;
}

function block(): string {
  const rows = Array.from({ length: Math.floor(rnd() * 8) }, () => `${pick(CELLS)},${pick(CELLS)},${pick(CELLS)}`);
  const body = rnd() < 0.15 ? randomText() : `type: ${pick(TYPES)}\ntitle: ${pick(CELLS)}\nx: a\ny: b\nseries: c\n\na,b,c\n${rows.join("\n")}`;
  return `\`\`\`${pick(["chart", "vis", "markvis"])}\n${body}\n\`\`\``;
}

type Node = { type: string; tagName?: string; children?: Node[] };

describe("rehype fuzz", () => {
  it("handles 400 random documents", () => {
    for (let i = 0; i < 400; i++) {
      const parts = Array.from({ length: 1 + Math.floor(rnd() * 3) }, () => (rnd() < 0.7 ? block() : pick(["# h", "- item", "text", "```js\nx\n```"])));
      const markdown = parts.join("\n\n");
      const processor = remark().use(remarkRehype).use(rehypeMarkvis);
      const tree = processor.runSync(processor.parse(markdown)) as Node;
      let figures = 0;
      let errors = 0;
      const walk = (node: Node) => {
        if (node.type === "raw") throw new Error(`raw node in ${JSON.stringify(markdown)}`);
        if (node.type === "element") {
          expect(ALLOWED.has(node.tagName!), `${node.tagName} in ${JSON.stringify(markdown)}`).toBe(true);
          if (node.tagName === "figure") figures += 1;
        }
        for (const child of node.children ?? []) walk(child);
      };
      walk(tree);
      const html = JSON.stringify(tree);
      errors = (html.match(/markvis-error/g) ?? []).length;
      expect(figures + errors, markdown).toBe(parts.filter((p) => p.startsWith("```") && !p.startsWith("```js")).length);
    }
  });
});
