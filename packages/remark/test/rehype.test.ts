/**
 * markvis/rehype: chart code blocks become real hast (no raw HTML), equal
 * to render().html once parsed, safe for any text, and usable in MDX.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluate } from "@mdx-js/mdx";
import { Window } from "happy-dom";
import { createElement } from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { remark } from "remark";
import rehypeStringify from "rehype-stringify";
import remarkRehype from "remark-rehype";
import { describe, expect, it } from "vitest";
import { render } from "@markvis/html";
import { extractCharts } from "@markvis/parser";
import { decodeEntities, htmlToHast } from "../src/hast.js";
import { rehypeMarkvis } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");

function examples(dir: string): Array<[string, string]> {
  const full = join(repoRoot, "examples", dir);
  return readdirSync(full)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => [`examples/${dir}/${name}`, readFileSync(join(full, name), "utf8")]);
}

const files = [...examples("valid"), ...examples("invalid")];

function toHtml(markdown: string): string {
  return String(
    remark()
      .use(remarkRehype)
      .use(rehypeMarkvis)
      .use(rehypeStringify)
      .processSync(markdown),
  );
}

/**
 * Two serializations of the same tree compared as text: references decoded
 * (`&quot;` and `&#x22;`, `&gt;` and `>`), and an empty element written
 * `<path/>`, `<path />`, or `<path></path>` read the same.
 * happy-dom is not used here: it leaves some references in attributes
 * undecoded.
 */
function normalized(html: string): string {
  return decodeEntities(html)
    .replace(/\s*\/>/g, "/>")
    .replace(/<([a-zA-Z][\w:-]*)((?:\s+[^\s=/>]+="[^"]*")*)><\/\1>/g, "<$1$2/>");
}

function bodyOf(raw: string): string {
  return raw.split("\n").slice(1, -1).join("\n");
}

describe("htmlToHast", () => {
  it("builds elements, properties, and text from render's HTML", () => {
    const [p] = htmlToHast('<p class="markvis-error a">E_X: &lt;b&gt; &amp; &quot;q&quot; &apos;s&apos;</p>');
    expect(p).toEqual({
      type: "element",
      tagName: "p",
      properties: { className: ["markvis-error", "a"] },
      children: [{ type: "text", value: "E_X: <b> & \"q\" 's'" }],
    });
  });

  it("closes self-closing tags and keeps a stray < as text", () => {
    const nodes = htmlToHast('<g><path d="M0 0"/><text x="1">a < b</text></g>');
    expect(nodes).toEqual([
      {
        type: "element",
        tagName: "g",
        properties: {},
        children: [
          { type: "element", tagName: "path", properties: { d: "M0 0" }, children: [] },
          { type: "element", tagName: "text", properties: { x: "1" }, children: [{ type: "text", value: "a < b" }] },
        ],
      },
    ]);
  });

  it("decodes numeric references and leaves unknown ones", () => {
    expect(decodeEntities("&#65;&#x42;&nope;&#x110000;")).toBe("AB&nope;&#x110000;");
  });

  it("matches a snapshot for one small chart", () => {
    const hast = htmlToHast(render("type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5").html);
    expect(hast).toMatchSnapshot();
  });
});

describe("rehypeMarkvis", () => {
  it("replaces a chart block with a figure and leaves other code alone", () => {
    const html = toHtml("Hi\n\n```chart\ntype: bar\nx: a\ny: b\n\na,b\nA,1\n```\n\n```js\nconst a = 1 < 2;\n```\n");
    expect(html).toContain('<figure class="markvis" data-markvis="2" data-chart-type="bar">');
    expect(html).toContain("<svg");
    expect(html).toContain('<pre><code class="language-js">const a = 1 &#x3C; 2;\n</code></pre>');
    expect(html).not.toContain("language-chart");
  });

  it("keeps the rows and one error line for a bad block", () => {
    const html = toHtml("```vis\ntype: donut\nx: a\ny: b\n\na,b\nA,1\n```\n");
    expect(html).toContain("<td>A</td><td>1</td>");
    expect(html.match(/class="markvis-error"/g)).toHaveLength(1);
  });

  it("draws a chart comment followed by a table when the tree keeps comments", () => {
    const tree = {
      type: "root",
      children: [
        { type: "comment", value: " chart: bar x=a y=b " },
        { type: "text", value: "\n" },
        {
          type: "element",
          tagName: "table",
          properties: {},
          children: [
            { type: "element", tagName: "thead", properties: {}, children: [
              { type: "element", tagName: "tr", properties: {}, children: [
                { type: "element", tagName: "th", properties: {}, children: [{ type: "text", value: "a" }] },
                { type: "element", tagName: "th", properties: {}, children: [{ type: "text", value: "b" }] },
              ] },
            ] },
            { type: "element", tagName: "tbody", properties: {}, children: [
              { type: "element", tagName: "tr", properties: {}, children: [
                { type: "element", tagName: "td", properties: {}, children: [{ type: "text", value: "A" }] },
                { type: "element", tagName: "td", properties: {}, children: [{ type: "text", value: "1" }] },
              ] },
            ] },
          ],
        },
      ],
    };
    rehypeMarkvis()(tree);
    expect(tree.children).toHaveLength(1);
    expect(tree.children[0]).toMatchObject({ type: "element", tagName: "figure" });
  });

  for (const [path, source] of files) {
    const fence = extractCharts(source).find((chart) => chart.form === "fence");
    if (!fence) continue;
    it(`equals render().html once parsed: ${path}`, () => {
      expect(normalized(toHtml(source))).toContain(normalized(render(bodyOf(fence.raw)).html));
    });
  }
});

describe("text in a block never becomes markup", () => {
  for (const payload of ["<script>alert(1)</script>", '<img src=x onerror="alert(1)">', "javascript:alert(1)", "<svg onload=alert(1)>"]) {
    it(payload, () => {
      const csv = payload.includes(",") || payload.includes('"') ? `"${payload.replace(/"/g, '""')}"` : payload;
      const html = toHtml(`\`\`\`chart\ntype: bar\ntitle: ${payload}\nunit: ${payload}\nx: k\ny: v\n\nk,v\n${csv},1\n\`\`\`\n`);
      const doc = new Window().document;
      doc.body.innerHTML = html;
      for (const el of doc.body.querySelectorAll("*")) {
        expect(["script", "img", "iframe"]).not.toContain(el.tagName.toLowerCase());
        for (const attr of el.getAttributeNames()) expect(attr.startsWith("on"), attr).toBe(false);
      }
      expect(doc.body.querySelectorAll("svg")).toHaveLength(1);
    });
  }
});

describe("MDX", () => {
  it("compiles and runs a page with a chart", async () => {
    const page = "# Report\n\nRevenue rose.\n\n```chart\ntype: line\ntitle: Revenue\nx: month\ny: revenue\n\nmonth,revenue\nJan,120\nFeb,95\nMar,150\n```\n\n<Note />\n";
    const { default: Content } = await evaluate(page, { ...jsxRuntime, rehypePlugins: [rehypeMarkvis] } as Parameters<typeof evaluate>[1]);
    const html = renderToStaticMarkup(createElement(Content, { components: { Note: () => createElement("aside", null, "note") } }));
    expect(html).toContain("<aside>note</aside>");
    const body = "type: line\ntitle: Revenue\nx: month\ny: revenue\n\nmonth,revenue\nJan,120\nFeb,95\nMar,150";
    expect(normalized(html)).toContain(normalized(render(body).html));
  });
});
