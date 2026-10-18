/**
 * Size and latency budgets. The sizes read the built dist/ (skipped when
 * the directory is absent); the timings call `render()` from @markvis/html
 * directly. They exist to catch a dependency that bloats a bundle or a
 * layout that goes quadratic. The timing budgets sit far above today's
 * numbers; the size budgets sit a few KiB above them, so growth is a
 * decision someone makes in review.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { render } from "@markvis/html";
import { extractCharts } from "@markvis/parser";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
// Budgets and printed sizes are in KiB (1024 bytes), gzip at the default level.
const KB = 1024;

const SIZE_BUDGETS: Array<[file: string, gzipBytes: number]> = [
  ["markvis.min.js", 64 * KB],
  // The ES module keeps its whitespace (a library build), so it runs larger
  // than the minified script: 65.8 KiB gzip when this budget was set.
  ["markvis.mjs", 72 * KB],
  // Unminified, and step 1b adds host-mode emission: 79.5 KiB when set.
  ["index.js", 96 * KB],
];

// Skip only when nothing is built; a missing bundle in a built dist/ fails.
const hasDist = existsSync(dist);

describe.skipIf(!hasDist)("bundle size budgets (gzip)", () => {
  it.each(SIZE_BUDGETS)("dist/%s stays within budget", (file, budget) => {
    expect(existsSync(join(dist, file)), `dist/${file} is missing`).toBe(true);
    const raw = readFileSync(join(dist, file));
    const gz = gzipSync(raw).length;
    // Printed so the CI log keeps the size quoted in the docs honest.
    console.log(
      `budget: dist/${file} ${(raw.length / KB).toFixed(1)} KiB raw, ${(gz / KB).toFixed(1)} KiB gzip (${gz} bytes; budget ${budget / KB} KiB)`,
    );
    expect(gz).toBeLessThanOrEqual(budget);
  });
});

describe.skipIf(!hasDist)("client directive", () => {
  // tsup's tree-shake pass drops module-level directives, so the react entry
  // builds without it; this fails if that setting is lost.
  it('only dist/react.js starts with "use client"', () => {
    expect(readFileSync(join(dist, "react.js"), "utf8").startsWith('"use client";')).toBe(true);
    const others = readdirSync(dist)
      .filter((name) => name.endsWith(".js") && name !== "react.js")
      .filter((name) => readFileSync(join(dist, name), "utf8").includes("use client"));
    expect(others).toEqual([]);
  });
});

function exampleBlocks(): string[] {
  const dir = join(root, "examples/valid");
  const blocks: string[] = [];
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".md")).sort()) {
    for (const chart of extractCharts(readFileSync(join(dir, name), "utf8"))) {
      blocks.push(chart.raw);
    }
  }
  return blocks;
}

function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)]!;
}

// Other test files run in parallel workers, so a single measurement can land
// on a busy core: every timing keeps the fastest of three runs.
describe("render latency budgets", () => {
  it("p95 of render() over every valid example (fastest of 3 runs each) is at most 2 ms", () => {
    const blocks = exampleBlocks();
    expect(blocks.length).toBeGreaterThan(0);
    const times: number[] = [];
    for (const block of blocks) {
      expect(render(block).ok, block).toBe(true);
      let ms = Infinity;
      for (let run = 0; run < 3; run++) {
        const start = performance.now();
        render(block);
        ms = Math.min(ms, performance.now() - start);
      }
      times.push(ms);
    }
    const p95 = percentile(times, 95);
    console.log(
      `budget: render() p95 ${p95.toFixed(3)} ms, max ${Math.max(...times).toFixed(3)} ms over ${times.length} blocks (fastest of 3 each)`,
    );
    expect(p95).toBeLessThanOrEqual(2);
  });

  it("draws a 10,000-row line chart within 200 ms", () => {
    const rows = Array.from({ length: 10_000 }, (_, i) => `${i},${Math.round(Math.sin(i / 50) * 1000 + i)}`);
    const block = `type: line\ntitle: Ten thousand rows\nx: t\ny: v\n\nt,v\n${rows.join("\n")}\n`;
    expect(render(block).ok).toBe(true);
    let ms = Infinity;
    for (let run = 0; run < 3; run++) {
      const start = performance.now();
      render(block);
      ms = Math.min(ms, performance.now() - start);
    }
    console.log(`budget: 10,000-row line render() ${ms.toFixed(1)} ms (fastest of 3)`);
    expect(ms).toBeLessThanOrEqual(200);
  });
});

describe("values across the whole double range finish quickly", () => {
  const cases: Array<[string, string]> = [
    ["bar", "type: bar\nx: x\ny: y\n\nx,y\nA,-1e308\nB,1e308\nC,0\nD,1\nE,2"],
    ["line", "type: line\nx: x\ny: y\n\nx,y\nA,-1e308\nB,1e308\nC,0"],
    ["scatter", "type: scatter\nx: x\ny: y\n\nx,y\n-1e308,-1e308\n1e308,1e308\n0,0"],
    ["hist", "type: hist\nx: y\ny: y\n\nx,y\nA,-1e308\nB,1e308\nC,0\nD,1\nE,2"],
    ["dumbbell", "type: dumbbell\nx: x\ny: y\nseries: s\n\nx,y,s\nA,-1e308,p\nA,1e308,q"],
    ["bullet", "type: bullet\nx: x\ny: y\n\nx,y\nA,-1e308\nB,1e308\nC,0\nD,1\nE,2"],
    ["boxplot", "type: boxplot\nx: x\ny: y\n\nx,y\nA,-1e308\nB,1e308\nC,0\nD,1\nE,2"],
    ["waterfall", "type: waterfall\nx: x\ny: y\n\nx,y\nA,1e308\nB,-1e308\nC,1e308"],
  ];

  it.each(cases)("%s with ±1e308 returns without throwing", { timeout: 2000 }, (_type, block) => {
    const result = render(block);
    expect(typeof result.html).toBe("string");
    expect(result.html.length).toBeGreaterThan(0);
  });
});
