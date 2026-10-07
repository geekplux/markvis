// @vitest-environment happy-dom
/**
 * Seeded fuzz of the drop-in over random page HTML: code blocks in every
 * host shape, chart comments with tables or pipe paragraphs, nested
 * wrappers, and junk. run() never throws, never leaves a chart block
 * behind, never draws twice, and keeps every comment-form row.
 */
import { describe, expect, it } from "vitest";
import { isChartBlock, run } from "../src/dom.js";

let seed = 20261009;
const rnd = (): number => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const pick = <T>(items: readonly T[]): T => items[Math.floor(rnd() * items.length)]!;

const LANGS = ["chart", "markvis", "vis", "Chart", "js", "text", "", "charts", "visx"] as const;
const BODIES = [
  "type: bar\nx: a\ny: b\n\na,b\nA,1\nB,2",
  "type: donut\nx: a\ny: b\n\na,b\nA,1",
  "",
  "<b>&amp;</b>",
  "type: pie\nx: k\ny: v\n\nk,v\nA,-1",
  '[{"a":1}]',
  "type: line\nx: m\ny: n\nseries: s\n\nm,s,n\nJan,a,1\nJan,b,2",
];

function codeShape(): string {
  const lang = pick(LANGS);
  const body = pick(BODIES).replace(/&(?!amp;)/g, "&amp;").replace(/</g, "&lt;");
  const shapes = [
    `<pre><code class="language-${lang}">${body}</code></pre>`,
    `<pre data-lang="${lang}"><code class="lang-${lang}">${body}</code></pre>`,
    `<pre class="${lang}"><code>${body}</code></pre>`,
    `<div class="highlight"><pre><code class="language-${lang}" data-lang="${lang}">${body}</code></pre></div>`,
    `<div class="language-${lang} highlighter-rouge"><div class="highlight"><pre class="highlight"><code>${body}</code></pre></div></div>`,
    `<code class="language-${lang}">${body}</code>`,
    `<pre class="language-${lang}">${body.replace(/\n/g, "<br>")}</pre>`,
  ];
  return pick(shapes);
}

function commentShape(): { html: string; rows: number } {
  const rows = Math.floor(rnd() * 4);
  const tag = pick(["chart", "markvis", "vis", "note"]);
  const body = Array.from({ length: rows }, (_, i) => `<tr><td>R${i}</td><td>${i}</td></tr>`).join("");
  const table = pick([
    `<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody>${body}</tbody></table>`,
    `<p>| a | b |\n| — | — |\n${Array.from({ length: rows }, (_, i) => `| R${i} | ${i} |`).join("\n")}</p>`,
    `<p>not a table</p>`,
  ]);
  return { html: `<!-- ${tag}: ${pick(["bar", "line", "donut"])} x=a y=b -->${pick(["", "\n", " text "])}${table}`, rows };
}

describe("drop-in fuzz", () => {
  it("handles 400 random pages", () => {
    for (let i = 0; i < 400; i++) {
      const parts: string[] = [];
      const n = 1 + Math.floor(rnd() * 6);
      for (let j = 0; j < n; j++) {
        const kind = rnd();
        if (kind < 0.5) parts.push(codeShape());
        else if (kind < 0.8) parts.push(commentShape().html);
        else parts.push(pick(["<p>text</p>", "<div><span>x</span></div>", "<pre></pre>", "<!-- -->", "<table></table>"]));
      }
      const root = document.createElement("article");
      root.innerHTML = parts.join("\n");
      const before = Array.from(root.querySelectorAll("td")).map((td) => td.textContent);
      const drawn = run({ root });
      expect(drawn, root.innerHTML).toBeGreaterThanOrEqual(0);
      expect(run({ root }), root.innerHTML).toBe(0);
      for (const pre of Array.from(root.querySelectorAll("pre"))) {
        expect(isChartBlock(pre), pre.outerHTML).toBe(false);
      }
      // Rows from tables that were already in the page are still there.
      const after = Array.from(root.querySelectorAll("td")).map((td) => td.textContent);
      for (const cell of before) {
        expect(after, root.innerHTML).toContain(cell);
      }
    }
  });
});
