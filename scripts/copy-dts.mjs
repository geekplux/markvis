#!/usr/bin/env node
import { copyFileSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fromDir = join(root, "scripts/dts");
const toDir = join(root, "dist");

mkdirSync(toDir, { recursive: true });
for (const name of readdirSync(fromDir)) {
  if (!name.endsWith(".d.ts")) {
    continue;
  }
  copyFileSync(join(fromDir, name), join(toDir, name));
}
