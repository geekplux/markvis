import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../src/cli.js";

/**
 * Measured 2026-09-04, Node v20.19.2, this workspace:
 *   parseMarkdown + renderSvg, 1000-row line CSV: ~5ms steady (15ms first)
 *   CLI check + render: ~5–11ms
 * Budget is 500ms (~40× cold CLI) so CI variance does not flake.
 */
const CHECK_RENDER_BUDGET_MS = 500;
const ROW_COUNT = 1000;

const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function thousandRowFence(): string {
  const rows = Array.from({ length: ROW_COUNT }, (_, i) => `${i + 1},${(i % 50) + 1}`);
  return [
    "```chart",
    "markvis: 2",
    "type: line",
    "title: Perf 1000",
    "x: i",
    "y: v",
    "",
    "i,v",
    ...rows,
    "```",
    "",
  ].join("\n");
}

describe("1000-row CSV check+render budget", () => {
  it("stays under the measured budget", () => {
    const dir = mkdtempSync(join(tmpdir(), "markvis-perf-"));
    tmpDirs.push(dir);
    const md = join(dir, "perf-1000.md");
    const outDir = join(dir, "out");
    mkdirSync(outDir);
    writeFileSync(md, thousandRowFence(), "utf8");

    const started = performance.now();
    let stdout = "";
    let stderr = "";
    const io = {
      cwd: dir,
      stdout: {
        write(chunk: string) {
          stdout += chunk;
        },
      },
      stderr: {
        write(chunk: string) {
          stderr += chunk;
        },
      },
    };
    const checkCode = runCli(["check", md], io);
    const renderCode = runCli(["render", md, "--out", outDir], io);
    const elapsed = performance.now() - started;

    expect(checkCode).toBe(0);
    expect(renderCode).toBe(0);
    expect(stdout).toContain("perf-1000.md\tline\t1000");
    expect(stdout).toContain("perf-1000.svg");
    expect(stderr).toContain("1 ok");
    expect(elapsed).toBeLessThan(CHECK_RENDER_BUDGET_MS);
  });
});
