import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { describe, expect, it } from "vitest";
import { extractCharts, parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import { chartBlockHtml, markdownItMarkvis } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const validDir = join(repoRoot, "examples/valid");
const invalidDir = join(repoRoot, "examples/invalid");

const validFiles = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .sort();
const invalidFiles = readdirSync(invalidDir)
  .filter((name) => name.endsWith(".md"))
  .sort();

const valid01 = readFileSync(join(validDir, "01-bar-basic.md"), "utf8");
const valid08 = readFileSync(join(validDir, "08-bar-comment.md"), "utf8");
const valid15 = readFileSync(join(validDir, "15-area-vis-tag.md"), "utf8");
const valid16 = readFileSync(join(validDir, "16-scatter-markvis-tag.md"), "utf8");
const invalid01 = readFileSync(join(invalidDir, "01-unknown-type.md"), "utf8");

function toHtml(source: string, html = true): string {
  return new MarkdownIt({ html }).use(markdownItMarkvis).render(source);
}

describe("markdownItMarkvis", () => {
  it("turns a chart fence into HTML that contains svg and table", () => {
    const html = toHtml(valid01);
    expect(html).toContain("<svg");
    expect(html).toContain("</svg>");
    expect(html).toContain("<table");
    expect(html).toContain("</table>");
    expect(html).toContain("<figure");
    expect(html).toContain("<figcaption>Feb led Q3 at 180</figcaption>");
    expect(html).toContain("<th>month</th>");
    expect(html).toContain("<td>Jan</td>");
    expect(html).toContain("<td>120</td>");
  });

  it("embeds the same SVG bytes as render-svg", () => {
    const html = toHtml(valid01);
    const result = parseMarkdown(valid01);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(html).toContain(renderSvg(result.chart).trimEnd());
  });

  it("renders the progressive HTML comment form", () => {
    const html = toHtml(valid08);
    expect(html).toContain("<svg");
    expect(html).toContain("<table");
    expect(html).toContain("<td>Mar</td>");
    expect(html).toContain("<figcaption>Q3 Revenue</figcaption>");
  });

  it("renders comment form even when markdown-it html option is false", () => {
    const html = toHtml(valid08, false);
    expect(html).toContain("<svg");
    expect(html).toContain("<table");
    expect(html).toContain("<figcaption>Q3 Revenue</figcaption>");
  });

  it("accepts vis and markvis fence tags", () => {
    const vis = toHtml(valid15);
    const markvis = toHtml(valid16);
    expect(vis).toContain('data-chart-type="area"');
    expect(vis).toContain("<svg");
    expect(vis).toContain("<table");
    expect(markvis).toContain('data-chart-type="scatter"');
    expect(markvis).toContain("<svg");
    expect(markvis).toContain("<table");
  });

  it("keeps surrounding prose and can render two charts", () => {
    const source = `# Intro

before

\`\`\`chart
type: bar
title: One
x: a
y: b

a,b
x,1
\`\`\`

middle

\`\`\`vis
type: pie
title: Two
x: name
y: value

name,value
A,2
B,3
\`\`\`

after
`;
    const html = toHtml(source);
    expect(html).toContain("<h1>Intro</h1>");
    expect(html).toContain("<p>before</p>");
    expect(html).toContain("<p>middle</p>");
    expect(html).toContain("<p>after</p>");
    expect(html.match(/<figure /g)).toHaveLength(2);
    expect(html.match(/<svg /g)).toHaveLength(2);
    expect(html).toContain("<figcaption>One</figcaption>");
    expect(html).toContain("<figcaption>Two</figcaption>");
  });

  it("degrades invalid charts to table plus one error line", () => {
    const html = toHtml(invalid01);
    expect(html).not.toContain("<svg");
    expect(html).toContain("<table");
    expect(html).toContain("E_UNKNOWN_TYPE");
    expect(html).toContain("<td>A</td>");
    expect(html).toContain("<td>1</td>");
    expect(html).toContain("<td>B</td>");
    expect(html).toContain('class="markvis-error"');
    expect(html.match(/markvis-error/g)).toHaveLength(1);
  });

  it("without the plugin, a fence stays a code block", () => {
    const html = new MarkdownIt().render(valid01);
    expect(html).toContain("<pre>");
    expect(html).toContain("<code");
    expect(html).not.toContain("<svg");
    expect(html).toContain("type: bar");
  });

  it("inserts the chartBlockHtml figure for the extracted fence", () => {
    const charts = extractCharts(valid01);
    expect(charts).toHaveLength(1);
    const expected = chartBlockHtml(charts[0]!.raw);
    expect(expected).toContain("<svg");
    expect(expected).toContain("<table");
    expect(toHtml(valid01)).toContain(expected);
  });
});

describe("markdown-it valid fixtures", () => {
  it.each(validFiles)("%s html contains svg and table", (file) => {
    const source = readFileSync(join(validDir, file), "utf8");
    const html = toHtml(source);
    expect(html, file).toContain("<svg");
    expect(html, file).toContain("<table");
    expect(html, file).toContain("</figure>");
  });
});

describe("markdown-it invalid fixtures", () => {
  it.each(invalidFiles)("%s html contains table and error code", (file) => {
    const source = readFileSync(join(invalidDir, file), "utf8");
    const html = toHtml(source);
    expect(html, file).not.toContain("<svg");
    expect(html, file).toContain("<table");
    expect(html, file).toMatch(/E_[A-Z_]+/);
  });
});
