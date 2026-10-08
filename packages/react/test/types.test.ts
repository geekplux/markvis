/**
 * The hand-written markvis/react declarations must fit react-markdown's
 * `components` and `remarkPlugins`, with and without exact optional types.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const tsc = join(repoRoot, "node_modules/.bin/tsc");

function compile(project: string): { status: number | null; output: string } {
  const result = spawnSync(tsc, ["-p", project], { cwd: repoRoot, encoding: "utf8" });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe("react.d.ts", { timeout: 60_000 }, () => {
  it("compiles real usage under the repo's strict settings", () => {
    const result = compile(join(here, "types/tsconfig.json"));
    expect(result.output).toBe("");
    expect(result.status).toBe(0);
  });

  it("compiles without exactOptionalPropertyTypes", () => {
    const dir = mkdtempSync(join(tmpdir(), "markvis-react-types-"));
    try {
      const project = join(dir, "tsconfig.json");
      writeFileSync(
        project,
        JSON.stringify({
          extends: join(here, "types/tsconfig.json"),
          compilerOptions: { exactOptionalPropertyTypes: false },
          include: [join(here, "types/use.ts")],
        }),
      );
      const result = compile(project);
      expect(result.output).toBe("");
      expect(result.status).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
