import { spawnSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { packLib } from "./pack-lib.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const TIMEOUT = 180_000;
const TGZ_NAME = "markvis-2.0.0.tgz";

function consumerEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.NODE_PATH;
  delete env.NODE_OPTIONS;
  return env;
}

function run(
  cwd: string,
  cmd: string,
  args: string[],
): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    env: consumerEnv(),
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("packed consumer", { timeout: TIMEOUT }, () => {
  let temp = "";
  let tgz = "";

  beforeAll(() => {
    tgz = packLib();
    temp = mkdtempSync(join(tmpdir(), "markvis-consumer-"));
    const init = run(temp, "npm", ["init", "-y"]);
    expect(init.status, init.stderr).toBe(0);
    const install = run(temp, "npm", ["install", tgz]);
    expect(install.status, `${install.stdout}\n${install.stderr}`).toBe(0);
    cpSync(
      join(repoRoot, "examples/valid/01-bar-basic.md"),
      join(temp, "valid.md"),
    );
    cpSync(
      join(repoRoot, "examples/invalid/01-unknown-type.md"),
      join(temp, "invalid.md"),
    );
  }, TIMEOUT);

  afterAll(() => {
    if (temp) {
      rmSync(temp, { recursive: true, force: true });
    }
  });

  it("packs markvis-2.0.0.tgz without workspace protocol", () => {
    expect(tgz).toBe(join(repoRoot, TGZ_NAME));
    expect(existsSync(tgz)).toBe(true);
    const listed = run(repoRoot, "tar", ["-tzf", tgz]);
    expect(listed.status).toBe(0);
    expect(listed.stdout).toContain("package/dist/index.js");
    expect(listed.stdout).toContain("package/dist/cli.bin.js");
    expect(listed.stdout).toContain("package/dist/markvis.min.js");
    expect(listed.stdout).not.toMatch(/(^|\n)package\/index\.js(\n|$)/);
    expect(listed.stdout).not.toContain("package/src/");
    const binHead = run(repoRoot, "tar", [
      "-xOf",
      tgz,
      "package/dist/cli.bin.js",
    ]);
    expect(binHead.status).toBe(0);
    expect(binHead.stdout.startsWith("#!/usr/bin/env node")).toBe(true);
    const manifestRaw = run(repoRoot, "tar", [
      "-xOf",
      tgz,
      "package/package.json",
    ]);
    expect(manifestRaw.status).toBe(0);
    expect(manifestRaw.stdout).not.toContain("export {}");
    const runtimeBlob = JSON.stringify({
      ...(JSON.parse(manifestRaw.stdout) as { dependencies?: object })
        .dependencies,
    });
    expect(runtimeBlob).not.toContain("workspace:");
    const man = JSON.parse(manifestRaw.stdout) as {
      name: string;
      version: string;
      private?: boolean;
      main: string;
      bin?: { markvis?: string };
    };
    expect(man.name).toBe("markvis");
    expect(man.version).toBe("2.0.0");
    expect(man.private).not.toBe(true);
    expect(man.main).toBe("./dist/index.js");
    expect(String(man.bin?.markvis ?? "").replace(/^\.\//, "")).toBe(
      "dist/cli.bin.js",
    );
  });

  it("imports parseMarkdown and renderSvg from markvis", () => {
    writeFileSync(
      join(temp, "parse.mjs"),
      `import { readFileSync } from "node:fs";
import { parseMarkdown, renderSvg } from "markvis";

const source = readFileSync(process.argv[2], "utf8");
const parsed = parseMarkdown(source, { filename: process.argv[2] });
if (parsed.ok) {
  const svg = renderSvg(parsed.chart);
  process.stdout.write(JSON.stringify({ ok: true, svg }));
} else {
  process.stdout.write(JSON.stringify({
    ok: false,
    code: parsed.error.code,
    table: parsed.table,
  }));
}
`,
    );
    const valid = run(temp, process.execPath, ["parse.mjs", "valid.md"]);
    expect(valid.status, valid.stderr).toBe(0);
    const parsed = JSON.parse(valid.stdout) as {
      ok: boolean;
      svg?: string;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.svg).toContain("<svg");
    expect(parsed.svg).toContain("Sep");
    expect(parsed.svg).toContain("9200");
    expect(parsed.svg).toContain("Mar");

    const invalid = run(temp, process.execPath, ["parse.mjs", "invalid.md"]);
    expect(invalid.status, invalid.stderr).toBe(0);
    const failed = JSON.parse(invalid.stdout) as {
      ok: boolean;
      code?: string;
      table?: { rows: string[][] };
    };
    expect(failed.ok).toBe(false);
    expect(failed.code).toBe("E_UNKNOWN_TYPE");
    expect(failed.table?.rows).toEqual([
      ["A", "1"],
      ["B", "2"],
    ]);
  });

  it("renders markdown-it from markvis/markdown-it", () => {
    const installMd = run(temp, "npm", ["install", "markdown-it"]);
    expect(installMd.status, installMd.stderr).toBe(0);
    writeFileSync(
      join(temp, "mdit.mjs"),
      `import { readFileSync } from "node:fs";
import MarkdownIt from "markdown-it";
import markdownItMarkvis from "markvis/markdown-it";

const md = new MarkdownIt({ html: true }).use(markdownItMarkvis);
process.stdout.write(md.render(readFileSync(process.argv[2], "utf8")));
`,
    );
    const valid = run(temp, process.execPath, ["mdit.mjs", "valid.md"]);
    expect(valid.status, valid.stderr).toBe(0);
    expect(valid.stdout).toContain("<svg");
    expect(valid.stdout).toContain("<table");
    expect(valid.stdout).toContain("9200");

    const invalid = run(temp, process.execPath, ["mdit.mjs", "invalid.md"]);
    expect(invalid.status, invalid.stderr).toBe(0);
    expect(invalid.stdout).toContain("<table");
    expect(invalid.stdout).toMatch(/>A</);
    expect(invalid.stdout).toMatch(/>B</);
    expect(invalid.stdout).toMatch(/E_UNKNOWN_TYPE/);
    expect(invalid.stdout.trim().length).toBeGreaterThan(0);
  }, TIMEOUT);

  it("runs npx markvis check and bake", () => {
    const version = run(temp, "npx", ["--no-install", "markvis", "-v"]);
    expect(version.status, version.stderr).toBe(0);
    expect(version.stdout.trim()).toBe("2.0.0");

    const valid = run(temp, "npx", ["--no-install", "markvis", "check", "valid.md"]);
    expect(valid.status, valid.stderr).toBe(0);

    const invalid = run(temp, "npx", [
      "--no-install",
      "markvis",
      "check",
      "invalid.md",
    ]);
    expect(invalid.status).not.toBe(0);

    cpSync(join(temp, "valid.md"), join(temp, "bake.md"));
    const bake = run(temp, "npx", ["--no-install", "markvis", "bake", "bake.md"]);
    expect(bake.status, bake.stderr).toBe(0);
    const svg = readFileSync(join(temp, "bake.svg"), "utf8");
    expect(svg).toContain("9200");
    const mdOnce = readFileSync(join(temp, "bake.md"));
    expect(mdOnce.toString("utf8")).toContain("```chart");
    const bakeAgain = run(temp, "npx", [
      "--no-install",
      "markvis",
      "bake",
      "bake.md",
    ]);
    expect(bakeAgain.status, bakeAgain.stderr).toBe(0);
    const mdTwice = readFileSync(join(temp, "bake.md"));
    expect(Buffer.compare(mdOnce, mdTwice)).toBe(0);
  }, TIMEOUT);
});
