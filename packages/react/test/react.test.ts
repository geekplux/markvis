/**
 * markvis/react on the server and inside react-markdown: the same HTML as
 * render(), a quiet placeholder while a block streams, and no markup from
 * the text of a block.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import Markdown from "react-markdown";
import { Window } from "happy-dom";
import { describe, expect, it } from "vitest";
import { render } from "@markvis/html";
import { extractCharts } from "@markvis/parser";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "../src/index.js";
import { chartBlock } from "../src/block.js";

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

/** What a Markdown renderer hands a code-block plugin: the lines inside the fence. */
function bodyOf(raw: string): string {
  return raw.split("\n").slice(1, -1).join("\n");
}

function markdown(text: string, streaming = false): string {
  return renderToStaticMarkup(
    createElement(Markdown, {
      components: markvisComponents,
      remarkPlugins: streaming ? [remarkMarkvisStreaming] : [],
      children: text,
    }),
  );
}

describe("<Markvis source>", () => {
  it("renders a block on the server at the default width", () => {
    const source = "type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5\n";
    const html = renderToStaticMarkup(createElement(Markvis, { source }));
    expect(html).toBe(`<div>${render(source).html}</div>`);
    expect(html).toContain('width="720"');
  });

  it("keeps the rows and one error line for a bad block", () => {
    const html = renderToStaticMarkup(
      createElement(Markvis, { source: "type: donut\nx: a\ny: b\n\na,b\nA,1\n" }),
    );
    expect(html).toContain("<td>A</td><td>1</td>");
    expect(html.match(/class="markvis-error"/g)).toHaveLength(1);
    expect(html).toContain("E_UNKNOWN_TYPE");
  });

  it("passes width, theme, palette, surface, and className", () => {
    const source = "type: bar\nx: day\ny: visits\n\nday,visits\nMon,3\n";
    const options = { width: 480, theme: "graphite", palette: "warm", surface: "dark" } as const;
    const html = renderToStaticMarkup(
      createElement(Markvis, { source, className: "answer-chart", ...options }),
    );
    expect(html).toBe(`<div class="answer-chart">${render(source, options).html}</div>`);
    expect(html).toContain('width="480"');
  });
});

describe("golden: every example equals render().html", () => {
  for (const [path, source] of files) {
    for (const chart of extractCharts(source)) {
      it(`${path} @${chart.index}`, () => {
        const html = renderToStaticMarkup(createElement(Markvis, { source: chart.raw }));
        expect(html).toBe(`<div>${render(chart.raw).html}</div>`);
      });
    }
  }
});

describe("<Markvis chart data>", () => {
  const chart = { type: "bar", title: "Revenue by month", x: "month", y: "revenue", unit: "USD" };
  const data = [
    { month: "Jan", revenue: 120 },
    { month: "Feb", revenue: 95 },
  ];

  it("serializes to header lines and CSV", () => {
    expect(chartBlock(chart, data)).toBe(
      "type: bar\ntitle: Revenue by month\nx: month\ny: revenue\nunit: USD\n\nmonth,revenue\nJan,120\nFeb,95\n",
    );
  });

  it("renders the same HTML as the same block written as text", () => {
    const html = renderToStaticMarkup(createElement(Markvis, { chart, data }));
    expect(html).toBe(`<div>${render(chartBlock(chart, data)).html}</div>`);
    expect(html).toContain("<svg");
  });

  it("orders columns: x, then named columns, then other keys as first seen", () => {
    const text = chartBlock(
      { type: "line", x: "month", y: "count", series: "plan" },
      [
        { note: "a", count: 1, plan: "free", month: "Jan" },
        { month: "Feb", plan: "pro", count: 2, extra: "z" },
      ],
    );
    expect(text.split("\n\n")[1]).toBe("month,count,plan,note,extra\nJan,1,free,a,\nFeb,2,pro,,z\n");
  });

  it("quotes commas and quotes, and keeps a value on one line", () => {
    const text = chartBlock({ type: "bar", x: "name", y: "n", title: "a\nb" }, [
      { name: 'Acme, "Inc"', n: 1 },
      { name: "two\nlines", n: 2 },
    ]);
    expect(text).toContain("title: a b\n");
    const result = render(text);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.chart.table.rows).toEqual([
        ['Acme, "Inc"', "1"],
        ["two lines", "2"],
      ]);
    }
  });

  it("keeps an empty cell in a one-column table", () => {
    const result = render(chartBlock({ type: "hist", x: "ms" }, [{ ms: 12 }, { ms: null }, { ms: 14 }]));
    expect(result.ok ? result.chart.table.rows : []).toEqual([["12"], [""], ["14"]]);
  });

  it("cannot turn a column name into a GFM or JSON body", () => {
    for (const name of ["| a", "[a", "{a"]) {
      const result = render(chartBlock({ type: "bar", x: name, y: "n" }, [{ [name]: "A", n: 1 }]));
      expect(result.ok, name).toBe(true);
    }
  });

  it("reports the same error codes as text input", () => {
    const cases: Array<[Parameters<typeof chartBlock>, string]> = [
      [[{ type: "pie", x: "k", y: "v" }, [{ k: "A", v: -1 }]], "E_PIE_NEGATIVE"],
      [[{ type: "bar", x: "k", y: "missing" }, [{ k: "A", v: 1 }]], "E_UNKNOWN_FIELD"],
      [[{ type: "donut", x: "k", y: "v" }, [{ k: "A", v: 1 }]], "E_UNKNOWN_TYPE"],
      [[{ type: "bar", x: "k", y: "v" }, []], "E_EMPTY_DATA"],
      [[{ type: "bar", x: "k", y: "v" }, [{ k: "A", v: "lots" }]], "E_BAD_NUMBER"],
    ];
    for (const [[c, d], code] of cases) {
      const result = render(chartBlock(c, d));
      expect(result.ok ? "ok" : result.error.code, code).toBe(code);
      const html = renderToStaticMarkup(createElement(Markvis, { chart: c, data: d }));
      expect(html).toContain(code);
    }
  });
});

describe("react-markdown with markvisComponents", () => {
  it("draws a chart block and leaves other code alone", () => {
    const html = markdown(
      "Here:\n\n```chart\ntype: bar\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5\n```\n\n```js\nconst a = 1 < 2;\n```\n\nInline `code` too.\n",
    );
    expect(html).toContain("<svg");
    expect(html).toContain('<pre><code class="language-js">const a = 1 &lt; 2;\n</code></pre>');
    expect(html).toContain("<code>code</code>");
    expect(html).not.toContain("language-chart");
  });

  it("accepts the markvis and vis tags in any case", () => {
    for (const tag of ["markvis", "vis", "Chart"]) {
      const html = markdown(`\`\`\`${tag}\ntype: pie\nx: k\ny: v\n\nk,v\nA,1\nB,2\n\`\`\`\n`);
      expect(html, tag).toContain("<svg");
    }
  });

  it("merges with the host's own components", () => {
    const html = renderToStaticMarkup(
      createElement(Markdown, {
        components: { ...markvisComponents, p: (props) => createElement("p", { className: "mine" }, props.children) },
        children: "Text\n\n```vis\ntype: bar\nx: a\ny: b\n\na,b\nA,1\n```\n",
      }),
    );
    expect(html).toContain('<p class="mine">Text</p>');
    expect(html).toContain("<svg");
  });

  for (const [path, source] of files) {
    const fence = extractCharts(source).find((chart) => chart.form === "fence");
    if (!fence) {
      continue;
    }
    it(`matches render().html: ${path}`, () => {
      expect(markdown(source)).toContain(render(bodyOf(fence.raw)).html);
    });
  }
});

describe("streaming", () => {
  const reply =
    "Sales rose.\n\n```chart\ntype: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5\nWed,4\n```\n\nDone.\n";

  it("shows a placeholder and the whole rows so far while the fence is open", () => {
    const cut = reply.indexOf("Wed") + 2;
    const html = markdown(reply.slice(0, cut), true);
    expect(html).toContain('class="markvis-pending"');
    expect(html).toContain("Drawing chart…");
    expect(html).toContain("<td>Mon</td><td>3</td>");
    expect(html).toContain("<td>Tue</td><td>5</td>");
    expect(html).not.toContain("<td>We");
    expect(html).not.toContain("<svg");
  });

  it("draws once the closing line arrives", () => {
    const cut = reply.indexOf("```\n\nDone") + 3;
    const html = markdown(reply.slice(0, cut), true);
    expect(html).toContain("<svg");
    expect(html).not.toContain("markvis-pending");
  });

  it("draws an unclosed block once the plugin is left out", () => {
    const cut = reply.indexOf("```\n\nDone");
    expect(markdown(reply.slice(0, cut), false)).toContain("<svg");
  });

  it("does not hold a fence that a list or quote already closed", () => {
    const html = markdown("> ```chart\n> type: bar\n> x: a\n> y: b\n>\n> a,b\n> A,1\n\nAfter.\n", true);
    expect(html).toContain("<svg");
  });

  it("works with tildes and longer fences", () => {
    const open = markdown("~~~~chart\ntype: bar\nx: a\ny: b\n\na,b\nA,1\n~~~\n", true);
    expect(open).toContain("markvis-pending");
    const closed = markdown("~~~~chart\ntype: bar\nx: a\ny: b\n\na,b\nA,1\n~~~~\n", true);
    expect(closed).toContain("<svg");
  });

  for (const [path, source] of files) {
    const fence = extractCharts(source).find((chart) => chart.form === "fence");
    if (!fence) {
      continue;
    }
    it(`never shows an error before the fence closes: ${path}`, () => {
      const closedAt = fence.index + fence.raw.length;
      const cuts = new Set<number>();
      for (let i = 0; i <= source.length; i++) {
        if (i === source.length || source[i] === "\n") {
          cuts.add(i);
          cuts.add(i + 1);
          const lineStart = source.lastIndexOf("\n", i - 1) + 1;
          cuts.add(lineStart + Math.floor((i - lineStart) / 2));
        }
      }
      for (const cut of [...cuts].filter((c) => c <= source.length).sort((a, b) => a - b)) {
        const html = markdown(source.slice(0, cut), true);
        if (cut < closedAt) {
          expect(html, `cut at ${cut}`).not.toContain("markvis-error");
        }
      }
      const done = markdown(source, true);
      expect(done).not.toContain("markvis-pending");
      expect(done).toContain(render(bodyOf(fence.raw)).html);
    });
  }
});

describe("text in a block never becomes markup", () => {
  const payloads = [
    "<script>alert(1)</script>",
    '<img src=x onerror="alert(1)">',
    '" onload="alert(1)',
    "javascript:alert(1)",
    "<svg onload=alert(1)>",
  ];

  /** Parse the HTML for real: no script, no handler, no javascript: URL. */
  function assertInert(html: string, label: string): void {
    const doc = new Window().document;
    doc.body.innerHTML = html;
    for (const el of doc.body.querySelectorAll("*")) {
      expect(["script", "img", "iframe", "object", "embed", "foreignobject"], label).not.toContain(
        el.tagName.toLowerCase(),
      );
      for (const attr of el.getAttributeNames()) {
        expect(attr.toLowerCase().startsWith("on"), `${label}: ${attr}`).toBe(false);
        if (/^(?:xlink:)?href$|^src$/i.test(attr)) {
          expect(el.getAttribute(attr) ?? "", label).not.toMatch(/^\s*javascript:/i);
        }
      }
    }
    expect(doc.body.querySelectorAll("svg").length, label).toBeLessThanOrEqual(1);
  }

  for (const payload of payloads) {
    it(`escapes ${payload} in title, unit, cells, and series`, () => {
      const csvSafe = payload.includes(",") || payload.includes('"') ? `"${payload.replace(/"/g, '""')}"` : payload;
      const blocks = [
        `type: bar\ntitle: ${payload}\nunit: ${payload}\nx: k\ny: v\n\nk,v\n${csvSafe},1\nB,2\n`,
        `type: line\ntitle: t\nx: k\ny: v\nseries: s\n\nk,s,v\nA,${csvSafe},1\nB,${csvSafe},2\nA,b,3\nB,b,4\n`,
        `type: pie\nx: k\ny: v\n\nk,v\n${csvSafe},1\n`,
        `type: donut\ntitle: ${payload}\nx: k\ny: v\n\nk,v\n${csvSafe},1\n`,
      ];
      for (const source of blocks) {
        assertInert(renderToStaticMarkup(createElement(Markvis, { source })), source);
        assertInert(markdown(`\`\`\`chart\n${source}\`\`\`\n`), source);
        assertInert(markdown(`\`\`\`chart\n${source}`, true), source);
      }
      const data = [{ [payload]: payload, v: 1, k: payload }];
      assertInert(
        renderToStaticMarkup(
          createElement(Markvis, { chart: { type: "bar", title: payload, unit: payload, x: "k", y: "v" }, data }),
        ),
        "chart+data",
      );
    });
  }
});
