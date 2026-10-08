/**
 * One page per chart type, generated at build time from
 * packages/types/<type>/README.md, its examples/, and the type's row in
 * SPEC.md, so the pages cannot drift from the code. Node reads this
 * file directly (VitePress config and dynamic routes), so it reads text
 * only; the ChartBlock component draws the examples.
 */
import { readFileSync } from "node:fs";
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
