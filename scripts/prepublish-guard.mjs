#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function fail(message) {
  console.error(`prepublish: ${message}`);
  process.exit(1);
}

const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: root,
  encoding: "utf8",
});
if (status.status !== 0) {
  fail("git status failed");
}
if (status.stdout.trim() !== "") {
  fail("git tree is dirty; commit first, then npm publish from a clean root");
}

const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.private === true) {
  fail("root package.json private must be false");
}
if (typeof pkg.version !== "string" || !pkg.version.startsWith("2.")) {
  fail(`root version must be 2.x, got ${pkg.version}`);
}
const bin = String(pkg.bin?.markvis ?? "").replace(/^\.\//, "");
if (bin !== "dist/cli.bin.js") {
  fail("bin.markvis must be dist/cli.bin.js");
}
if (pkg.publishConfig?.access !== "public") {
  fail("publishConfig.access must be public");
}
if (!Array.isArray(pkg.keywords) || pkg.keywords.length === 0) {
  fail("package.json keywords must be a non-empty array");
}

const cli = readFileSync(join(root, "packages/cli/src/cli.ts"), "utf8");
if (!cli.includes(`export const VERSION = "${pkg.version}"`)) {
  fail(`CLI VERSION must match package.json ${pkg.version}`);
}

for (const top of ["packages", "apps"]) {
  const dir = join(root, top);
  for (const name of readdirSync(dir)) {
    const path = join(dir, name, "package.json");
    if (!existsSync(path)) {
      continue;
    }
    const child = JSON.parse(readFileSync(path, "utf8"));
    if (child.private !== true) {
      fail(`${top}/${name} must stay private`);
    }
  }
}
