// @vitest-environment happy-dom
/**
 * The drop-in on a live page: content that arrives after load (a chat
 * reply, a client-side route) renders when the page calls init again.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { describe, expect, it } from "vitest";
import { init, initialize } from "../src/dom.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");

const BODY = "type: bar\ntitle: Visits\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5";

function codeBlock(lang: string, body: string): string {
  const escaped = body.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
}

describe("init on content added after load", () => {
  it("renders new blocks and leaves drawn ones alone", () => {
    const root = document.createElement("div");
    root.innerHTML = `<p>First reply</p>${codeBlock("chart", BODY)}`;
    document.body.appendChild(root);

    expect(init(root)).toBe(1);
    expect(root.querySelectorAll("svg")).toHaveLength(1);
    expect(root.querySelector("pre")).toBeNull();

    const reply = document.createElement("div");
    reply.innerHTML = `<p>Second reply</p>${codeBlock("vis", BODY)}`;
    root.appendChild(reply);

    expect(init(root)).toBe(1);
    expect(root.querySelectorAll("svg")).toHaveLength(2);
    expect(init(root)).toBe(0);
    root.remove();
  });

  it("keeps other code blocks", () => {
    const root = document.createElement("div");
    root.innerHTML = codeBlock("js", "const x = 1;");
    expect(init(root)).toBe(0);
    expect(root.querySelector("code.language-js")?.textContent).toBe("const x = 1;");
  });
});

describe("colors from the page", () => {
  // happy-dom resolves custom properties in getComputedStyle, so this reads
  // the color a page would paint, not just the style attribute text.
  function drawIn(style: string): { host: HTMLDivElement; bar: Element } {
    const host = document.createElement("div");
    host.setAttribute("style", style);
    host.innerHTML = codeBlock("chart", BODY);
    document.body.appendChild(host);
    expect(init(host)).toBe(1);
    const bar = host.querySelector("path[data-y]");
    expect(bar).not.toBeNull();
    return { host, bar: bar! };
  }

  it("paints a bar with the page's --markvis-series-1", () => {
    const { host, bar } = drawIn("--markvis-series-1: rgb(1, 2, 3)");
    expect(bar.getAttribute("fill")).toBe("#3B82F6");
    expect(bar.getAttribute("style")).toBe("fill:var(--markvis-series-1,#3B82F6)");
    expect(getComputedStyle(bar).fill).toBe("rgb(1, 2, 3)");
    host.remove();
  });

  it("falls back to the fixed color when the page sets no variable", () => {
    const { host, bar } = drawIn("");
    expect(getComputedStyle(bar).fill.toLowerCase()).toMatch(/^(#3b82f6|rgb\(59, 130, 246\))$/);
    host.remove();
  });

  it("writes fixed colors after initialize({ colors: \"static\" })", () => {
    initialize({ colors: "static" });
    try {
      const { host, bar } = drawIn("--markvis-series-1: rgb(1, 2, 3)");
      expect(bar.getAttribute("style")).toBeNull();
      expect(host.innerHTML).not.toContain("var(");
      host.remove();
    } finally {
      initialize();
    }
  });
});

describe("markvis.min.js as a classic script", () => {
  const minPath = join(repoRoot, "packages/browser/dist/markvis.min.js");

  it.runIf(existsSync(minPath))("defines a global markvis with init", () => {
    // A browser always has TextEncoder; the bare vm context does not.
    const sandbox: Record<string, unknown> = { TextEncoder };
    runInNewContext(readFileSync(minPath, "utf8"), sandbox);
    const api = sandbox["markvis"] as
      | { init?: unknown; parseBlock?: unknown; render?: (text: string) => { ok: boolean; html: string } }
      | undefined;
    expect(typeof api?.init).toBe("function");
    expect(typeof api?.parseBlock).toBe("function");
    const result = api?.render?.(BODY);
    expect(result?.ok).toBe(true);
    expect(result?.html).toContain("<svg");
  });
});
