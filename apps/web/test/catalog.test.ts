import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  catalogFromMaps,
  CHART_TYPES,
  mapsFromGlobs,
  parseType,
  stemFromPath,
} from "../src/catalog.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const validDir = join(repoRoot, "examples/valid");
const outDir = join(repoRoot, "examples/out");

function loadDiskMaps(): {
  markdownByStem: Record<string, string>;
  svgByStem: Record<string, string>;
} {
  const markdownByStem: Record<string, string> = {};
  const svgByStem: Record<string, string> = {};
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
  return { markdownByStem, svgByStem };
}

describe("gallery catalog", () => {
  it("stems paths", () => {
    expect(stemFromPath("examples/valid/01-bar-basic.md")).toBe("01-bar-basic");
    expect(stemFromPath("examples/out/01-bar-basic.svg")).toBe("01-bar-basic");
  });

  it("reads type from fence and HTML comment", () => {
    expect(
      parseType("```chart\ntype: bar\n\nm,v\nA,1\n```"),
    ).toBe("bar");
    expect(
      parseType('<!-- chart: pie title="Share" -->\n| a | b |\n| --- | --- |\n| x | 1 |\n'),
    ).toBe("pie");
  });

  it("builds 52 items from valid + out and fails without SVG", () => {
    const maps = loadDiskMaps();
    const catalog = catalogFromMaps(maps.markdownByStem, maps.svgByStem);
    expect(catalog.length).toBe(52);
    expect(catalog.length).toBeGreaterThanOrEqual(40);
    const types = new Set(catalog.map((item) => item.type));
    for (const type of CHART_TYPES) {
      expect(types.has(type)).toBe(true);
    }
    expect(catalog[0]?.id).toBe("01-bar-basic");
    expect(catalog[0]?.title).toBe("Feb led Q3 at 180");
    expect(catalog[0]?.title).not.toMatch(/Bar Chart/i);
    expect(() =>
      catalogFromMaps(maps.markdownByStem, { "01-bar-basic": maps.svgByStem["01-bar-basic"]! }),
    ).toThrow(/missing examples\/out/);
  });

  it("maps globs the same way as Vite", () => {
    const mapped = mapsFromGlobs(
      { "/x/examples/valid/01-bar-basic.md": "```chart\ntype: bar\ntitle: T\n\na,b\n1,2\n```" },
      { "/x/examples/out/01-bar-basic.svg": "<svg><title>T</title></svg>" },
    );
    const catalog = catalogFromMaps(mapped.markdownByStem, mapped.svgByStem);
    expect(catalog).toEqual([
      {
        id: "01-bar-basic",
        type: "bar",
        title: "T",
        fence: "```chart\ntype: bar\ntitle: T\n\na,b\n1,2\n```",
        svg: "<svg><title>T</title></svg>",
      },
    ]);
  });
});
