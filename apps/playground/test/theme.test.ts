import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { THEMES } from "@markvis/ir";
import { themeTokens } from "@markvis/render-svg";
import { previewSource } from "../src/preview.js";
import {
  applyLook,
  readPaletteFromFence,
  readSurfaceFromFence,
  readThemeFromFence,
  rewritePaletteInFence,
  rewriteSurfaceInFence,
  rewriteThemeInFence,
} from "../src/theme.js";

const here = dirname(fileURLToPath(import.meta.url));
const valid01 = readFileSync(
  join(here, "../../../examples/valid/01-bar-basic.md"),
  "utf8",
);

describe("toolbar chrome", () => {
  it("selects and buttons are filled controls, not ghost chrome", () => {
    const css = readFileSync(join(here, "../src/style.css"), "utf8");
    expect(css).toMatch(
      /\.toolbar select[\s\S]*?background:\s*var\(--editor-bg\)/,
    );
    expect(css).toMatch(/\.toolbar button\.primary[\s\S]*?background:\s*var\(--accent\)/);
    expect(css).not.toMatch(
      /\.toolbar button,\s*\n\.toolbar a\.gallery-link \{\n(?:[^{}]*\n)*[^{}]*background:\s*transparent/,
    );
  });
});

describe("rewriteThemeInFence", () => {
  it("inserts theme when missing and re-renders", () => {
    expect(valid01).not.toMatch(/theme:/);
    const next = rewriteThemeInFence(valid01, "highcharts");
    expect(next).toMatch(/theme:\s*highcharts/);
    const view = previewSource(next, "01-bar-basic.md");
    expect(view.ok).toBe(true);
    expect(view.svg).toContain("<svg");
    expect(readThemeFromFence(next)).toBe("highcharts");
  });

  it("replaces an existing theme line", () => {
    const withDocs = rewriteThemeInFence(valid01, "docs");
    const withShadcn = rewriteThemeInFence(withDocs, "shadcn");
    expect(withShadcn.match(/theme:\s*\S+/g)).toHaveLength(1);
    expect(withShadcn).toMatch(/theme:\s*shadcn/);
    const view = previewSource(withShadcn, "01-bar-basic.md");
    expect(view.ok).toBe(true);
  });

  it("rewrites bare fence bodies", () => {
    const body = "type: bar\n\nmonth,revenue\nJan,1\n";
    const next = rewriteThemeInFence(body, "docs");
    expect(next).toMatch(/^theme: docs\n/);
  });
});

describe("rewritePaletteInFence", () => {
  it("inserts palette and re-renders with vivid fills", () => {
    const themed = rewriteThemeInFence(valid01, "folio");
    const next = rewritePaletteInFence(themed, "vivid");
    expect(next).toMatch(/palette:\s*vivid/);
    expect(readPaletteFromFence(next)).toBe("vivid");
    const view = previewSource(next, "01-bar-basic.md");
    expect(view.ok).toBe(true);
    expect(view.svg).toContain("#E11D48");
  });

  it("removes palette when set to null (theme default)", () => {
    const withPal = rewritePaletteInFence(valid01, "ink");
    expect(withPal).toMatch(/palette:\s*ink/);
    const cleared = rewritePaletteInFence(withPal, null);
    expect(cleared).not.toMatch(/palette:/);
    expect(readPaletteFromFence(cleared)).toBeNull();
  });

  it("keeps theme and palette as separate header lines", () => {
    let next = rewriteThemeInFence(valid01, "highcharts");
    next = rewritePaletteInFence(next, "ink");
    expect(next).toMatch(/theme:\s*highcharts/);
    expect(next).toMatch(/palette:\s*ink/);
    expect(next).not.toMatch(/theme:\s*highcharts\+ink/);
  });
});

describe("rewriteSurfaceInFence", () => {
  it("adds surface under the theme line and previews it", () => {
    const themed = rewriteThemeInFence(valid01, "shadcn");
    const next = rewriteSurfaceInFence(themed, "dark");
    expect(next).toMatch(/theme: shadcn\nsurface: dark/);
    expect(readSurfaceFromFence(next)).toBe("dark");
    const view = previewSource(next, "01-bar-basic.md");
    expect(view.ok).toBe(true);
    expect(view.svg).toContain('data-surface="dark"');
  });

  it("replaces an existing surface and removes it for light", () => {
    const dark = rewriteSurfaceInFence(valid01, "dark");
    const exported = rewriteSurfaceInFence(dark, "export");
    expect(exported.match(/surface:/g)).toHaveLength(1);
    expect(readSurfaceFromFence(exported)).toBe("export");
    const light = rewriteSurfaceInFence(exported, "light");
    expect(light).not.toContain("surface:");
    expect(readSurfaceFromFence(light)).toBe("light");
  });
});

describe("every example follows Theme, Color, and Surface", () => {
  const validDir = join(here, "../../../examples/valid");
  const sources = readdirSync(validDir)
    .filter((name) => name.endsWith(".md"))
    .map((name) => [name, readFileSync(join(validDir, name), "utf8")] as const);

  it.each(sources)("%s", (name, source) => {
    for (const theme of THEMES) {
      let next = rewriteThemeInFence(source, theme);
      next = rewritePaletteInFence(next, "warm");
      next = rewriteSurfaceInFence(next, "dark");
      expect(readThemeFromFence(next)).toBe(theme);
      expect(readSurfaceFromFence(next)).toBe("dark");
      const view = previewSource(next, name);
      expect(view.ok, `${name} ${theme}`).toBe(true);
      expect(view.svg).toContain('data-surface="dark"');
      expect(view.svg).toContain(`font-family="${themeFontAttr(theme)}"`);
    }
  });
});

function themeFontAttr(theme: (typeof THEMES)[number]): string {
  return themeTokens(theme).FONT.replace(/"/g, "&quot;");
}

describe("applyLook", () => {
  it("carries theme, color, and surface onto the next example", () => {
    const next = applyLook(valid01, { theme: "ant", palette: "vivid", surface: "dark" });
    expect(readThemeFromFence(next)).toBe("ant");
    expect(readPaletteFromFence(next)).toBe("vivid");
    expect(readSurfaceFromFence(next)).toBe("dark");
  });

  it("keeps the example's own fields when the toolbar says nothing", () => {
    const own = rewriteSurfaceInFence(valid01, "export");
    expect(readSurfaceFromFence(applyLook(own, {}))).toBe("export");
  });
});

describe("embedded toolbar", () => {
  it("drops the page heading inside the site so the controls fit", () => {
    const css = readFileSync(join(here, "../src/style.css"), "utf8");
    expect(css).toMatch(/\.embedded \.toolbar h1 \{\s*display: none;/);
    const main = readFileSync(join(here, "../src/main.ts"), "utf8");
    expect(main).toMatch(/window\.parent !== window\)\s*\{\s*document\.documentElement\.classList\.add\("embedded"\)/);
  });
});
