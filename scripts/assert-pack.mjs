#!/usr/bin/env node
import { chmodSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const bin = join(dist, "cli.bin.js");

for (const rel of [
  "dist/index.js",
  "dist/index.d.ts",
  "dist/cli.bin.js",
  "dist/markvis.min.js",
]) {
  const path = join(root, rel);
  if (!existsSync(path)) {
    throw new Error(`missing ${rel}; run pnpm build`);
  }
}

const head = readFileSync(bin, "utf8").slice(0, 22);
if (!head.startsWith("#!/usr/bin/env node")) {
  throw new Error("dist/cli.bin.js must start with #!/usr/bin/env node");
}
chmodSync(bin, 0o755);
