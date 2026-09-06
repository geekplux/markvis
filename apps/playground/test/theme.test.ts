import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { previewSource } from "../src/preview.js";
import { readThemeFromFence, rewriteThemeInFence } from "../src/theme.js";

const here = dirname(fileURLToPath(import.meta.url));
const valid01 = readFileSync(
  join(here, "../../../examples/valid/01-bar-basic.md"),
  "utf8",
);

describe("rewriteThemeInFence", () => {
  it("defaults omitted theme to folio", () => {
    expect(readThemeFromFence(valid01)).toBe("folio");
  });

  it("inserts theme after markvis and re-renders via previewSource", () => {
    const next = rewriteThemeInFence(valid01, "highcharts");
    expect(next).toContain("theme: highcharts");
    expect(readThemeFromFence(next)).toBe("highcharts");
    const view = previewSource(next, "01-bar-basic.md");
    expect(view.ok).toBe(true);
    expect(view.svg).toContain("data-markvis");
    // highcharts ink differs from folio
    expect(view.svg).toContain("#333333");
  });

  it("replaces an existing theme header", () => {
    const withDocs = rewriteThemeInFence(valid01, "docs");
    const withShadcn = rewriteThemeInFence(withDocs, "shadcn");
    expect(withShadcn.match(/theme:/g)?.length).toBe(1);
    expect(readThemeFromFence(withShadcn)).toBe("shadcn");
    const view = previewSource(withShadcn, "01-bar-basic.md");
    expect(view.ok).toBe(true);
    expect(view.svg).toContain("#0A0A0A");
  });

  it("rewrites bare fence bodies", () => {
    const body = "markvis: 2\ntype: bar\ntitle: t\nx: a\ny: b\n\na,b\nx,1\n";
    const next = rewriteThemeInFence(body, "docs");
    expect(next.startsWith("markvis: 2\ntheme: docs\n")).toBe(true);
  });
});
