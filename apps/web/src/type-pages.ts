/**
 * One page per chart type, generated at build time from
 * packages/types/<type>/README.md, its examples/, and the type's row in
 * SPEC.md, so the pages cannot drift from the code. Node reads this
 * file directly (VitePress config and dynamic routes), so it reads text
 * only; the ChartBlock component draws the examples.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

/** The rows of SPEC.md's "Type semantics" table. */
function semanticsRows(): string[] {
  const spec = read("SPEC.md");
  const start = spec.indexOf("## Type semantics");
  const end = spec.indexOf("\n## ", start + 1);
  return spec.slice(start, end).split("\n").filter((row) => row.startsWith("| `"));
}

/** The types, in SPEC.md order (read from its Type semantics table). */
export const TYPE_IDS: readonly string[] = semanticsRows()
  .map((row) => row.match(/^\| `([a-z]+)` \|/)?.[1])
  .filter((type): type is string => type !== undefined);

/** The type's row of SPEC.md "Type semantics" as [x, y, series, rules]. */
export function specRow(type: string): string[] {
  const line = semanticsRows().find((row) => row.startsWith(`| \`${type}\` |`));
  if (!line) throw new Error(`SPEC.md has no Type semantics row for ${type}`);
  return line.split(/(?<!\\)\|/).slice(2, -1).map((cell) => cell.trim());
}

/** One card in the home page's type grid. */
export type TypeCard = {
  type: string;
  /** The "Use for" line of apps/web/types/index.md. */
  use: string;
  /** The chart block of `examples/valid/<stem>.md`: what the card draws and shows. */
  block: string;
  /** The first examples/valid/*.md of this type, in Play's numeric order. */
  stem: string;
  /** Play opened on that same file, so the card and Play show one chart. */
  play: string;
};

/** The "Use for" column of apps/web/types/index.md, by type. */
function useForLines(): Map<string, string> {
  const index = read("apps/web/types/index.md");
  const lines = new Map<string, string>();
  for (const m of index.matchAll(/^\| \[([a-z]+)\]\(\/types\/[a-z]+\) \| (.+?) \|$/gm)) {
    lines.set(m[1]!, m[2]!);
  }
  return lines;
}

const FENCE_RE = /^```(?:chart|markvis|vis)\n[\s\S]*?\n```$/m;

/** Per type, the first examples/valid/*.md (in Play's numeric order) written as a chart block. */
function firstExamples(): Map<string, { stem: string; block: string }> {
  const dir = join(repoRoot, "examples/valid");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
  const found = new Map<string, { stem: string; block: string }>();
  for (const name of files) {
    const block = readFileSync(join(dir, name), "utf8").match(FENCE_RE)?.[0];
    const type = block?.match(/^type:\s*([a-z]+)\s*$/m)?.[1];
    if (block && type && !found.has(type)) found.set(type, { stem: name.replace(/\.md$/, ""), block });
  }
  return found;
}

/** The home page's type grid: one card per type, in SPEC.md order. */
export function typeCards(): TypeCard[] {
  const use = useForLines();
  const examples = firstExamples();
  return TYPE_IDS.map((type) => {
    const example = examples.get(type);
    if (!example) throw new Error(`examples/valid has no chart block of type ${type}`);
    return {
      type,
      use: use.get(type) ?? "",
      block: example.block,
      stem: example.stem,
      play: `/play?example=${example.stem}`,
    };
  });
}

/** The block drawn by the ChartBlock component; the text goes in as a JS string literal. */
function figure(block: string): string {
  const literal = JSON.stringify(block).replace(/'/g, "\\u0027").replace(/&/g, "\\u0026");
  return `<ChartBlock :block='${literal}' />`;
}

/** Markdown for /types/<type>. */
export function typePage(type: string): string {
  const readme = read(`packages/types/${type}/README.md`).replace(/^# .*\n+/, "");
  const valid = read(`packages/types/${type}/examples/valid.md`).trim();
  const invalid = read(`packages/types/${type}/examples/invalid.md`).trim();
  const [x, y, series, rules] = specRow(type);
  return [
    `# ${type}`,
    "",
    readme.trim(),
    "",
    `**x** ${x} · **y** ${y} · **series** ${series}`,
    "",
    `**Rules.** ${rules}`,
    "",
    "## Example",
    "",
    valid,
    "",
    figure(valid),
    "",
    "## When the block is wrong",
    "",
    "The rows stay, with one line that names the error.",
    "",
    invalid,
    "",
    figure(invalid),
    "",
    `Generated from \`packages/types/${type}/\` and the type's row in \`SPEC.md\`.`,
    "",
  ].join("\n");
}
