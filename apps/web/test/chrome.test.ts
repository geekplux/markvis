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
    expect(home).not.toContain("<figcaption>");
    expect(home).not.toMatch(/theme:/);
  });

  it("gallery cards keep aria-label and drop visible titles", () => {
    const vue = read("components/Gallery.vue");
    expect(vue).toContain(":aria-label=\"item.title\"");
    expect(vue).not.toContain("gallery-card-title");
  });

  it("gallery cards do not crop thumbs", () => {
    const css = read(".vitepress/theme/gallery.css");
    expect(css).not.toMatch(/max-height:\s*140px/);
    expect(css).toMatch(/minmax\(260px,\s*1fr\)/);
    expect(css).toMatch(/overflow:\s*visible/);
    expect(css).toMatch(/max-height:\s*none/);
    expect(css).toMatch(/\.gallery-thumb svg[\s\S]*width:\s*100%/);
    expect(css).toMatch(/\.gallery-thumb svg[\s\S]*height:\s*auto/);
    expect(css).toMatch(/\.gallery-thumb svg[\s\S]*max-width:\s*100%/);
    expect(css).not.toContain("gallery-card-title");
    expect(css).not.toContain(":deep");
    expect(css).toMatch(/\.gallery-full svg[\s\S]*width:\s*100%/);
    expect(css).toMatch(/\.gallery-full svg[\s\S]*height:\s*auto/);
    expect(css).toMatch(/\.gallery-full svg[\s\S]*max-width:\s*100%/);
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

  it("playground keeps two panes with PLAY chrome", () => {
    const css = read("../playground/src/style.css");
    const html = read("../playground/index.html");
    expect(css).toMatch(/grid-template-columns:\s*minmax\(40%,\s*1fr\)\s+minmax\(40%,\s*1fr\)/);
    expect(css).toMatch(/section\.preview[\s\S]*background:\s*#ffffff/);
    expect(css).not.toMatch(/section\.preview[\s\S]*background:\s*#f7f4ef/);
    expect(css).toMatch(/--editor-bg:\s*#fafafa/);
    expect(css).not.toMatch(/--code-bg:\s*#171717/);
    expect(css).toMatch(/height:\s*48px/);
    expect(css).toMatch(/min-height:\s*44px/);
    expect(css).toMatch(/flex-wrap:\s*nowrap/);
    expect(css).toMatch(/overflow-x:\s*auto/);
    expect(html).toContain('id="theme"');
    expect(html).toContain('value="folio"');
    expect(html).toContain('value="highcharts"');
    expect(html).toContain('value="shadcn"');
    expect(html).toContain('value="docs"');
  });
});
