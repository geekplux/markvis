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
import { init } from "../src/dom.js";

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

describe("markvis.min.js as a classic script", () => {
  const minPath = join(repoRoot, "packages/browser/dist/markvis.min.js");

  it.runIf(existsSync(minPath))("defines a global markvis with init", () => {
    const sandbox: Record<string, unknown> = {};
    runInNewContext(readFileSync(minPath, "utf8"), sandbox);
    const api = sandbox["markvis"] as { init?: unknown; parseMarkdown?: unknown } | undefined;
    expect(typeof api?.init).toBe("function");
    expect(typeof api?.parseMarkdown).toBe("function");
  });
});
