import { readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

/** "9-…" before "10-…" before "100-…": numbered fixtures keep their order past 99. */
export function byNumberedName(a: string, b: string): number {
  return a.localeCompare(b, "en", { numeric: true });
}

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  "legacy",
  "dist",
  "coverage",
]);

export class CliError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CliError";
  }
}

export function displayPath(abs: string, cwd: string): string {
  const rel = relative(cwd, abs);
  if (rel === "" || rel.startsWith("..")) {
    return abs;
  }
  return rel;
}

export function collectMarkdownFiles(inputs: string[], cwd: string): string[] {
  if (inputs.length === 0) {
    throw new CliError("missing path");
  }
  const out: string[] = [];
  for (const input of inputs) {
    walk(resolve(cwd, input), out);
  }
  return [...new Set(out)].sort(byNumberedName);
}

export function collectSvgFiles(inputs: string[], cwd: string): string[] {
  if (inputs.length === 0) {
    throw new CliError("missing path");
  }
  const out: string[] = [];
  for (const input of inputs) {
    const abs = resolve(cwd, input);
    let st;
    try {
      st = statSync(abs);
    } catch {
      throw new CliError(`path not found: ${abs}`);
    }
    if (st.isFile()) {
      if (extname(abs).toLowerCase() !== ".svg") {
        throw new CliError(`not an svg file: ${abs}`);
      }
      out.push(abs);
      continue;
    }
    if (!st.isDirectory()) {
      throw new CliError(`not an svg file: ${abs}`);
    }
    const names = readdirSync(abs).sort(byNumberedName);
    for (const name of names) {
      if (name.startsWith(".")) {
        continue;
      }
      if (extname(name).toLowerCase() !== ".svg") {
        continue;
      }
      const child = join(abs, name);
      if (statSync(child).isFile()) {
        out.push(child);
      }
    }
  }
  return [...new Set(out)].sort(byNumberedName);
}

function walk(path: string, out: string[]): void {
  let st;
  try {
    st = statSync(path);
  } catch {
    throw new CliError(`path not found: ${path}`);
  }
  if (st.isFile()) {
    if (extname(path).toLowerCase() !== ".md") {
      throw new CliError(`not a markdown file: ${path}`);
    }
    out.push(path);
    return;
  }
  if (!st.isDirectory()) {
    throw new CliError(`not a markdown file: ${path}`);
  }
  const names = readdirSync(path).sort(byNumberedName);
  for (const name of names) {
    if (name.startsWith(".")) {
      continue;
    }
    if (SKIP_DIRS.has(name)) {
      continue;
    }
    const child = join(path, name);
    const childSt = statSync(child);
    if (childSt.isDirectory()) {
      walk(child, out);
    } else if (childSt.isFile() && extname(child).toLowerCase() === ".md") {
      out.push(child);
    }
  }
}
