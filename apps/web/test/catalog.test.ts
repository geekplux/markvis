import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  catalogFromMaps,
  cardCounts,
  CHART_TYPES,
  coversTypeThemeMatrix,
  fenceForTheme,
  isStemSlugTitle,
  mapsFromGlobs,
  parseType,
  playHref,
  stemFromPath,
  THEMES,
  themeStemFromPath,
} from "../src/catalog.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const validDir = join(repoRoot, "examples/valid");
const outDir = join(repoRoot, "examples/out");
const themesDir = join(outDir, "themes");

function loadDiskMaps(): {
  markdownByStem: Record<string, string>;
  svgByStem: Record<string, string>;
  themedSvgByThemeStem: Record<
    "folio" | "highcharts" | "shadcn" | "docs",
    Record<string, string>
  >;
} {
  const markdownByStem: Record<string, string> = {};
  const svgByStem: Record<string, string> = {};
  const themedSvgByThemeStem = {
    folio: {},
    highcharts: {},
    shadcn: {},
    docs: {},
  } as Record<
    "folio" | "highcharts" | "shadcn" | "docs",
    Record<string, string>
  >;
  for (const name of readdirSync(validDir)) {
    if (!name.endsWith(".md")) {
      continue;
    }
    markdownByStem[name.replace(/\.md$/i, "")] = readFileSync(
      join(validDir, name),
      "utf8",
    );
  }
  for (const name of readdirSync(outDir)) {
    if (!name.endsWith(".svg")) {
      continue;
    }
    svgByStem[name.replace(/\.svg$/i, "")] = readFileSync(
      join(outDir, name),
      "utf8",
    );
  }
  for (const theme of THEMES) {
    const dir = join(themesDir, theme);
    for (const name of readdirSync(dir)) {
      if (!name.endsWith(".svg")) {
        continue;
      }
      themedSvgByThemeStem[theme][name.replace(/\.svg$/i, "")] = readFileSync(
        join(dir, name),
        "utf8",
      );
    }
  }
  return { markdownByStem, svgByStem, themedSvgByThemeStem };
}

describe("gallery catalog", () => {
  it("stems paths", () => {
    expect(stemFromPath("examples/valid/01-bar-basic.md")).toBe("01-bar-basic");
    expect(stemFromPath("examples/out/01-bar-basic.svg")).toBe("01-bar-basic");
    expect(themeStemFromPath("examples/out/themes/highcharts/01-bar-basic.svg")).toEqual(
      { theme: "highcharts", stem: "01-bar-basic" },
    );
  });

  it("reads type from fence and HTML comment", () => {
    expect(
      parseType("```chart\ntype: bar\n\nm,v\nA,1\n```"),
    ).toBe("bar");
    expect(
      parseType('<!-- chart: pie title="Share" -->\n| a | b |\n| --- | --- |\n| x | 1 |\n'),
    ).toBe("pie");
  });

  it("builds 52 items with themed SVGs and bans stem-slug titles", () => {
    const maps = loadDiskMaps();
    const catalog = catalogFromMaps(
      maps.markdownByStem,
      maps.svgByStem,
      maps.themedSvgByThemeStem,
    );
    expect(catalog.length).toBe(52);
    expect(catalog.length).toBeGreaterThanOrEqual(40);
    const types = new Set(catalog.map((item) => item.type));
    for (const type of CHART_TYPES) {
      expect(types.has(type)).toBe(true);
    }
    expect(catalog[0]?.id).toBe("01-bar-basic");
    expect(catalog[0]?.title).toBe("Feb led Q3 at 180");
    expect(catalog[0]?.title).not.toMatch(/Bar Chart/i);
    expect(isStemSlugTitle(catalog[0]!.title, catalog[0]!.id)).toBe(false);
    for (const item of catalog) {
      expect(isStemSlugTitle(item.title, item.id)).toBe(false);
      for (const theme of THEMES) {
        expect(item.svgsByTheme[theme]).toContain("<svg");
        expect(item.svgsByTheme[theme]).toContain(`<title`);
      }
      expect(item.svgsByTheme.highcharts).not.toBe(item.svgsByTheme.folio);
    }
    expect(coversTypeThemeMatrix(catalog)).toBe(true);
    const counts = cardCounts(catalog);
    expect(counts.byTheme.folio).toBe(52);
    expect(counts.byTheme.highcharts).toBe(52);
    expect(counts.byType.bar).toBeGreaterThanOrEqual(1);
    expect(() =>
      catalogFromMaps(maps.markdownByStem, {
        "01-bar-basic": maps.svgByStem["01-bar-basic"]!,
      }),
    ).toThrow(/missing examples\/out/);
  });

  it("maps globs the same way as Vite", () => {
    const mapped = mapsFromGlobs(
      {
        "/x/examples/valid/01-bar-basic.md":
          "```chart\ntype: bar\ntitle: T\n\na,b\n1,2\n```",
      },
      { "/x/examples/out/01-bar-basic.svg": "<svg><title>T</title></svg>" },
      {
        "/x/examples/out/themes/folio/01-bar-basic.svg":
          "<svg data-t=folio><title>T</title></svg>",
        "/x/examples/out/themes/highcharts/01-bar-basic.svg":
          "<svg data-t=highcharts><title>T</title></svg>",
        "/x/examples/out/themes/shadcn/01-bar-basic.svg":
          "<svg data-t=shadcn><title>T</title></svg>",
        "/x/examples/out/themes/docs/01-bar-basic.svg":
          "<svg data-t=docs><title>T</title></svg>",
      },
    );
    const catalog = catalogFromMaps(
      mapped.markdownByStem,
      mapped.svgByStem,
      mapped.themedSvgByThemeStem,
    );
    expect(catalog).toHaveLength(1);
    expect(catalog[0]?.svgsByTheme.highcharts).toContain("data-t=highcharts");
    expect(fenceForTheme(catalog[0]!.fence, "shadcn")).toContain("theme: shadcn");
    expect(playHref("01-bar-basic", "docs")).toBe(
      "/play?example=01-bar-basic&theme=docs",
    );
  });

  it("does not load invalid suite into the gallery maps", () => {
    const maps = loadDiskMaps();
    expect(Object.keys(maps.markdownByStem).some((k) => k.includes("invalid"))).toBe(
      false,
    );
  });
});
