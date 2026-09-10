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
    const css = read(".vitepress/theme/home.css");
    const theme = read(".vitepress/theme/index.ts");
    expect(home).toMatch(/layout:\s*page/);
    expect(home).not.toMatch(/layout:\s*home/);
    expect(home).toMatch(/pageClass:\s*folio-home-page/);
    expect(home).toContain("markvis.");
    expect(home).toContain(
      "Charts in Markdown for any preview, any agent reply.",
    );
    expect(home).toContain("OPEN SOURCE / MIT LICENSE");
    expect(home).toContain("Get started");
    expect(home).toContain("Browse examples");
    expect(home).toContain("&gt; available for");
    expect(home).toContain("npm");
    expect(home).toContain("script");
    expect(home).toContain("skill");
    expect(home).not.toContain("Proof");
    expect(home).toContain("library you can drop in");
    expect(home).toContain("Any Markdown view");
    expect(home).toContain("same fence, same SVG");
    expect(home).toContain("AI replies");
    expect(home).toContain("Themes");
    expect(home).not.toContain("README / post authors");
    expect(home).not.toContain("folio-what");
    expect(home).not.toContain("folio-who");
    expect(home).not.toContain("<figcaption>");
    expect(home).toContain("Feb led Q3");
    expect(home).toContain("home-lattice");
    expect(home).toContain("home-hero-figure");
    expect(home).toContain("home-figure-strip");
    expect(css).toMatch(/\.home-lattice/);
    expect(css).toMatch(/home-rise/);
    expect(home).toContain("Pro pulled ahead");
    expect(home).toContain("Shares stay raw");
    expect(home).not.toMatch(/```chart/);
    expect(home).not.toMatch(/month,revenue/);
    expect(css).toMatch(/#ffdb2a/i);
    expect(css).toMatch(/#080b08/i);
    expect(theme).toContain("./home.css");
    expect(home).not.toMatch(/theme:/);
  });

  it("gallery cards keep aria-label and drop visible titles", () => {
    const vue = read("components/Gallery.vue");
    expect(vue).toContain(':aria-label="item.title"');
    expect(vue).not.toContain("gallery-card-title");
    expect(vue).toContain("gallery-drawer");
    expect(vue).not.toContain('class="{ open: selected }"');
    expect(vue).not.toMatch(/gallery-layout[\s\S]*open:\s*selected/);
    expect(vue).toContain('aria-label="Chart theme"');
    expect(vue).toContain("themeFilter");
    expect(vue).toContain("svgsByTheme");
    expect(vue).toContain("THEME_CHIPS");
    expect(vue).toContain("Open in Play");
    expect(vue).toContain("playHref");
    expect(vue).toContain("data-theme");
    expect(vue).toContain("enhanceChartSvg");
    expect(vue).toContain('@markvis/browser/enhance');
    expect(vue).toMatch(/querySelector\([\"'`]\.gallery-full[\"'`]\)/);
  });

  it("gallery mobile grid + white chrome per EXAMPLES.md", () => {
    const css = read(".vitepress/theme/gallery.css");
    expect(css).not.toMatch(/\.gallery-layout\.open/);
    expect(css).toMatch(/\.gallery-drawer/);
    const family = read(".vitepress/theme/family.css");
    const nav = read("components/SiteNav.vue");
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
    expect(css).toMatch(/\.markvis-tip/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).not.toMatch(/#f7f4ef/i);
    expect(css).not.toMatch(/#2563eb/i);
    expect(css).not.toMatch(/999px/);
    expect(css).toMatch(/\.gallery-page[\s\S]*background:\s*transparent/);
    expect(css).toMatch(/\.gallery-card\s*\{[^}]*background:\s*transparent/s);
    expect(css).toMatch(/\.gallery-card\s*\{[^}]*border:\s*1px\s+solid\s+var\(--site-rule\)/s);
    expect(css).not.toMatch(/\.gallery-card\s*\{[^}]*background:\s*var\(--site-paper\)/s);
    expect(css).not.toMatch(/\.gallery-page[\s\S]*background:\s*#0e1312/);
    expect(css).toMatch(/\.gallery-page[\s\S]*padding:\s*24px/);
    expect(css).toMatch(/\.gallery-chip[\s\S]*height:\s*44px/);
    expect(css).toMatch(/\.gallery-chip[\s\S]*border-radius:\s*0/);
    expect(css).toMatch(/\.gallery-chip[\s\S]*font-size:\s*11px/);
    expect(css).toMatch(/\.gallery-chip[\s\S]*text-transform:\s*uppercase/);
    expect(css).toMatch(
      /\.gallery-grid[\s\S]*grid-template-columns:\s*1fr/,
    );
    expect(css).not.toMatch(/repeat\(3/);
    expect(css).toMatch(
      /@media\s*\(min-width:\s*768px\)[\s\S]*grid-template-columns:\s*repeat\(2/,
    );
    expect(css).toMatch(
      /@media\s*\(min-width:\s*1200px\)[\s\S]*grid-template-columns:\s*repeat\(4/,
    );
    expect(family).toMatch(/height:\s*72px/);
    expect(family).toMatch(/#ffdb2a/i);
    expect(family).toMatch(/\.family-nav \.home-nav-action[\s\S]*background:\s*#080b08/i);
    expect(family).toMatch(/\.family-nav \.home-nav-action[\s\S]*color:\s*#ffdb2a/i);
    expect(family).toMatch(/#080b08/i);
    expect(family).not.toMatch(/#2563eb/i);
    expect(family).toMatch(/background:\s*var\(--site-page\)/);
    expect(family).toMatch(/overflow:\s*visible/);
    expect(family).toMatch(/max-width:\s*768px/);
    expect(family).toMatch(/minmax\(0,\s*1fr\)\s*auto auto auto/);
    expect(family).not.toMatch(/max-width:\s*390px[\s\S]*home-nav-links/);
    expect(nav).toContain('href="/"');
    expect(nav).toContain("markvis");
    expect(nav).toContain('href="/spec"');
    expect(nav).toContain('href="/examples"');
    expect(nav).toContain("folio-examples");
    expect(nav).toContain("pageClass");
    expect(nav).not.toContain("useRoute");
    expect(nav).toContain('href="/play"');
    expect(nav).toContain('href="/ai"');
    expect(nav).toContain("Playground");
    expect(nav).toContain("data-site-mode-toggle");
    expect(nav).toContain("home-nav-mode");
    expect(nav).toContain("home-nav-mode-sun");
    expect(nav).not.toMatch(/>\s*Light\s*</);
  });

  it("docs body is ink; home.css locks field + ink panel", () => {
    const site = read(".vitepress/theme/site.css");
    const home = read(".vitepress/theme/home.css");
    expect(site).not.toMatch(/#f7f4ef/i);
    expect(site).not.toMatch(/#efebe4/i);
    expect(site).toMatch(/--vp-c-bg:\s*#ffffff/);
    expect(site).toMatch(/background:\s*#ffffff/);
    expect(site).toContain("#171717");
    expect(site).toContain("#64748b");
    expect(site).toContain("#f4f4f5");
    expect(site).toMatch(/max-width:\s*1040px/);
    expect(site).toMatch(/height:\s*52px/);
    expect(site).toMatch(/font-size:\s*15px/);
    expect(site).not.toMatch(/theme:/);
    expect(site).toMatch(/max-width:\s*1200px/);
    expect(home).toMatch(/#ffdb2a/i);
    expect(home).toMatch(/#080b08/i);
    expect(home).not.toMatch(/#f7f4ef/i);
    expect(home).not.toMatch(/#2563eb/i);
    expect(home).toMatch(/\.home-panel/);
    expect(home).toMatch(/min-height:\s*720px/);
    expect(home).toMatch(/@media\s*\(max-width:\s*768px\)/);
    expect(home).toMatch(/@media\s*\(max-width:\s*390px\)/);
    expect(home).toMatch(/minmax\(0,\s*1fr\)\s*auto auto auto/);
    expect(home).toMatch(/\.home-nav[\s\S]*overflow:\s*visible/);
    expect(home).toMatch(/\.home-btn[\s\S]*justify-content:\s*space-between/);
    expect(home).toMatch(/\.home-btn[\s\S]*padding:\s*12px 18px/);
    expect(home).toMatch(/\.home-band[\s\S]*gap:\s*1px/);
    expect(home).toMatch(/\.home-chip-label/);
    expect(home).not.toMatch(/\.home-proof-h/);
  });

  it("site light/dark mode tokens + menu not clipped", () => {
    const mode = read(".vitepress/theme/site-mode.css");
    const modeTs = read(".vitepress/theme/siteMode.ts");
    const theme = read(".vitepress/theme/index.ts");
    const homeMd = read("index.md");
    const homeCss = read(".vitepress/theme/home.css");
    const family = read(".vitepress/theme/family.css");
    expect(mode).toMatch(/html\.dark/);
    expect(mode).toMatch(/html\.light/);
    expect(mode).toMatch(/--site-page:\s*#0e1312/);
    expect(mode).toMatch(/--site-page:\s*#f8f8f6/);
    expect(modeTs).toContain("markvis-site-mode");
    expect(modeTs).toContain("toggleSiteMode");
    expect(theme).toContain("./site-mode.css");
    expect(theme).toContain("initSiteMode");
    expect(homeMd).toContain("data-site-mode-toggle");
    expect(homeMd).toContain("home-nav-mode-sun");
    expect(homeMd).toContain('aria-label="Switch to light mode"');
    expect(homeMd).not.toMatch(/>\s*Light\s*</);
    expect(homeMd).not.toMatch(/>\s*Dark\s*</);
    expect(mode).toMatch(/width:\s*44px/);
    expect(mode).toMatch(/height:\s*44px/);
    expect(modeTs).toContain("Switch to light mode");
    expect(modeTs).toContain("home-nav-mode-sun");
    expect(modeTs).not.toContain('return mode === "dark" ? "Light"');
    expect(homeCss).toMatch(/\.home-nav[\s\S]*overflow:\s*visible/);
    expect(family).toMatch(/\.family-nav[\s\S]*overflow:\s*visible/);
    expect(family).not.toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*\.family-nav[\s\S]*overflow-x:\s*hidden/,
    );
  });

  it("playground keeps two panes with PLAY chrome + mobile toolbar", () => {
    const css = read("../playground/src/style.css");
    const html = read("../playground/index.html");
    expect(css).toMatch(
      /grid-template-columns:\s*minmax\(40%,\s*1fr\)\s+minmax\(40%,\s*1fr\)/,
    );
    expect(css).toMatch(/section\.preview[\s\S]*background:\s*#edebe5/);
    expect(css).toMatch(/--bg:\s*#0e1312/);
    expect(css).not.toMatch(/section\.preview[\s\S]*background:\s*#f7f4ef/);
    expect(css).not.toMatch(/#2563eb/i);
    expect(css).toMatch(/--editor-bg:\s*#0e130f/);
    expect(css).not.toMatch(/--code-bg:\s*#171717/);
    expect(css).toMatch(/font-size:\s*11px/);
    expect(css).toMatch(/text-transform:\s*uppercase/);
    expect(css).toMatch(/#svg-host svg[\s\S]*width:\s*100%/);
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
    expect(html).toContain('value="ant"');
    expect(html).toContain('value="recharts"');
    const main = read("../playground/src/main.ts");
    expect(main).toContain("enhanceChartSvg");
    expect(main).toContain('@markvis/browser/enhance');
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/\.markvis-tip/);
  });

  it("browser package exports enhanceChartSvg", () => {
    const idx = read("../../packages/browser/src/index.ts");
    const enhance = read("../../packages/browser/src/enhance.ts");
    expect(idx).toContain("enhanceChartSvg");
    expect(enhance).toContain("export function enhanceChartSvg");
    expect(enhance).toContain("prefers-reduced-motion");
  });
});
