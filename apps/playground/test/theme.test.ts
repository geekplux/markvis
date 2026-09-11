import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { previewSource } from "../src/preview.js";
import {
  readPaletteFromFence,
  readThemeFromFence,
  rewritePaletteInFence,
  rewriteThemeInFence,
} from "../src/theme.js";

const here = dirname(fileURLToPath(import.meta.url));
const valid01 = readFileSync(
  join(here, "../../../examples/valid/01-bar-basic.md"),
  "utf8",
);

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
