/**
 * The numbers line on the home page and in the README is written by hand.
 * Its gzip size must stay within 10 % of the real drop-in bundle, so the
 * number cannot drift after a release. The size check needs `pnpm build`
 * (dist/markvis.min.js) and skips without it.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");
const bundle = join(repoRoot, "dist/markvis.min.js");

const NUMBERS = /^(?:\s*<p class="home-numbers">)?(\d+) kB gzip · 0 dependencies · under 1 ms a chart · plain SVG(?:<\/p>)?$/m;

function statedKb(rel: string): number {
  const match = read(rel).match(NUMBERS);
  expect(match, `${rel} has the numbers line`).not.toBeNull();
  return Number(match![1]);
}

describe("numbers line", () => {
  it("reads the same on the home page and in the README", () => {
    expect(read("apps/web/index.md")).toContain(
      '<p class="home-numbers">58 kB gzip · 0 dependencies · under 1 ms a chart · plain SVG</p>',
    );
    expect(statedKb("README.md")).toBe(statedKb("apps/web/index.md"));
  });

  it("claims 0 dependencies, and the package has none", () => {
    const pkg = JSON.parse(read("package.json")) as { dependencies?: Record<string, string> };
    expect(Object.keys(pkg.dependencies ?? {})).toEqual([]);
  });

  it.skipIf(!existsSync(bundle))("states the drop-in's gzip size within 10 %", () => {
    const actual = gzipSync(readFileSync(bundle)).length;
    const stated = statedKb("apps/web/index.md") * 1000;
    expect(Math.abs(stated - actual) / actual, `stated ${stated} B, gzip ${actual} B`).toBeLessThanOrEqual(0.1);
  });
});
