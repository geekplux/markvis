// @vitest-environment happy-dom
/**
 * The drop-in against HTML from real Markdown tools (fixtures/hosts/*.html,
 * each rendered from fixtures/hosts/source.md; tool, version, and command
 * are in the first line). Every host shows both charts, and other code
 * stays code.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { render } from "@markvis/html";
import { initialize, run } from "../src/dom.js";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "fixtures/hosts");
const JS = 'const total = 3 + 5 < 9 && "a&b";';

function load(name: string): HTMLElement {
  const root = document.createElement("main");
  root.innerHTML = readFileSync(join(fixtures, name), "utf8");
  document.body.append(root);
  return root;
}

function charts(root: ParentNode): string[] {
  return Array.from(root.querySelectorAll("figure.markvis")).map((f) => f.getAttribute("data-chart-type") ?? "");
}

beforeEach(() => initialize({}));
afterEach(() => {
  document.body.innerHTML = "";
});

const hosts = readdirSync(fixtures).filter((name) => name.endsWith(".html") && name !== "mkdocs-default.html");

describe("every host shape renders both charts", () => {
  it("covers the tools named in the plan", () => {
    expect(hosts.sort()).toEqual([
      "docsify.html",
      "highlightjs.html",
      "hugo.html",
      "jekyll.html",
      "markdown-it.html",
      "marked.html",
      "mkdocs.html",
      "pandoc.html",
    ]);
  });

  for (const name of hosts) {
    it(name, () => {
      const root = load(name);
      expect(run({ root })).toBe(2);
      expect(charts(root)).toEqual(["bar", "line"]);
      expect(root.querySelectorAll("svg")).toHaveLength(2);
      expect(root.querySelector(".markvis-error")).toBeNull();
      // The comment form keeps its rows inside the figure.
      const line = root.querySelectorAll("figure.markvis")[1]!;
      expect(line.querySelector("figcaption")?.textContent).toBe("Signups by week");
      expect(Array.from(line.querySelectorAll("tbody tr")).map((tr) => tr.textContent)).toEqual(["112", "218", "315"]);
      // Other code is untouched, highlighter markup and all.
      const code = Array.from(root.querySelectorAll("pre code, pre")).find((el) => el.textContent?.includes("const total"));
      expect(code?.textContent?.trim()).toBe(JS);
      expect(root.textContent).toContain("Other code stays code:");
    });
  }

  it("leaves a MkDocs block alone when the config drops the language", () => {
    const root = load("mkdocs-default.html");
    expect(run({ root })).toBe(1);
    expect(charts(root)).toEqual(["line"]);
    expect(root.querySelector("pre code")?.textContent).toContain("type: bar");
  });
});

describe("the HTML equals render()", () => {
  it("draws a block as render(text).html", () => {
    const root = load("marked.html");
    const text = root.querySelector("code.language-chart")!.textContent!.replace(/\n+$/, "");
    const expected = document.createElement("div");
    expected.innerHTML = render(text).html;
    run({ root });
    expect(root.querySelector("figure.markvis")!.outerHTML).toBe(expected.querySelector("figure")!.outerHTML);
  });
});

describe("wrappers and chrome", () => {
  const BODY = "type: bar\nx: a\ny: b\n\na,b\nA,1";

  const shapes: Array<[string, string]> = [
    ["chroma with a wrapper", `<div class="highlight"><pre tabindex="0"><code class="language-chart" data-lang="chart">${BODY}</code></pre></div>`],
    ["rouge with a lexer", `<div class="language-chart highlighter-rouge"><div class="highlight"><pre class="highlight"><code>${BODY}</code></pre></div></div>`],
    ["pymdownx with a language class", `<div class="language-chart highlight"><pre><span></span><code>${BODY}</code></pre></div>`],
    ["pandoc with sourceCode", `<div class="sourceCode" id="cb1"><pre class="sourceCode chart"><code class="sourceCode chart">${BODY}</code></pre></div>`],
    ["older marked", `<pre data-lang="vis"><code class="lang-vis">${BODY}</code></pre>`],
    ["a bare code element", `<code class="language-markvis">${BODY}</code>`],
  ];

  for (const [label, html] of shapes) {
    it(`replaces the outermost wrapper: ${label}`, () => {
      const root = document.createElement("section");
      root.innerHTML = `<p>before</p>${html}<button>copy</button><p>after</p>`;
      expect(run({ root })).toBe(1);
      expect(Array.from(root.children).map((el) => el.tagName.toLowerCase())).toEqual(["p", "figure", "button", "p"]);
    });
  }

  it("reads text through highlighter spans and <br>", () => {
    const root = document.createElement("section");
    root.innerHTML = `<pre class="language-chart"><span class="k">type:</span> pie<br>x: k<br>y: v<br><br>k,v<br>A,1</pre>`;
    expect(run({ root })).toBe(1);
    expect(charts(root)).toEqual(["pie"]);
  });

  it("climbs past chrome inside the wrapper", () => {
    const root = document.createElement("section");
    root.innerHTML = `<div class="highlight"><span class="lang">chart</span><pre><code class="language-chart">${BODY}</code></pre><button>copy</button></div>`;
    expect(run({ root })).toBe(1);
    expect(Array.from(root.children).map((el) => el.tagName.toLowerCase())).toEqual(["figure"]);
  });

  const holders: Array<[string, string]> = [
    ["a paragraph in a highlight div", `<div class="highlight"><p>KEEP</p><pre><code class="language-chart">${BODY}</code></pre></div>`],
    ["another code block in a code-block div", `<div class="code-block"><pre><code class="language-chart">${BODY}</code></pre><pre><code class="language-js">KEEP</code></pre></div>`],
    ["a language-en content container", `<div class="language-en"><p>KEEP</p><pre><code class="language-chart">${BODY}</code></pre></div>`],
    ["text beside the block", `<div class="highlight">KEEP<pre><code class="language-chart">${BODY}</code></pre></div>`],
    ["content two levels out", `<div class="language-chart highlighter-rouge"><p>KEEP</p><div class="highlight"><pre class="highlight"><code>${BODY}</code></pre></div></div>`],
  ];

  for (const [label, html] of holders) {
    it(`keeps page content in the wrapper: ${label}`, () => {
      const root = document.createElement("section");
      root.innerHTML = html;
      expect(run({ root })).toBe(1);
      expect(root.querySelector("figure.markvis")).not.toBeNull();
      expect(root.textContent).toContain("KEEP");
    });
  }

  it("does not climb into a container that is not a highlighter", () => {
    const root = document.createElement("section");
    root.innerHTML = `<div class="post"><pre><code class="language-chart">${BODY}</code></pre></div>`;
    run({ root });
    expect(root.querySelector("div.post > figure.markvis")).not.toBeNull();
  });

  it("ignores a class like chart on anything but a pre", () => {
    const root = document.createElement("section");
    root.innerHTML = `<div class="chart">${BODY}</div><span class="vis">x</span>`;
    expect(run({ root })).toBe(0);
  });
});

describe("comment + table", () => {
  it("needs the table right after the comment", () => {
    const root = document.createElement("section");
    root.innerHTML = `<!-- chart: bar x=a y=b --><p>text between</p><table><tr><th>a</th><th>b</th></tr><tr><td>A</td><td>1</td></tr></table>`;
    expect(run({ root })).toBe(0);
    expect(root.querySelector("table")).not.toBeNull();
  });

  it("keeps the rows and one error line when the comment is wrong", () => {
    const root = document.createElement("section");
    root.innerHTML = `<!-- chart: donut x=a y=b -->\n<table><thead><tr><th>a</th><th>b</th></tr></thead><tbody><tr><td>A</td><td>1</td></tr></tbody></table>`;
    expect(run({ root })).toBe(1);
    expect(root.querySelectorAll(".markvis-error")).toHaveLength(1);
    expect(root.textContent).toContain("E_UNKNOWN_TYPE");
    expect(root.querySelector("td")?.textContent).toBe("A");
  });

  it("ignores other comments", () => {
    const root = document.createElement("section");
    root.innerHTML = `<!-- note: not a chart --><table><tr><th>a</th></tr><tr><td>1</td></tr></table>`;
    expect(run({ root })).toBe(0);
  });
});

describe("run", () => {
  const block = (body: string) => `<pre><code class="language-chart">${body}</code></pre>`;
  const GOOD = "type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5";

  it("draws once when called twice", () => {
    const root = load("hugo.html");
    expect(run({ root })).toBe(2);
    expect(run({ root })).toBe(0);
    expect(root.querySelectorAll("svg")).toHaveLength(2);
  });

  it("keeps the rows and one error line for a bad block", () => {
    const root = document.createElement("section");
    root.innerHTML = block("type: donut\nx: a\ny: b\n\na,b\nA,1");
    expect(run({ root })).toBe(1);
    expect(root.querySelectorAll(".markvis-error")).toHaveLength(1);
    expect(root.querySelector("td")?.textContent).toBe("A");
  });

  it("shows an empty block as written, with no fence echoed back", () => {
    const root = document.createElement("section");
    root.innerHTML = block("");
    run({ root });
    expect(root.textContent).toContain("E_EMPTY_FENCE");
    expect(root.textContent).not.toContain("```");
  });

  it("draws exactly the nodes or selector given", () => {
    document.body.innerHTML = `<div class="c">${GOOD}</div><div class="c">${GOOD}</div><div class="d">${GOOD}</div>${block(GOOD)}`;
    const d = document.querySelector(".d")!;
    expect(run({ querySelector: ".c" })).toBe(2);
    expect(run({ nodes: [d] })).toBe(1);
    expect(run({ nodes: [d] })).toBe(0);
    expect(document.querySelector("pre")).not.toBeNull();
    expect(run()).toBe(1);
  });

  it("keeps drawing the page when a page default is bad", () => {
    initialize({ theme: "Docs" } as unknown as Parameters<typeof initialize>[0]);
    const root = document.createElement("section");
    root.innerHTML = block(GOOD) + block(`theme: folio\n${GOOD}`);
    expect(() => run({ root })).not.toThrow();
    expect(root.querySelectorAll("pre")).toHaveLength(0);
    expect(root.querySelectorAll("p.markvis-error")).toHaveLength(1);
    expect(root.querySelectorAll("svg")).toHaveLength(1);
  });

  it("applies page defaults, and a block's own field wins", () => {
    initialize({ theme: "graphite", surface: "dark", width: 480 });
    const root = document.createElement("section");
    root.innerHTML = block(GOOD) + block(`theme: folio\n${GOOD}`);
    run({ root });
    const svgs = Array.from(root.querySelectorAll("svg"));
    const expected = (text: string) => render(text, { theme: "graphite", surface: "dark", width: 480 }).svg.trim();
    const wrap = document.createElement("div");
    wrap.innerHTML = expected(GOOD);
    expect(svgs[0]!.outerHTML).toBe(wrap.firstElementChild!.outerHTML);
    expect(svgs[0]!.getAttribute("width")).toBe("480");
    wrap.innerHTML = expected(`theme: folio\n${GOOD}`);
    expect(svgs[1]!.outerHTML).toBe(wrap.firstElementChild!.outerHTML);
    expect(svgs[1]!.outerHTML).not.toBe(svgs[0]!.outerHTML);
  });
});
