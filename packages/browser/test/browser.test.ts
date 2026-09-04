import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import {
  chartBlockHtml,
  replaceLanguageBlocks,
  wrapFence,
} from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const valid01 = readFileSync(
  join(repoRoot, "examples/valid/01-bar-basic.md"),
  "utf8",
);
const invalid01 = readFileSync(
  join(repoRoot, "examples/invalid/01-unknown-type.md"),
  "utf8",
);

function fenceBody(source: string): string {
  return source
    .replace(/^[\s\S]*?```(?:chart|markvis|vis)[ \t]*\r?\n/, "")
    .replace(/\r?\n```[\s\S]*$/, "");
}

const BODY = fenceBody(valid01);

describe("wrapFence + chartBlockHtml", () => {
  it("renders a valid body as figure + svg + table", () => {
    const html = chartBlockHtml(BODY);
    expect(html).toContain("<figure");
    expect(html).toContain("<svg");
    expect(html).toContain("</svg>");
    expect(html).toContain("<table");
    expect(html).toContain("<figcaption>Feb led Q3 at 180</figcaption>");
  });

  it("matches render-svg bytes for the same IR", () => {
    const html = chartBlockHtml(wrapFence(BODY, "chart"));
    const result = parseMarkdown(valid01);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(html).toContain(renderSvg(result.chart).trimEnd());
  });

  it("keeps data on invalid input", () => {
    const html = chartBlockHtml(invalid01);
    expect(html).toContain("markvis-error");
    expect(html).toContain("E_UNKNOWN_TYPE");
    expect(html).toContain("<table");
  });
});

describe("replaceLanguageBlocks", () => {
  it("replaces language-chart pre/code", () => {
    const html = `<pre><code class="language-chart">${BODY}</code></pre>`;
    const out = replaceLanguageBlocks(html);
    expect(out).toContain("<svg");
    expect(out).toContain('data-chart-type="bar"');
    expect(out).not.toContain("language-chart");
  });

  it("replaces language-vis and language-markvis", () => {
    const vis = replaceLanguageBlocks(
      `<pre class="language-vis">${BODY}</pre>`,
    );
    const mv = replaceLanguageBlocks(
      `<code class="language-markvis">${BODY}</code>`,
    );
    expect(vis).toContain("<svg");
    expect(mv).toContain("<svg");
  });

  it("leaves language-js alone", () => {
    const src = `<pre><code class="language-js">const x = 1;</code></pre>`;
    expect(replaceLanguageBlocks(src)).toBe(src);
  });
});

describe("package contract", () => {
  it("does not depend on d3", () => {
    const pkg = JSON.parse(
      readFileSync(join(here, "../package.json"), "utf8"),
    ) as { dependencies?: Record<string, string> };
    const deps = Object.keys(pkg.dependencies ?? {});
    expect(deps.some((d) => d === "d3" || d.startsWith("d3-"))).toBe(false);
  });

  it("builds markvis.min.js IIFE and markvis.mjs when dist exists", () => {
    const iife = join(here, "../dist/markvis.min.js");
    const esm = join(here, "../dist/markvis.mjs");
    if (!existsSync(iife) || !existsSync(esm)) {
      return;
    }
    const iifeSrc = readFileSync(iife, "utf8");
    const esmSrc = readFileSync(esm, "utf8");
    expect(iifeSrc.length).toBeGreaterThan(100);
    expect(esmSrc.length).toBeGreaterThan(100);
    expect(iifeSrc).not.toMatch(/\bd3\b/);
    expect(esmSrc).not.toMatch(/from ["']d3/);
  });
});
