/**
 * The README's chart picture is a site URL, because npmjs.com does not serve
 * a relative image (README.svg ships in the tarball, unreachable from the
 * package page). The site copy must be
 * the same bytes bake writes for the README block, so a renderer change that
 * makes bake.yml rewrite README.svg fails here until the site copy follows.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { bakeMarkdown } from "@markvis/cli";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

const IMAGE = "![Visits by day](https://markvis.js.org/home/visits-by-day.svg)";
const SITE_COPY = "apps/web/public/home/visits-by-day.svg";

describe("README chart picture", () => {
  it("follows the README block as a site URL npmjs.com can load", () => {
    const readme = read("README.md");
    const fenceEnd = readme.indexOf("```\n", readme.indexOf("```chart\n") + 1) + 4;
    expect(readme.slice(fenceEnd).startsWith(`${IMAGE}\n`)).toBe(true);
    expect(readme).not.toContain("](./README.svg)");
  });

  it("is the same bytes as README.svg, which bake writes", () => {
    expect(read(SITE_COPY)).toBe(read("README.svg"));
  });

  it("matches what bake renders for the README block today", () => {
    const baked = bakeMarkdown(read("README.md"), join(repoRoot, "README.md"));
    expect(baked.errors).toEqual([]);
    expect(baked.mdChanged).toBe(false);
    expect(baked.charts).toHaveLength(1);
    expect(baked.charts[0]!.svgRel).toBe("./README.svg");
    expect(baked.charts[0]!.svg.trimEnd()).toBe(read(SITE_COPY).trimEnd());
  });
});
