import { readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";

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
  return [...new Set(out)].sort();
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
  const names = readdirSync(path).sort();
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
