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
  it("home mounts site-copy sections on folio page layout", () => {
    const home = read("index.md");
    expect(home).toMatch(/layout:\s*page/);
    expect(home).not.toMatch(/layout:\s*home/);
    expect(home).toContain("Charts in Markdown. The fence is the data.");
    expect(home).toContain("folio-what");
    expect(home).toContain("folio-who");
    expect(home).toContain("folio-proof");
    expect(home).toContain('class="folio-figures"');
    expect(home).toContain("folio-start");
    expect(home).toContain("folio-use");
    expect(home).toContain("folio-themes");
    expect(home).toContain("folio-foot");
    expect(home).toContain("<figcaption>");
    expect(home).toContain("Feb led Q3");
    expect(home).toContain("Pro pulled ahead");
    expect(home).toContain("Shares stay raw");
    expect(home).toContain("README / post authors");
    expect(home).toContain("markvis bake");
    expect(home).toContain("@markvis/remark");
    expect(home).not.toMatch(/theme:/);
  });

  it("gallery cards keep aria-label and drop visible titles", () => {
    const vue = read("components/Gallery.vue");
    expect(vue).toContain(':aria-label="item.title"');
    expect(vue).not.toContain("gallery-card-title");
    expect(vue).toContain('aria-label="Chart theme"');
    expect(vue).toContain("themeFilter");
    expect(vue).toContain("svgsByTheme");
    expect(vue).toContain("THEME_CHIPS");
    expect(vue).toContain("Open in Play");
    expect(vue).toContain("playHref");
    expect(vue).toContain("data-theme");
  });

  it("gallery mobile grid + white chrome per EXAMPLES.md", () => {
    const css = read(".vitepress/theme/gallery.css");
    expect(css).not.toMatch(/max-height:\s*140px/);
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
    // U3: drop beige wash — chrome only
    expect(css).not.toMatch(/#f7f4ef/i);
    expect(css).toMatch(/\.gallery-page[\s\S]*background:\s*#ffffff/);
    // chips ≥36–44
    expect(css).toMatch(/\.gallery-chip[\s\S]*height:\s*40px/);
    expect(css).toMatch(/\.gallery-chip[\s\S]*min-height:\s*36px/);
    // grid breakpoints: 1 / 2 / 3 / 4
    expect(css).toMatch(
      /\.gallery-grid[\s\S]*grid-template-columns:\s*1fr/,
    );
    expect(css).toMatch(
      /@media\s*\(min-width:\s*600px\)[\s\S]*grid-template-columns:\s*repeat\(2/,
    );
    expect(css).toMatch(
      /@media\s*\(min-width:\s*900px\)[\s\S]*grid-template-columns:\s*repeat\(3/,
    );
    expect(css).toMatch(
      /@media\s*\(min-width:\s*1200px\)[\s\S]*grid-template-columns:\s*repeat\(4/,
    );
  });

  it("site chrome is white product surface per HOME.md", () => {
    const css = read(".vitepress/theme/site.css");
    expect(css).not.toMatch(/#f7f4ef/i);
    expect(css).not.toMatch(/#efebe4/i);
    expect(css).toMatch(/--vp-c-bg:\s*#ffffff/);
    expect(css).toMatch(/background:\s*#ffffff/);
    expect(css).toContain("#2563eb");
    expect(css).toContain("#171717");
    expect(css).toContain("#64748b");
    expect(css).toContain("#f4f4f5");
    expect(css).toMatch(/max-width:\s*1040px/);
    expect(css).toMatch(/height:\s*44px/);
    expect(css).toMatch(/height:\s*52px/);
    expect(css).toMatch(/font-size:\s*15px/);
    expect(css).not.toMatch(/theme:/);
    // U3 mobile: stack or 2-up hero buttons; tap ≥44
    expect(css).toMatch(/@media\s*\(max-width:\s*768px\)/);
    expect(css).toMatch(/@media\s*\(max-width:\s*390px\)/);
    expect(css).toMatch(/\.folio-btn[\s\S]*height:\s*44px/);
    expect(css).toMatch(/max-width:\s*1200px/);
  });

  it("playground keeps two panes with PLAY chrome + mobile toolbar", () => {
    const css = read("../playground/src/style.css");
    const html = read("../playground/index.html");
    expect(css).toMatch(
      /grid-template-columns:\s*minmax\(40%,\s*1fr\)\s+minmax\(40%,\s*1fr\)/,
    );
    expect(css).toMatch(/section\.preview[\s\S]*background:\s*#ffffff/);
    expect(css).not.toMatch(/section\.preview[\s\S]*background:\s*#f7f4ef/);
    expect(css).toMatch(/--editor-bg:\s*#fafafa/);
    expect(css).not.toMatch(/--code-bg:\s*#171717/);
    expect(css).toMatch(/height:\s*48px/);
    expect(css).toMatch(/min-height:\s*44px/);
    expect(css).toMatch(/flex-wrap:\s*nowrap/);
    expect(css).toMatch(/overflow-x:\s*auto/);
    // U3: stack panes ≤768; toolbar stays one scroll row
    expect(css).toMatch(/@media\s*\(max-width:\s*768px\)[\s\S]*grid-template-columns:\s*1fr/);
    expect(css).toMatch(/\.toolbar[\s\S]*flex-wrap:\s*nowrap/);
    expect(html).toContain('id="theme"');
    expect(html).toContain('value="folio"');
    expect(html).toContain('value="highcharts"');
    expect(html).toContain('value="shadcn"');
    expect(html).toContain('value="docs"');
  });
});
