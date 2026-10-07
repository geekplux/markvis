import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import * as ir from "@markvis/ir";
import { CHART_TYPES, PALETTES, THEMES } from "../src/catalog.js";

const here = dirname(fileURLToPath(import.meta.url));
const read = (rel: string) => readFileSync(join(here, rel), "utf8");

describe("the site's copies of the language lists", () => {
  it("match the IR, so filters and counts never fall behind", () => {
    expect([...CHART_TYPES]).toEqual([...ir.CHART_TYPES]);
    expect([...THEMES]).toEqual([...ir.THEMES]);
    expect([...PALETTES]).toEqual([...ir.PALETTES]);
  });

  it("counts types in the gallery subtitle instead of spelling a number", () => {
    const gallery = read("../components/Gallery.vue");
    expect(gallery).toContain("${CHART_TYPES.length} types");
    expect(gallery).not.toMatch(/\b(thirteen|fifteen|seventeen) types\b/);
  });

  it("shows themes side by side as figures, not as source", () => {
    const page = read("../themes.md");
    const strip = page.slice(page.indexOf("## Side by side"), page.indexOf("## How to add a pack"));
    expect(strip).toContain("<ThemeStrip");
    expect(strip.match(/```chart/g)?.length ?? 0).toBeLessThanOrEqual(1);
    expect(read("../.vitepress/theme/index.ts")).toContain('app.component("ThemeStrip", ThemeStrip)');
  });
});
