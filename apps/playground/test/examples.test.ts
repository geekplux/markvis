import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  catalogFromModules,
  EXAMPLES,
  filenameFromPath,
} from "../src/examples.js";
import { previewSource } from "../src/preview.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const validDir = join(repoRoot, "examples/valid");

const validFiles = readdirSync(validDir)
  .filter((name) => name.endsWith(".md"))
  .sort();

describe("example catalog", () => {
  it("parses filenames from glob paths", () => {
    expect(filenameFromPath("/repo/examples/valid/01-bar-basic.md")).toBe(
      "01-bar-basic.md",
    );
    expect(filenameFromPath("01-bar-basic.md")).toBe("01-bar-basic.md");
  });

  it("sorts and ids modules as example files", () => {
    const catalog = catalogFromModules({
      "/x/02-line-multi.md": "b",
      "/x/01-bar-basic.md": "a",
    });
    expect(catalog.map((item) => item.filename)).toEqual([
      "01-bar-basic.md",
      "02-line-multi.md",
    ]);
    expect(catalog[0]?.id).toBe("01-bar-basic");
  });

  it("binds EXAMPLES to every examples/valid markdown file", () => {
    expect(EXAMPLES.length).toBe(validFiles.length);
    expect(EXAMPLES.length).toBeGreaterThanOrEqual(50);
    expect(EXAMPLES.map((item) => item.filename)).toEqual(validFiles);
    const first = EXAMPLES[0];
    expect(first?.filename).toBe("01-bar-basic.md");
    expect(first?.source).toBe(
      readFileSync(join(validDir, "01-bar-basic.md"), "utf8"),
    );
  });

  it("loads a switcher example into a renderable fence", () => {
    const picked = EXAMPLES.find((item) => item.filename === "05-pie-raw.md");
    expect(picked).toBeDefined();
    if (!picked) {
      return;
    }
    const view = previewSource(picked.source, picked.filename);
    expect(view.ok).toBe(true);
    expect(view.svg).toContain('data-chart-type="pie"');
  });
});
