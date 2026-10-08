/**
 * Generated chart-type pages and the integrations page: one page per
 * type, built from the type's own README, examples, and SPEC row; every
 * integration listed with a status.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHART_TYPES } from "@markvis/ir";
import { render } from "@markvis/html";
import { TYPE_IDS, specRow, typePage } from "../src/type-pages";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

describe("chart type pages", () => {
  it("cover every type, in SPEC order, and no other", () => {
    expect([...TYPE_IDS]).toEqual([...CHART_TYPES]);
  });

  for (const type of CHART_TYPES) {
    it(`/types/${type} is built from the type's README, examples, and SPEC row`, () => {
      const page = typePage(type);
      const readme = read(`packages/types/${type}/README.md`).replace(/^# .*\n+/, "");
      expect(page.startsWith(`# ${type}\n`)).toBe(true);
      expect(page).toContain(readme.split("\n")[0]!);
      expect(page).toContain(specRow(type)[3]!);
      const valid = read(`packages/types/${type}/examples/valid.md`).trim();
      const invalid = read(`packages/types/${type}/examples/invalid.md`).trim();
      expect(page).toContain(valid);
      expect(page).toContain(invalid);
      expect(render(valid).ok, `${type} valid example`).toBe(true);
      expect(render(invalid).ok, `${type} invalid example`).toBe(false);
      expect(page.match(/<ChartBlock :block='/g)).toHaveLength(2);
      expect(page).not.toMatch(/\{\{/);
    });
  }

  it("passes each block to ChartBlock as a JS string with no quote or entity left raw", () => {
    for (const type of CHART_TYPES) {
      for (const m of typePage(type).matchAll(/<ChartBlock :block='([^']*)' \/>/g)) {
        expect(m[1]).not.toContain("&");
        expect(typeof JSON.parse(m[1]!.replace(/\\u0027/g, "'").replace(/\\u0026/g, "&"))).toBe("string");
      }
    }
  });

  it("index links every type in order", () => {
    const links = [...read("apps/web/types/index.md").matchAll(/\]\(\/types\/([a-z]+)\)/g)].map((m) => m[1]);
    expect(links).toEqual([...CHART_TYPES]);
  });

  it("sit in the docs sidebar with Integrations", () => {
    const config = read("apps/web/.vitepress/config.ts");
    expect(config).toContain('{ text: "Integrations", link: "/integrations" }');
    expect(config).toContain('link: "/types/"');
    expect(config).toContain("TYPE_IDS.map");
  });
});

describe("integrations page", () => {
  const page = read("apps/web/integrations.md");
  const entries = [
    "Script tag in a page",
    "Script tag in a Markdown file",
    "JavaScript",
    "React",
    "react-markdown, streaming",
    "markdown-it and VitePress",
    "remark",
    "rehype, MDX, Astro",
    "Command line",
    "GitHub Action",
    "VS Code",
    "Model instruction",
    "Security",
  ];

  it("lists every way in, in order", () => {
    const headings = [...page.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(headings).toEqual(entries);
  });

  it("gives every integration a status", () => {
    const sections = page.split(/^## /m).slice(1, -1);
    for (const section of sections) {
      expect(section, section.split("\n")[0]).toMatch(/\*\*(Available now|2\.2|From source)\b/);
    }
  });

  it("keeps snippets short", () => {
    for (const m of page.matchAll(/```\w*\n([\s\S]*?)```/g)) {
      expect(m[1]!.trimEnd().split("\n").length, m[1]).toBeLessThanOrEqual(5);
    }
  });

  it("says what a block can and cannot carry", () => {
    expect(page).toContain("A chart block holds data only");
    expect(read("README.md")).toContain("**Safe by design.**");
  });
});
