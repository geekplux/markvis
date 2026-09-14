#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = join(root, "packages/browser/dist");
const toDir = join(root, "dist");
const files = ["markvis.min.js", "markvis.mjs"];

mkdirSync(toDir, { recursive: true });
for (const name of files) {
  const from = join(fromDir, name);
  if (!existsSync(from)) {
    throw new Error(`missing browser bundle ${from}; run @markvis/browser build`);
  }
  copyFileSync(from, join(toDir, name));
}
