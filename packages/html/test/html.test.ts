/**
 * One HTML path: markdown-it, remark, the browser drop-in, and render()
 * all emit the same figure or the same table plus one error line.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { remark } from "remark";
import remarkHtml from "remark-html";
import { describe, expect, it } from "vitest";
import { extractCharts } from "@markvis/parser";
import { markdownItMarkvis } from "@markvis/markdown-it";
import { remarkMarkvis } from "@markvis/remark";
import { chartBlockHtml as browserBlockHtml, replaceLanguageBlocks } from "@markvis/browser";
import { chartBlockHtml, escapeHtml, htmlTable, render } from "../src/index.js";

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
const md = new MarkdownIt({ html: true }).use(markdownItMarkvis);

describe("every adapter emits render().html", () => {
  for (const [path, source] of files) {
    const charts = extractCharts(source);
    if (charts.length === 0) {
      continue;
    }
    it(path, () => {
      const fromMarkdownIt = md.render(source);
      const fromRemark = String(
        remark()
          .use(remarkMarkvis)
          .use(remarkHtml, { sanitize: false })
          .processSync({ path, value: source }),
      );
      for (const chart of charts) {
        const html = render(chart.raw).html;
        expect(chartBlockHtml(chart.raw)).toBe(html);
        expect(fromMarkdownIt).toContain(html);
        expect(fromRemark).toContain(render(chart.raw, { filename: path }).html);
        // The browser sees only the inside of a code block, and draws it as render() does.
        if (chart.form === "fence") {
          const code = `<pre><code class="language-${chart.lang}">${escapeHtml(chart.body)}</code></pre>`;
          expect(replaceLanguageBlocks(code)).toBe(render(chart.body).html);
          // With no rows read, the raw text is echoed: the body, or the whole block.
          const whole = render(chart.raw);
          if (whole.ok || whole.table.columns.length > 0) {
            expect(render(chart.body).html).toBe(html);
          }
        }
      }
    });
  }
});

describe("extra cells", () => {
  it("keeps a cell past the header width", () => {
    const html = htmlTable({ columns: ["month", "revenue"], rows: [["Jan", "120", "extra"]] });
    expect(html).toContain("<td>Jan</td><td>120</td><td>extra</td>");
  });

  it("keeps it in the browser drop-in too", () => {
    const [, source] = files.find(([path]) => path.endsWith("invalid/04-extra-columns.md"))!;
    const chart = extractCharts(source)[0]!;
    const html = browserBlockHtml(chart.body, undefined, chart.lang);
    expect(html).toContain("<td>extra</td>");
    expect(html).toContain('<p class="markvis-error">E_EXTRA_COLUMN');
  });
});

describe("render options", () => {
  const plain = "type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5";
  const styled = `theme: docs\npalette: warm\nsurface: light\n${plain}`;

  it("returns the svg, the html around it, and the chart", () => {
    const result = render(plain);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.svg.startsWith("<svg")).toBe(true);
    expect(result.html).toContain(result.svg.trimEnd());
    expect(result.html.startsWith('<figure class="markvis"')).toBe(true);
    expect(result.chart.table.rows).toEqual([
      ["Mon", "3"],
      ["Tue", "5"],
    ]);
  });

  it("fills theme, palette, and surface the block leaves out", () => {
    const result = render(plain, { theme: "shadcn", palette: "vivid", surface: "dark" });
    expect(result.ok && result.chart).toMatchObject({
      theme: "shadcn",
      palette: "vivid",
      surface: "dark",
    });
    expect(result.ok && result.svg).toContain('data-surface="dark"');
  });

  it("lets the block's own fields win", () => {
    const result = render(styled, { theme: "shadcn", palette: "vivid", surface: "dark" });
    expect(result.ok && result.chart).toMatchObject({
      theme: "docs",
      palette: "warm",
      surface: "light",
    });
    expect(render(styled, { theme: "shadcn" })).toEqual(render(styled));
  });

  it("draws exactly as before when no option is given", () => {
    expect(render(plain).html).toBe(chartBlockHtml(`\`\`\`chart\n${plain}\n\`\`\``));
  });

  it("sets the width, and ignores a width that is not a positive number", () => {
    expect(render(plain, { width: 480 }).ok && render(plain, { width: 480 })).toMatchObject({
      svg: expect.stringContaining('width="480"'),
    });
    for (const width of [0, -5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(render(plain, { width })).toEqual(render(plain));
    }
  });

  it("derives a missing title from the filename", () => {
    const untitled = "type: bar\nx: day\ny: visits\n\nday,visits\nMon,3";
    const result = render(untitled, { filename: "notes/weekly-visits.md" });
    expect(result.ok && result.chart.title).toBe("weekly visits");
  });

  it("keeps the rows and one error line on failure", () => {
    const result = render("type: pie\nx: k\ny: v\n\nk,v\nA,3\nB,-1");
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.code).toBe("E_PIE_NEGATIVE");
    expect(result.table.rows).toEqual([
      ["A", "3"],
      ["B", "-1"],
    ]);
    expect(result.html).toContain("<td>B</td><td>-1</td>");
    expect(result.html.match(/class="markvis-error"/g)).toHaveLength(1);
  });
});

describe("render never throws", () => {
  let seed = 20261007;
  const rnd = (): number => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const pick = <T>(items: readonly T[]): T => items[Math.floor(rnd() * items.length)]!;

  const TYPES = [
    "bar", "line", "area", "scatter", "pie", "hist", "heatmap", "funnel", "waterfall",
    "radar", "gauge", "sankey", "treemap", "dumbbell", "bullet", "boxplot", "calendar",
  ] as const;
  const NUMBERS = ["0", "1", "-1", "1e308", "-1e308", "5e-324", "1e21", "0.1", "-0", "", "42", "x"];
  const LABELS = ["A", "B", "<b>&\"'", "x".repeat(300), "Ωé", "a b", '"unclosed'];

  function randomText(): string {
    let text = "";
    const length = Math.floor(rnd() * 300);
    for (let i = 0; i < length; i++) {
      text += String.fromCharCode(Math.floor(rnd() * 0x3000));
    }
    return text;
  }

  function randomBlock(): string {
    const type = pick(TYPES);
    const rows = rnd() < 0.02 ? 2000 : 1 + Math.floor(rnd() * 20);
    const lines = ["x,y,s,t"];
    for (let r = 0; r < rows; r++) {
      const x =
        type === "calendar"
          ? `2026-0${1 + Math.floor(rnd() * 9)}-1${Math.floor(rnd() * 9)}`
          : type === "scatter" || type === "hist"
            ? pick(NUMBERS)
            : `${pick(LABELS)}${r}`;
      lines.push([x, pick(NUMBERS), pick(["p", "q"]), pick(NUMBERS)].join(","));
    }
    if (rnd() < 0.1) {
      lines.push('"an unclosed, quote');
    }
    const header = [`type: ${type}`, "x: x", "y: y"];
    if (rnd() < 0.4) header.push("series: s");
    if (type === "bullet") header.push("target: t");
    if (rnd() < 0.2) header.push(pick(["min: -1e308", "max: 1e308", "layout: percent", "innerRadius: 0.99"]));
    return `${header.join("\n")}\n\n${lines.join("\n")}`;
  }

  it("returns html for random bytes, huge tables, and extreme numbers", () => {
    for (let i = 0; i < 600; i++) {
      const text = rnd() < 0.2 ? randomText() : randomBlock();
      const options = rnd() < 0.5 ? {} : { width: pick([1, 50, 4000]), surface: "dark" as const };
      const result = render(text, options);
      expect(typeof result.html).toBe("string");
      expect(result.html.length).toBeGreaterThan(0);
    }
  });

  it("draws values that span the whole double range", () => {
    for (const type of ["bar", "dumbbell", "bullet", "boxplot", "hist"] as const) {
      const series = type === "dumbbell" ? "series: s\n" : "";
      const rows =
        type === "dumbbell"
          ? "A,-1e308,p\nA,1e308,q"
          : "A,-1e308\nB,1e308\nC,0\nD,1\nE,2";
      const columns = type === "dumbbell" ? "x,y,s" : "x,y";
      const x = type === "hist" ? "y" : "x";
      const result = render(`type: ${type}\nx: ${x}\ny: y\n${series}\n${columns}\n${rows}`);
      expect(result.ok, type).toBe(true);
    }
  });
});

describe("render options from untyped callers", () => {
  const body = "type: bar\nx: day\ny: visits\n\nday,visits\nMon,3";
  const loose = render as (text: string, options: Record<string, unknown>) => ReturnType<typeof render>;

  for (const options of [{ theme: "dark" }, { theme: "Docs" }, { palette: "blue" }, { surface: "Dark" }]) {
    it(`degrades instead of throwing: ${JSON.stringify(options)}`, () => {
      const result = loose(body, options);
      expect(result.ok).toBe(false);
      expect(result.html).toContain("<td>Mon</td>");
      expect(result.html.match(/class="markvis-error"/g)).toHaveLength(1);
    });
  }
});
