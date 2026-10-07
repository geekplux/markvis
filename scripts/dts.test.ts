/**
 * The published .d.ts files are written by hand (scripts/dts). They must
 * keep up with the code, or TypeScript users see a different API than the
 * one that runs: every runtime export declared, every literal list equal.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENTRIES = ["index", "parser", "render-svg", "ir", "remark", "markdown-it", "themes", "cli"];

function dts(name: string): string {
  return readFileSync(join(root, "scripts/dts", `${name}.d.ts`), "utf8");
}

/** Names a .d.ts exports, following `export * from "./x.js"`. */
function declaredNames(name: string, seen = new Set<string>()): Set<string> {
  if (seen.has(name)) return new Set();
  seen.add(name);
  const text = dts(name);
  const names = new Set<string>();
  for (const m of text.matchAll(/export\s+(?:declare\s+)?(?:const|let|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) {
    names.add(m[1]!);
  }
  for (const m of text.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g)) {
    for (const part of m[1]!.split(",")) {
      const alias = part.trim().split(/\s+as\s+/).pop()?.replace(/^type\s+/, "").trim();
      if (alias) names.add(alias);
    }
  }
  for (const m of text.matchAll(/export\s+\*\s+from\s+["']\.\/([\w-]+)(?:\.js)?["']/g)) {
    for (const inner of declaredNames(m[1]!, seen)) names.add(inner);
  }
  return names;
}

/** A `NAME: readonly [ "a", "b" ]` tuple declared anywhere in the shipped types. */
function declaredTuple(constName: string): string[] | undefined {
  for (const name of ENTRIES) {
    const m = dts(name).match(new RegExp(`${constName}\\s*:\\s*readonly\\s*\\[([^\\]]*)\\]`));
    if (m) return [...m[1]!.matchAll(/"([^"]+)"/g)].map((s) => s[1]!);
  }
  return undefined;
}

describe("shipped type declarations", () => {
  it.each(ENTRIES)("dist/%s.d.ts declares every runtime export", async (name) => {
    const runtime = await import(join(root, "src", `${name}.ts`));
    const declared = declaredNames(name);
    const missing = Object.keys(runtime).filter((key) => key !== "default" && !declared.has(key));
    expect(missing, `${name}.d.ts is missing exports`).toEqual([]);
  });

  it("declares the same literal lists the code uses", async () => {
    const ir = await import("@markvis/ir");
    const parser = await import("@markvis/parser");
    expect(declaredTuple("CHART_TYPES")).toEqual([...ir.CHART_TYPES]);
    expect(declaredTuple("THEMES")).toEqual([...ir.THEMES]);
    expect(declaredTuple("PALETTES")).toEqual([...ir.PALETTES]);
    expect(declaredTuple("ERROR_CODES")).toEqual([...parser.ERROR_CODES]);
  });
});
