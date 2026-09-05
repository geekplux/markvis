import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

function read(rel: string): string {
  return readFileSync(join(webRoot, rel), "utf8");
}

describe("site visual chrome", () => {
  it("home is folio page not VitePress layout home", () => {
    const home = read("index.md");
    expect(home).toMatch(/layout:\s*page/);
    expect(home).not.toMatch(/layout:\s*home/);
    expect(home).toContain("Charts in Markdown. The fence is the data.");
    expect(home).toContain("class=\"folio-figures\"");
    expect(home).toContain("<figcaption>");
    expect(home).not.toMatch(/theme:/);
  });

  it("gallery cards do not crop thumbs", () => {
    const css = read(".vitepress/theme/gallery.css");
    expect(css).not.toMatch(/max-height:\s*140px/);
    expect(css).toMatch(/minmax\(260px,\s*1fr\)/);
    expect(css).toMatch(/overflow:\s*visible/);
    expect(css).toMatch(/max-height:\s*none/);
    expect(css).toContain("#f7f4ef");
  });

  it("nav and paper tokens match site-visual-spec", () => {
    const css = read(".vitepress/theme/site.css");
    expect(css).toContain("#f7f4ef");
    expect(css).toContain("#2563eb");
    expect(css).toMatch(/height:\s*52px/);
    expect(css).toMatch(/font-size:\s*15px/);
    expect(css).not.toMatch(/theme:/);
  });

  it("playground keeps two panes", () => {
    const css = read("../playground/src/style.css");
    expect(css).toMatch(/grid-template-columns:\s*1fr 1fr/);
    expect(css).toContain("#f7f4ef");
    expect(css).not.toMatch(/theme:/);
  });
});
