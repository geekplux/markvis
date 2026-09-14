import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const tsx = join(repoRoot, "node_modules/tsx/dist/cli.mjs");

const hosts = [
  ["vitepress", "examples/hosts/vitepress/render.mjs", "examples/hosts/vitepress/dist/index.html"],
  ["astro", "examples/hosts/astro/render.mjs", "examples/hosts/astro/dist/index.html"],
  [
    "markdown-it",
    "examples/hosts/markdown-it/render.mjs",
    "examples/hosts/markdown-it/dist/index.html",
  ],
] as const;

describe("examples/hosts", () => {
  it.each(hosts)("%s html contains svg and table", (name, script, out) => {
    const run = spawnSync(process.execPath, [tsx, script], {
      cwd: repoRoot,
      encoding: "utf8",
      env: process.env,
    });
    expect(run.status, `${name} stderr: ${run.stderr}\nstdout: ${run.stdout}`).toBe(0);
    const html = readFileSync(join(repoRoot, out), "utf8");
    expect(html).toContain("<svg");
    expect(html).toContain("</svg>");
    expect(html).toContain("<table");
    expect(html).toContain("</table>");
    expect(html).toContain("<figure");
  });
});
