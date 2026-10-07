#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function run(cmd, args, cwd = root) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} exited ${result.status ?? 1}`);
  }
}

/**
 * Pack the published tarball. `rebuild: false` packs the dist/ that is
 * already there (no prepack build), so tests that read dist/ in parallel
 * never see it wiped mid-run.
 */
export function packLib({ rebuild = true } = {}) {
  if (rebuild) {
    run("npm", ["pack", "--pack-destination", root]);
  } else {
    for (const file of ["dist/index.js", "dist/cli.bin.js"]) {
      if (!existsSync(join(root, file))) {
        throw new Error(`${file} missing; run pnpm build before packing without a rebuild`);
      }
    }
    run("npm", ["pack", "--ignore-scripts", "--pack-destination", root]);
  }
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  return join(root, `markvis-${pkg.version}.tgz`);
}

function isMain() {
  const self = fileURLToPath(import.meta.url);
  const argv1 = process.argv[1] ? resolve(process.argv[1]) : "";
  return argv1 !== "" && pathToFileURL(argv1).href === pathToFileURL(self).href;
}

if (isMain()) {
  try {
    packLib();
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  }
}
