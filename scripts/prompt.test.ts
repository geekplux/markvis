/**
 * docs/prompt.md holds the short model instruction. The same text opens
 * llms.txt (both copies) and sits on the site's AI page, and it may only
 * say what SPEC.md says.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHART_TYPES } from "@markvis/ir";
import { extractCharts, parseBlock } from "@markvis/parser";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

function instruction(): string {
  const match = read("docs/prompt.md").match(/^````text\n([\s\S]*?)\n````$/m);
  if (!match) throw new Error("docs/prompt.md has no ````text block");
  return match[1]!;
}

describe("model instruction", () => {
  const text = instruction();

  it("opens both llms.txt copies and sits on the AI page", () => {
    for (const rel of ["llms.txt", "apps/web/public/llms.txt"]) {
      expect(read(rel).startsWith(`# markvis\n\n${text}\n\n`), rel).toBe(true);
    }
    expect(read("apps/web/ai.md")).toContain(`\`\`\`\`text\n${text}\n\`\`\`\``);
    expect(read("skills/markvis/SKILL.md")).toContain("docs/prompt.md");
  });

  it("stays short: 250 tokens when measured, so at most 640 characters", () => {
    expect(text.length).toBeLessThanOrEqual(640);
  });

  it("shows a block that parses, and a comment form that parses above a table", () => {
    const fences = extractCharts(text).filter((c) => c.form === "fence");
    expect(fences).toHaveLength(1);
    expect(parseBlock(fences[0]!.raw).ok).toBe(true);
    const comment = text.match(/<!-- chart:[^>]*-->/)![0];
    const result = parseBlock(`${comment}\n| month | revenue |\n| --- | --- |\n| Jan | 120 |\n`);
    expect(result.ok).toBe(true);
  });

  it("lists every type, in SPEC order, and no other", () => {
    const line = text.match(/^Types: (.*)\.$/m)![1]!;
    expect(line.split(" ")).toEqual([...CHART_TYPES]);
  });

  it("names only real fields and encodings", () => {
    const fields = new Set(["type", "title", "unit", "x", "y", "series", "innerRadius", "layout"]);
    for (const m of text.matchAll(/\b([a-z][A-Za-z]*):(?=\s)/g)) {
      if (["Fields", "Types", "Donut", "Stacked", "Several", "chart"].includes(m[1]!)) continue;
      expect(fields.has(m[1]!), m[1]).toBe(true);
    }
    expect(text).not.toMatch(/type:\s*(donut|stacked)/);
  });
});
