import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { PROOF_STEMS, proofViews } from "../src/homeProof";
import type { GalleryItem } from "../src/catalog";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

function read(rel: string): string {
  return readFileSync(join(webRoot, rel), "utf8");
}

/** 8-bit RGBA PNG only — locks Klein Blue ink without a decoder package. */
function pngRgba8(buf: Buffer): { width: number; height: number; rgba: Buffer } {
  expect(buf.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  let width = 0;
  let height = 0;
  let bit = 0;
  let color = 0;
  const idats: Buffer[] = [];
  for (let i = 8; i + 12 <= buf.length; ) {
    const len = buf.readUInt32BE(i);
    const type = buf.toString("ascii", i + 4, i + 8);
    const data = buf.subarray(i + 8, i + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bit = data[8] ?? 0;
      color = data[9] ?? 0;
    } else if (type === "IDAT") {
      idats.push(data);
    } else if (type === "IEND") {
      break;
    }
    i += 12 + len;
  }
  expect(bit).toBe(8);
  expect(color).toBe(6);
  const inflated = inflateSync(Buffer.concat(idats));
  const stride = width * 4;
  const rgba = Buffer.alloc(height * stride);
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = inflated[src++] ?? 0;
    const row = inflated.subarray(src, src + stride);
    src += stride;
    const outOff = y * stride;
    const upOff = (y - 1) * stride;
    for (let x = 0; x < stride; x++) {
      const raw = row[x] ?? 0;
      const a = x >= 4 ? (rgba[outOff + x - 4] ?? 0) : 0;
      const b = y > 0 ? (rgba[upOff + x] ?? 0) : 0;
      const c = y > 0 && x >= 4 ? (rgba[upOff + x - 4] ?? 0) : 0;
      let recon = raw;
      if (filter === 1) {
        recon = (raw + a) & 255;
      } else if (filter === 2) {
        recon = (raw + b) & 255;
      } else if (filter === 3) {
        recon = (raw + ((a + b) >> 1)) & 255;
      } else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        const pr = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
        recon = (raw + pr) & 255;
      } else if (filter !== 0) {
        throw new Error(`png filter ${filter}`);
      }
      rgba[outOff + x] = recon;
    }
  }
  return { width, height, rgba };
}

function countRgb(rgba: Buffer, r: number, g: number, b: number): number {
  let n = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (
      rgba[i] === r &&
      rgba[i + 1] === g &&
      rgba[i + 2] === b &&
      (rgba[i + 3] ?? 0) > 200
    ) {
      n++;
    }
  }
  return n;
}

function expectNoYellow(source: string, label: string): void {
  expect(source, label).not.toMatch(/#ffdb2a/i);
  expect(source, label).not.toMatch(/--site-field:/);
  expect(source, label).not.toMatch(/--home-field:/);
  expect(source, label).not.toMatch(/--family-field:/);
}

function expectNoPeachHex(source: string, label: string): void {
  expect(source, label).not.toMatch(/#c2410c/i);
  expect(source, label).not.toMatch(/#fb923c/i);
}

function opaqueCount(rgba: Buffer): number {
  let n = 0;
  for (let i = 3; i < rgba.length; i += 4) {
    if ((rgba[i] ?? 0) > 200) n += 1;
  }
  return n;
}

describe("site visual chrome", () => {
  it("tokens lock Klein Blue rails and drop peach Motions identity", () => {
    const mode = read(".vitepress/theme/site-mode.css");
    const home = read(".vitepress/theme/home.css");
    const family = read(".vitepress/theme/family.css");
    const gallery = read(".vitepress/theme/gallery.css");
    const index = read("index.md");

    for (const block of [
      /html\.light\s*\{([\s\S]*?)\n\}/,
      /html\.dark\s*\{([\s\S]*?)\n\}/,
    ]) {
      const m = mode.match(block);
      expect(m, "mode block").toBeTruthy();
      const body = m![1];
      for (const token of [
        "--site-klein",
        "--site-mint",
        "--site-bg",
        "--site-fg",
        "--site-muted",
        "--site-border",
        "--site-primary",
        "--site-primary-fg",
        "--site-card-2",
      ]) {
        expect(body).toContain(`${token}:`);
      }
    }

    expect(mode).toMatch(/--site-radius:\s*0px/);
    expect(mode).toMatch(/--site-measure:\s*72rem/);
    expect(mode).toMatch(/--site-nav-h:\s*64px/);
    expect(mode).toMatch(/--site-sans:\s*"Geist Variable"/);
    expect(mode).toMatch(/--site-mono:\s*"Geist Mono Variable"/);
    expect(mode).toMatch(
      /html\.light\s*\{[^}]*--site-klein:\s*#002fa7/s,
    );
    expect(mode).toMatch(
      /html\.dark\s*\{[^}]*--site-klein:\s*#7aa2ff/s,
    );
    expect(mode).toMatch(
      /html\.light\s*\{[^}]*--site-primary:\s*#002fa7/s,
    );
    expect(mode).toMatch(
      /html\.dark\s*\{[^}]*--site-primary:\s*#7aa2ff/s,
    );
    expect(mode).toMatch(/\.site-rail/);
    expect(mode).toMatch(/max-width:\s*var\(--site-measure\)/);
    expect(mode).toMatch(/border-inline:\s*1px\s+solid\s+var\(--site-border\)/);
    expect(mode).toMatch(/\.rail-joints/);
    expect(mode).toMatch(/\.rail-joints-top/);
    expect(mode).toMatch(/\.rail-joints-bottom/);

    expectNoYellow(mode, "site-mode.css");
    expectNoYellow(home, "home.css");
    expectNoYellow(family, "family.css");
    expectNoYellow(gallery, "gallery.css");
    expectNoYellow(read(".vitepress/theme/site.css"), "site.css");
    expectNoYellow(index, "index.md");
    expectNoPeachHex(mode, "site-mode.css");
    expectNoPeachHex(home, "home.css");
    expectNoPeachHex(family, "family.css");
    expectNoPeachHex(gallery, "gallery.css");
    expectNoPeachHex(read(".vitepress/theme/site.css"), "site.css");
  });

  it("home mounts the QuickGUI landing stack with markvis copy", () => {
    const home = read("index.md");
    const css = read(".vitepress/theme/home.css");
    const theme = read(".vitepress/theme/index.ts");

    expect(home).toMatch(/layout:\s*page/);
    expect(home).not.toMatch(/layout:\s*home/);
    expect(home).toMatch(/pageClass:\s*folio-home-page/);
    expect(home).toContain('id="hero"');
    expect(home).toContain('id="proof"');
    expect(home).toContain('id="features"');
    expect(home).toContain('id="code"');
    expect(home).toContain('id="quickstart"');
    expect(home).toContain('id="hosts"');
    expect(home).toContain('id="cta"');
    expect(home.indexOf('id="hero"')).toBeLessThan(home.indexOf('id="proof"'));
    expect(home.indexOf('id="proof"')).toBeLessThan(home.indexOf('id="features"'));
    expect(home.indexOf('id="features"')).toBeLessThan(home.indexOf('id="code"'));
    expect(home.indexOf('id="code"')).toBeLessThan(home.indexOf('id="quickstart"'));
    expect(home.indexOf('id="quickstart"')).toBeLessThan(home.indexOf('id="hosts"'));
    expect(home.indexOf('id="hosts"')).toBeLessThan(home.indexOf('id="cta"'));

    expect(home).toContain("OPEN SOURCE");
    expect(home).toContain("v2");
    expect(home).toMatch(
      /<h1 class="home-headline">\s*<span>Charts in Markdown\.<\/span>\s*<span>The numbers are the picture\.<\/span>/,
    );
    expect(home).toContain("Charts in Markdown.");
    expect(home).toContain("The numbers are the picture.");
    expect(home.replace(/<FenceTabs\s*\/>/g, "")).not.toMatch(/fence/i);
    expect(home).toContain('href="#quickstart">Get started');
    expect(home).toContain('class="home-btn filled" href="#quickstart">Get started');
    expect(home).toContain("Examples");
    expect(home).toContain("Get started with MarkVis");
    expect(home).toContain('href="/play">Playground');
    expect(home).toContain('class="home-btn filled" href="/play">Playground');
    expect(home).toContain('<CopyChip command="pnpm markvis bake README.md"');
    expect(home).not.toContain("npx markvis");
    const chip = read("components/CopyChip.vue");
    expect(chip).toMatch(/prefix:\s*"\$"/);
    expect(chip).toContain("copy-chip-prefix");
    expect(home).toContain("<HomeProof");
    expect(home).toContain("<FenceTabs");
    const tabs = read("components/FenceTabs.vue");
    expect(tabs).toContain('role="tablist"');
    expect(tabs).toContain("fence-tabs-tab");
    expect(home).toContain(">01<");
    expect(home).toContain(">02<");
    expect(home).toContain(">03<");
    expect(home).toContain("Star on GitHub");
    expect(home).toContain('src="/logo.png"');
    expect(home).toContain('class="home-host-name">npm</span>');
    expect(home).toContain('class="home-host-name">script</span>');
    expect(home).toContain('class="home-host-name">skill</span>');
    expect(home.match(/home-host-name">npm<\/span>\s*<span class="home-host-status">([^<]+)/)?.[1]).toBe(
      "clone + build",
    );
    expect(home.match(/home-host-name">script<\/span>\s*<span class="home-host-status">([^<]+)/)?.[1]).toBe(
      "clone + build",
    );
    expect(home.match(/home-host-name">skill<\/span>\s*<span class="home-host-status">([^<]+)/)?.[1]).toBe(
      "available now",
    );
    expect(home).toContain("Try it in the browser");
    expect(home).toContain("Lives in your Markdown");
    expect(home).toContain("Same text, same picture");
    expect(home).toContain("Built for people and AI");
    expect(home).toContain("Looks you can pick");
    expect(home).not.toMatch(/\bIR\b/);
    expect(home).not.toContain("home-lattice");
    expect(home).not.toContain("home-field");
    expect(home).not.toContain("home-nav");
    expect(home).not.toContain("home-foot");
    expect(home).not.toContain("README / post authors");
    expect(home).not.toMatch(/```chart/);
    expect(home).not.toMatch(/Vega-Lite|\bECharts\b|Observable Plot/i);
    expect(home.toLowerCase()).not.toContain(["mer", "maid"].join(""));

    expect(css).toMatch(/\.home-badge/);
    expect(css).toMatch(/\.copy-chip/);
    expect(css).toMatch(/\.home-grid/);
    expect(css).toMatch(/gap:\s*1px/);
    expect(css).toMatch(/\.home-dots/);
    expect(css).toMatch(/border-radius:\s*var\(--site-radius\)/);
    expect(theme).toContain("./home.css");
    expect(theme).toContain("CopyChip");
    expect(theme).toContain("HomeProof");
    expect(theme).toContain("FenceTabs");
  });

  it("commits a logo and wires header, CTA, and favicon", () => {
    expect(existsSync(join(webRoot, "public/logo.png"))).toBe(true);
    expect(existsSync(join(webRoot, "public/logo-dark.png"))).toBe(true);
    expect(existsSync(join(webRoot, "public/favicon.png"))).toBe(true);
    expect(existsSync(join(webRoot, "public/apple-touch-icon.png"))).toBe(true);
    expect(existsSync(join(webRoot, "public/og.png"))).toBe(true);
    const png = readFileSync(join(webRoot, "public/logo.png"));
    expect(png.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );
    const pixels = pngRgba8(png);
    const klein = countRgb(pixels.rgba, 0x00, 0x2f, 0xa7);
    const white = countRgb(pixels.rgba, 0xff, 0xff, 0xff);
    const cyan = countRgb(pixels.rgba, 0x00, 0xc4, 0xf8);
    const opaque = opaqueCount(pixels.rgba);
    expect(opaque).toBeGreaterThan(0);
    // Klein square field is most of the mark; white M + cyan V sit on it.
    expect(klein / opaque).toBeGreaterThan(0.5);
    expect(white).toBeGreaterThan(0);
    expect(cyan).toBeGreaterThan(0);
    const nav = read("components/SiteNav.vue");
    const home = read("index.md");
    const config = read(".vitepress/config.ts");
    expect(nav).toContain('src="/logo.png"');
    expect(nav).toContain('class="home-wordmark"');
    expect(nav).toContain("<span>MarkVis</span>");
    expect(nav).toMatch(
      /class="home-nav-links">[\s\S]*href="\/get-started"[\s\S]*>Docs<\/a>[\s\S]*href="\/examples"[\s\S]*>Examples<\/a>[\s\S]*href="\/play"[\s\S]*>Playground<\/a>[\s\S]*href="\/ai"[\s\S]*>AI<\/a>/,
    );
    expect(nav).toContain('class="home-nav-action" href="/play">Playground');
    expect(nav).not.toMatch(/class="home-nav-action"[^>]*>Get started/);
    expect(nav).toContain('text: "Get started"');
    expect(nav).toContain("folio-home-page");
    expect(home).toContain('id="cta"');
    expect(home).toContain('src="/logo.png"');
    expect(config).toContain('rel: "icon"');
    expect(config).toContain("/favicon.png");
    expect(config).toContain("/apple-touch-icon.png");
    expect(config).toContain("https://markvis.js.org/og.png");
    expect(config).toContain('title: "MarkVis"');
    expect(config).toContain('siteTitle: "MarkVis"');
    expect(existsSync(join(webRoot, "public/logo.svg"))).toBe(false);
  });

  const distIndex = join(webRoot, ".vitepress/dist/index.html");
  it.skipIf(!existsSync(distIndex))(
    "built dist home ships section ids, logo, and no Motions yellow",
    () => {
      const html = read(".vitepress/dist/index.html");
      for (const id of [
        "hero",
        "proof",
        "features",
        "code",
        "quickstart",
        "hosts",
        "cta",
      ]) {
        expect(html).toContain(`id="${id}"`);
      }
      expect(html).toContain('src="/logo.png"');
      expect(html).toContain('href="/favicon.png"');
      expect(html).toContain('class="copy-chip-prefix"');
      expect(html).toContain(">$</span>");
      expect(html).toMatch(
        /class="home-nav-right"[\s\S]*class="home-nav-menu"/,
      );
      expect(existsSync(join(webRoot, ".vitepress/dist/logo.png"))).toBe(true);
      const cssName = readdirSync(join(webRoot, ".vitepress/dist/assets")).find(
        (name) => name.startsWith("style.") && name.endsWith(".css"),
      );
      expect(cssName, "built style css").toBeTruthy();
      const builtCss = read(`.vitepress/dist/assets/${cssName}`);
      expect(builtCss).toMatch(/#002fa7/i);
      expect(builtCss).toMatch(/#7aa2ff/i);
      expectNoYellow(builtCss, "built style css");
      expectNoPeachHex(builtCss, "built style css");
    },
  );

  const distDocs = join(webRoot, ".vitepress/dist/get-started.html");
  it.skipIf(!existsSync(distDocs))(
    "built dist docs ships section links in the site Menu drawer",
    () => {
      const html = read(".vitepress/dist/get-started.html");
      expect(html).toContain('class="home-nav-docs"');
      expect(html).toMatch(
        /class="home-nav-right"[\s\S]*class="home-nav-menu"/,
      );
      for (const label of [
        "Get started",
        "Integrate",
        "Spec",
        "Themes",
        "AI",
        "Contributing themes",
      ]) {
        expect(html).toContain(label);
      }
    },
  );

  it("proof stems are the three committed examples and proofViews maps them", () => {
    expect([...PROOF_STEMS]).toEqual([
      "01-bar-basic",
      "02-line-multi",
      "05-pie-raw",
    ]);
    const proof = read("src/homeProof.ts");
    const homeProofVue = read("components/HomeProof.vue");
    const tabs = read("components/FenceTabs.vue");
    expect(proof).toContain("01-bar-basic");
    expect(proof).toContain("02-line-multi");
    expect(proof).toContain("05-pie-raw");
    expect(homeProofVue).toContain("examples/out");
    expect(homeProofVue).toContain("GALLERY_ITEMS");
    expect(tabs).toContain("PROOF_STEMS");
    expect(tabs).toContain("GALLERY_ITEMS");

    const items = [
      {
        id: "01-bar-basic",
        type: "bar",
        title: "Mar led Midtown box office at 9.2k tickets",
        fence: "```chart\ntype: bar\n```",
        svg: "<svg></svg>",
        svgsByTheme: {} as GalleryItem["svgsByTheme"],
      },
      {
        id: "02-line-multi",
        type: "line",
        title: "Walk-up still leads member through week 12",
        fence: "```chart\ntype: line\n```",
        svg: "<svg></svg>",
        svgsByTheme: {} as GalleryItem["svgsByTheme"],
      },
      {
        id: "05-pie-raw",
        type: "pie",
        title: "MARTA takes the largest mode share",
        fence: "```markvis\ntype: pie\n```",
        svg: "<svg></svg>",
        svgsByTheme: {} as GalleryItem["svgsByTheme"],
      },
    ] as GalleryItem[];
    const views = proofViews(items, {
      "01-bar-basic": "/out/01-bar-basic.svg",
      "02-line-multi": "/out/02-line-multi.svg",
      "05-pie-raw": "/out/05-pie-raw.svg",
    });
    expect(views).toHaveLength(3);
    expect(views[0]?.src).toBe("/out/01-bar-basic.svg");
    expect(views[0]?.type).toBe("bar");
    expect(views[2]?.title).toContain("MARTA");
    expect(() =>
      proofViews(items.slice(0, 1), {
        "01-bar-basic": "/x.svg",
        "02-line-multi": "/y.svg",
        "05-pie-raw": "/z.svg",
      }),
    ).toThrow(/missing proof gallery item/);
  });

  it("gallery cards keep aria-label and drop visible titles", () => {
    const vue = read("components/Gallery.vue");
    expect(vue).toContain(':aria-label="item.title"');
    expect(vue).not.toContain("gallery-card-title");
    expect(vue).toContain("gallery-drawer");
    expect(vue).not.toContain('class="{ open: selected }"');
    expect(vue).not.toMatch(/gallery-layout[\s\S]*open:\s*selected/);
    expect(vue).toContain('aria-label="Chart theme"');
    expect(vue).toContain('aria-label="Detail color"');
    expect(vue).toContain("PALETTE_CHIPS");
    expect(vue).toContain("detailPalette");
    expect(vue).toContain("fenceForThemePalette");
    expect(vue).toContain("themeFilter");
    expect(vue).toContain("svgsByTheme");
    expect(vue).toContain("THEME_CHIPS");
    expect(vue).toContain("Open in Play");
    expect(vue).toContain("playHref");
    expect(vue).toContain("data-theme");
    expect(vue).toContain("enhanceChartSvg");
    expect(vue).toContain("@markvis/browser/enhance");
    expect(vue).toMatch(/querySelector\([\"'`]\.gallery-full[\"'`]\)/);
  });

  it("gallery mobile grid + family chrome share peach-zinc rails", () => {
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
    expect(css).not.toContain("gallery-card-title");
    expect(css).toMatch(/\.gallery-page[\s\S]*background:\s*transparent/);
    expect(css).toMatch(/\.gallery-card\s*\{[^}]*background:\s*transparent/s);
    expect(css).toMatch(
      /\.gallery-card\s*\{[^}]*border:\s*1px\s+solid\s+var\(--site-rule\)/s,
    );
    expect(css).toMatch(/\.gallery-chip[\s\S]*border-radius:\s*0/);
    expect(css).toMatch(
      /\.gallery-chip\.active[\s\S]*background:\s*var\(--site-primary\)/,
    );
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
    expect(family).toMatch(/--vp-nav-height:\s*var\(--site-nav-h\)/);
    expect(family).toMatch(/--vp-sidebar-width:\s*272px/);
    expect(family).toMatch(/\.home-nav-action[\s\S]*background:\s*var\(--site-primary\)/);
    expect(family).toMatch(/\.site-header/);
    expect(nav).toContain("rail-joints");
    expect(family).not.toMatch(/#2563eb/i);
    expect(nav).toContain('href="/"');
    expect(nav).toContain("MarkVis");
    expect(nav).toContain('href="/get-started"');
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
    expect(nav).toContain("home-nav-right");
    expect(family).toMatch(/\.home-nav-right/);
    expect(nav).toContain("aria-expanded");
    expect(nav).toContain("menuOpen");
    const menuRule = family.match(/\.home-nav-menu\s*\{[^}]*\}/)?.[0] ?? "";
    expect(menuRule).toMatch(/min-height:\s*44px/);
    expect(menuRule).toMatch(/min-width:\s*44px/);
    expect(menuRule).not.toMatch(/(?<![a-z-])width:\s*44px/);
    expect(nav).toMatch(
      /class="home-nav-right"[\s\S]*class="home-nav-menu"/,
    );
    expect(family).toMatch(
      /@media\s*\(max-width:\s*1023px\)[\s\S]*?\.home-nav-links\s*\{[^}]*flex-basis:\s*100%/,
    );
    expect(family).toMatch(
      /@media\s*\(max-width:\s*1023px\)[\s\S]*?\.home-nav\.is-open \.home-nav-links\s*\{[^}]*display:\s*flex/,
    );
    expect(nav).toContain("Contributing themes");
    expect(nav).toContain('href: "/integrate"');
    expect(nav).toContain(':href="link.href"');
    expect(family).toMatch(/\.home-nav-docs/);
    expect(family).toMatch(
      /\.folio-docs \.VPLocalNav\s*\{[^}]*display:\s*none/,
    );
    expect(family).toMatch(
      /\.folio-docs \.VPSidebar \.curtain\s*\{[^}]*display:\s*none/,
    );
    expect(family).toMatch(
      /@media\s*\(max-width:\s*959px\)[\s\S]*?\.folio-docs \.VPSidebar\s*\{[^}]*display:\s*none/,
    );
    expect(family).toMatch(
      /@media\s*\(min-width:\s*960px\)[\s\S]*?\.folio-docs \.VPSidebar\s*\{[^}]*position:\s*fixed/,
    );
    expect(family).not.toMatch(
      /@media\s*\(min-width:\s*960px\)[\s\S]*?\.folio-docs \.VPSidebar\s*\{[^}]*display:\s*flex/,
    );
    expect(family).toMatch(
      /@media\s*\(min-width:\s*1440px\)[\s\S]*?\.folio-docs \.VPSidebar[\s\S]*?padding-left:\s*16px/,
    );
    expect(family).toMatch(
      /@media\s*\(min-width:\s*960px\)[\s\S]*?\.folio-docs \.VPSidebar[\s\S]*?overflow-x:\s*visible/,
    );
    expect(family).toMatch(
      /\.folio-docs \.VPContent\.has-sidebar\s*\{[^}]*margin-inline:\s*auto\s*!important/,
    );
    expect(family).toMatch(
      /@media\s*\(min-width:\s*960px\)[\s\S]*?\.folio-docs \.VPContent\.has-sidebar[\s\S]*?padding-left:\s*var\(--vp-sidebar-width\)/,
    );
    expect(family).toMatch(
      /@media\s*\(min-width:\s*1440px\)[\s\S]*?\.folio-docs \.VPContent\.has-sidebar[\s\S]*?padding-right:\s*0/,
    );
    expect(family).toMatch(
      /html\.dark \.site-logo-light\s*\{[^}]*display:\s*none/,
    );
    expect(family).not.toMatch(/prefers-color-scheme/);
    expect(nav).not.toMatch(/prefers-color-scheme/);
  });

  it("site light/dark mode tokens + menu not clipped", () => {
    const mode = read(".vitepress/theme/site-mode.css");
    const modeTs = read(".vitepress/theme/siteMode.ts");
    const theme = read(".vitepress/theme/index.ts");
    const family = read(".vitepress/theme/family.css");
    const nav = read("components/SiteNav.vue");
    expect(mode).toMatch(/html\.dark/);
    expect(mode).toMatch(/html\.light/);
    expect(modeTs).toContain("markvis-site-mode");
    expect(modeTs).toContain("toggleSiteMode");
    expect(theme).toContain("./site-mode.css");
    expect(theme).toContain("initSiteMode");
    expect(nav).toContain("data-site-mode-toggle");
    expect(nav).toContain("home-nav-mode-sun");
    expect(nav).toContain('aria-label="Switch to light mode"');
    expect(modeTs).toContain("Switch to light mode");
    expect(modeTs).toContain("home-nav-mode-sun");
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
    expect(css).toMatch(/section\.preview[\s\S]*background:\s*var\(--bg\)/);
    expect(css).toMatch(/html\.light[\s\S]*--bg:\s*#f5f7fc/);
    expect(css).toMatch(/html\.dark[\s\S]*--bg:\s*#0b1020/);
    expect(css).toMatch(/html\.light[\s\S]*--accent:\s*#002fa7/);
    expect(css).not.toMatch(/section\.preview[\s\S]*background:\s*#f7f4ef/);
    expect(css).not.toMatch(/#2563eb/i);
    expect(css).not.toMatch(/#0e1312/i);
    expect(css).not.toMatch(/#edebe5/i);
    expect(css).not.toMatch(/#ffdb2a/i);
    expect(css).not.toMatch(/#c2410c/i);
    expect(css).not.toMatch(/#fb923c/i);
    expect(css).toMatch(/--editor-bg:\s*#eef1f8/);
    expect(css).toMatch(/font-size:\s*11px/);
    expect(css).toMatch(/text-transform:\s*uppercase/);
    expect(css).toMatch(/#svg-host svg[\s\S]*width:\s*100%/);
    expect(css).toMatch(/height:\s*48px/);
    expect(css).toMatch(/min-height:\s*44px/);
    expect(css).toMatch(/flex-wrap:\s*nowrap/);
    expect(css).toMatch(/overflow-x:\s*auto/);
    expect(css).toMatch(
      /@media\s*\(max-width:\s*768px\)[\s\S]*grid-template-columns:\s*1fr/,
    );
    expect(css).toMatch(/\.toolbar[\s\S]*flex-wrap:\s*nowrap/);
    expect(html).toContain('id="theme"');
    expect(html).toContain('id="palette"');
    expect(html).toMatch(/Color[\s\S]*id="palette"/);
    expect(html).toContain('value="folio"');
    expect(html).toContain('value="highcharts"');
    expect(html).toContain('value="shadcn"');
    expect(html).toContain('value="docs"');
    expect(html).toContain('value="ant"');
    expect(html).toContain('value="recharts"');
    const main = read("../playground/src/main.ts");
    expect(main).toContain("enhanceChartSvg");
    expect(main).toContain("@markvis/browser/enhance");
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toMatch(/\.markvis-tip/);
    const embed = read("components/PlayEmbed.vue");
    expect(embed).toContain('class="play-shell site-rail"');
    expect(embed).not.toMatch(/position\s*:\s*fixed/);
    const familyPlay = read(".vitepress/theme/family.css");
    const playShellRule = familyPlay.match(/\.play-shell\s*\{[^}]*\}/)?.[0] ?? "";
    expect(playShellRule).toMatch(
      /height:\s*calc\(100vh - var\(--site-nav-h\)\)/,
    );
    expect(playShellRule).not.toMatch(/position\s*:\s*fixed/);
    expect(playShellRule).not.toMatch(/inset\s*:\s*0/);
    expect(playShellRule).not.toMatch(/100vw/);
  });

  it("browser package exports enhanceChartSvg", () => {
    const idx = read("../../packages/browser/src/index.ts");
    const enhance = read("../../packages/browser/src/enhance.ts");
    expect(idx).toContain("enhanceChartSvg");
    expect(enhance).toContain("export function enhanceChartSvg");
    expect(enhance).toContain("prefers-reduced-motion");
  });

  it("docs family shares folio-docs chrome + linked routes", () => {
    const family = read(".vitepress/theme/family.css");
    const config = read(".vitepress/config.ts");
    const nav = read("components/SiteNav.vue");
    const foot = read("components/FamilyFoot.vue");
    const home = read("index.md");

    const pages = [
      "get-started.md",
      "docs.md",
      "integrate.md",
      "spec.md",
      "themes.md",
      "ai.md",
      "contributing-themes.md",
    ];
    for (const page of pages) {
      const md = read(page);
      expect(md, page).toMatch(/pageClass:\s*folio-docs/);
      expect(md, page).not.toMatch(/Vega-Lite|\bECharts\b|Observable Plot/i);
      expect(md.toLowerCase(), page).not.toContain(["mer", "maid"].join(""));
      expect(md, page).not.toMatch(/\bDocusaurus\b/);
    }

    expect(read("examples.md")).toMatch(/pageClass:\s*folio-examples/);
    expect(read("examples.md")).toContain("site-rail");
    expect(read("play.md")).toMatch(/pageClass:\s*folio-play/);

    expect(config).toContain('link: "/get-started"');
    expect(config).toContain('link: "/integrate"');
    expect(config).toContain('link: "/spec"');
    expect(config).toContain('link: "/themes"');
    expect(config).toContain('link: "/ai"');
    expect(config).toContain('link: "/contributing-themes"');
    expect(config).toContain('"/docs"');
    expect(config).toContain('link: "/play"');
    expect(config).toContain('link: "/examples"');

    expect(nav).toMatch(/href="\/get-started"[\s\S]*>Docs<\/a>/);
    expect(foot).toContain('href="/get-started">Docs');
    expect(home).toContain('href="/get-started">Docs');
    expect(nav).not.toContain('href="/spec">Docs');
    expect(foot).toContain("folio-home-page");

    expect(family).toMatch(
      /\.folio-docs \.vp-doc h1\s*\{[^}]*font-size:\s*32px/s,
    );
    expect(family).toMatch(
      /\.folio-docs \.vp-doc h2\s*\{[^}]*border-top:\s*1px\s+solid\s+var\(--site-border\)/s,
    );
    expect(family).toMatch(
      /\.folio-docs \.vp-doc div\[class\*=\"language-\"\][\s\S]*border-radius:\s*var\(--site-radius\)/,
    );
    expect(family).not.toMatch(/#2563eb/i);
    expect(family).toMatch(/\.folio-docs[\s\S]*--vp-nav-height:\s*var\(--site-nav-h\)/);

    const started = read("get-started.md");
    expect(started).toContain("Play");
    expect(started).toContain("Save a picture");
    expect(started).toContain("pnpm markvis bake");
    expect(started).toContain("Skill");
    expect(started).toContain("/llms.txt");

    const integrate = read("integrate.md");
    expect(integrate).toContain("pnpm markvis bake");
    expect(integrate).toContain("markvis.min.js");
    expect(integrate).toContain("markvis/markdown-it");
    expect(integrate).toContain("markvis/remark");

    const themes = read("themes.md");
    expect(themes).toMatch(/theme vs palette/i);
    expect(themes).toContain("second axis");
    expect(themes).toContain("Contributing themes");
    expect(themes).not.toMatch(/#[0-9A-Fa-f]{6}/);

    const ai = read("ai.md");
    expect(ai).toContain("/llms.txt");
    expect(ai).toContain("Emit **only** the fields");
    expect(ai).toContain("markvis.js.org/llms.txt");

    const llms = read("public/llms.txt");
    expect(llms).toMatch(/`palette`/i);
    expect(llms).toContain("E_UNKNOWN_PALETTE");
    expect(llms).toContain("ink");
    expect(llms).toContain("porcelain");
    expect(llms).toContain("warm");
    expect(llms).toContain("cool");
    expect(llms).toContain("vivid");
    expect(llms).toContain("Mar led Midtown box office at 9.2k tickets");
    expect(llms).toContain("Walk-up still leads member through week 12");
    expect(llms).toContain("MARTA takes the largest mode share");
    expect(llms).not.toContain("Feb led Q3 at 180");

    const spec = read("spec.md");
    expect(spec).toContain("E_UNKNOWN_THEME");
    expect(spec).toContain("E_UNKNOWN_PALETTE");
    expect(spec).toContain("palette");
    expect(spec).toContain("ink");
    expect(spec).toContain("porcelain");
    expect(spec).toContain("warm");
    expect(spec).toContain("cool");
    expect(spec).toContain("vivid");
    expect(spec).toContain("Grammar");
    expect(spec).toContain("bar");
    expect(spec).toContain("hist");

    const contrib = read("contributing-themes.md");
    expect(contrib).toContain("packages/themes/");
    expect(contrib).toContain("theme.ts");
    expect(contrib).toContain("registry.ts");
    expect(contrib).toContain("THEMES");

    const docsHub = read("docs.md");
    expect(docsHub).toContain("/get-started");
    expect(docsHub).toContain("location.replace");
  });
});
