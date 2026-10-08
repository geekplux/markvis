// @vitest-environment happy-dom
/**
 * When the drop-in draws on its own: the classic script runs once the DOM
 * is ready wherever the tag sits, `data-start-on-load="false"` turns that
 * off, and the ES module never draws on import.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, "../dist");
const BLOCK = '<pre><code class="language-chart">type: bar\nx: day\ny: visits\n\nday,visits\nMon,3\nTue,5</code></pre>';

function stubDocument(state: DocumentReadyState, script: Element | null): void {
  Object.defineProperty(document, "readyState", { configurable: true, get: () => state });
  Object.defineProperty(document, "currentScript", { configurable: true, get: () => script });
}

function scriptTag(attrs = ""): Element {
  const holder = document.createElement("div");
  holder.innerHTML = `<script ${attrs}></script>`;
  return holder.firstElementChild!;
}

afterEach(() => {
  document.body.innerHTML = "";
  delete (document as { readyState?: unknown }).readyState;
  delete (document as { currentScript?: unknown }).currentScript;
  vi.resetModules();
});

describe("classic script (iife.ts)", () => {
  it("runs at DOMContentLoaded when the tag comes before the content", async () => {
    stubDocument("loading", scriptTag());
    await import("../src/iife.js");
    document.body.innerHTML = BLOCK;
    expect(document.querySelectorAll("svg")).toHaveLength(0);
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(document.querySelectorAll("svg")).toHaveLength(1);
  });

  it("runs at once when the tag comes after the content, or with defer", async () => {
    for (const state of ["interactive", "complete"] as const) {
      document.body.innerHTML = BLOCK;
      stubDocument(state, scriptTag(state === "interactive" ? "defer" : ""));
      await import("../src/iife.js");
      expect(document.querySelectorAll("svg"), state).toHaveLength(1);
      vi.resetModules();
    }
  });

  it('does nothing with data-start-on-load="false" until run() is called', async () => {
    document.body.innerHTML = BLOCK;
    stubDocument("complete", scriptTag('data-start-on-load="false"'));
    const api = await import("../src/iife.js");
    expect(document.querySelectorAll("svg")).toHaveLength(0);
    expect(api.run()).toBe(1);
  });

  it("reads the attribute leniently", async () => {
    const { startsOnLoad } = await import("../src/iife.js");
    expect(startsOnLoad(scriptTag('data-start-on-load=" FALSE "'))).toBe(false);
    expect(startsOnLoad(scriptTag('data-start-on-load="true"'))).toBe(true);
    expect(startsOnLoad(scriptTag())).toBe(true);
    expect(startsOnLoad(null)).toBe(true);
  });
});

describe("ES module (index.ts)", () => {
  it("draws nothing on import", async () => {
    document.body.innerHTML = BLOCK;
    stubDocument("complete", null);
    const api = await import("../src/index.js");
    document.dispatchEvent(new Event("DOMContentLoaded"));
    expect(document.querySelectorAll("svg")).toHaveLength(0);
    expect(api.run()).toBe(1);
  });
});

describe("built bundles", () => {
  const iife = join(dist, "markvis.min.js");
  const esm = join(dist, "markvis.mjs");

  it.runIf(existsSync(iife))("markvis.min.js honors data-start-on-load in a bare context", () => {
    for (const [attr, expected] of [["false", 0], [null, 1]] as const) {
      const calls: string[] = [];
      const fakeDocument = {
        readyState: "complete",
        currentScript: { getAttribute: (name: string) => (name === "data-start-on-load" ? attr : null) },
        querySelectorAll: (selector: string) => {
          calls.push(selector);
          return [];
        },
        createTreeWalker: () => ({ nextNode: () => null }),
        addEventListener: () => {},
      };
      const sandbox: Record<string, unknown> = { TextEncoder, document: fakeDocument };
      runInNewContext(readFileSync(iife, "utf8"), sandbox);
      expect(typeof (sandbox["markvis"] as { run?: unknown }).run).toBe("function");
      expect(calls.length > 0 ? 1 : 0, `data-start-on-load=${attr}`).toBe(expected);
    }
  });

  it.runIf(existsSync(esm))("markvis.mjs draws nothing on import", async () => {
    document.body.innerHTML = BLOCK;
    stubDocument("complete", null);
    const api = (await import(pathToFileURL(esm).href)) as { run: () => number; initialize: unknown };
    expect(document.querySelectorAll("svg")).toHaveLength(0);
    expect(typeof api.initialize).toBe("function");
    expect(api.run()).toBe(1);
  });
});
