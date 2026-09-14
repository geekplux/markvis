#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const DEP_FIELDS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
];

export function publishManifest(pkg) {
  const out = structuredClone(pkg);
  delete out.scripts;
  delete out.devDependencies;
  delete out.packageManager;
  delete out.pnpm;
  for (const field of DEP_FIELDS) {
    const deps = out[field];
    if (!deps || typeof deps !== "object") {
      continue;
    }
    for (const [name, ver] of Object.entries(deps)) {
      if (String(ver).startsWith("workspace:") || name.startsWith("@markvis/")) {
        delete deps[name];
      }
    }
    if (Object.keys(deps).length === 0) {
      delete out[field];
    }
  }
  return out;
}

function run(cmd, args, cwd = root) {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} exited ${result.status ?? 1}`);
  }
}

export function packLib({ build = true } = {}) {
  if (build) {
    run("pnpm", ["build"]);
  }
  const staging = join(root, ".pack");
  rmSync(staging, { recursive: true, force: true });
  mkdirSync(join(staging, "dist"), { recursive: true });
  cpSync(join(root, "dist"), join(staging, "dist"), { recursive: true });
  copyFileSync(join(root, "README.md"), join(staging, "README.md"));
  copyFileSync(join(root, "LICENSE"), join(staging, "LICENSE"));
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
  const manifest = publishManifest(pkg);
  writeFileSync(
    join(staging, "package.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  run("npm", ["pack", "--pack-destination", root], staging);
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
