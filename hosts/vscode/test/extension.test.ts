/**
 * The VS Code preview extension: it renders through the published
 * `markvis/markdown-it` entry, its bundle carries one copy of the renderer,
 * its manifest is ready to package, and its `markvis` range admits the
 * version this repository releases.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import MarkdownIt from "markdown-it";
import { CSS_VARIABLES } from "@markvis/themes";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { activate } from "../src/extension.ts";

const here = dirname(fileURLToPath(import.meta.url));
const extensionDir = join(here, "..");
const repoRoot = join(extensionDir, "../..");

const readJson = (path: string) => JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
const manifest = readJson(join(extensionDir, "package.json")) as {
  name: string;
  private?: boolean;
  description: string;
  icon: string;
  main: string;
  engines: { vscode: string };
  repository: { url: string; directory: string };
  keywords: string[];
  contributes: Record<string, unknown>;
  scripts: { compile: string };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const rootVersion = (readJson(join(repoRoot, "package.json")) as { version: string }).version;

const valid01 = readFileSync(join(repoRoot, "examples/valid/01-bar-basic.md"), "utf8");
const valid02 = readFileSync(join(repoRoot, "examples/valid/02-line-multi.md"), "utf8");
const valid08 = readFileSync(join(repoRoot, "examples/valid/08-bar-comment.md"), "utf8");
const invalid01 = readFileSync(join(repoRoot, "examples/invalid/01-unknown-type.md"), "utf8");

type Extension = { extendMarkdownIt: (md: MarkdownIt) => MarkdownIt };

/** The preview calls extendMarkdownIt on its own MarkdownIt with html enabled. */
function preview(extension: Extension, source: string): string {
  return extension.extendMarkdownIt(new MarkdownIt({ html: true })).render(source);
}

function expectChart(html: string, type: string): void {
  expect(html).toContain('<figure class="markvis"');
  expect(html).toContain(`data-chart-type="${type}"`);
  expect(html).toContain("<svg");
  expect(html).toContain("<table");
  expect(html).not.toContain("markvis-error");
}

function expectFallback(html: string, code: string): void {
  expect(html).not.toContain("<svg");
  expect(html).toContain("<table");
  expect(html).toContain('<p class="markvis-error">');
  expect(html).toContain(code);
}

/** Whether `version` satisfies a `^x.y.z` range, read the way npm reads a caret. */
function caretIncludes(range: string, version: string): boolean {
  const r = /^\^(\d+)\.(\d+)\.(\d+)$/.exec(range);
  const v = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!r || !v) throw new Error(`unsupported range ${range} or version ${version}`);
  const [lo, at] = [r.slice(1).map(Number), v.slice(1).map(Number)] as [number[], number[]];
  const cmp = at[0]! - lo[0]! || at[1]! - lo[1]! || at[2]! - lo[2]!;
  if (cmp < 0) return false;
  if (lo[0]! > 0) return at[0] === lo[0];
  if (lo[1]! > 0) return at[0] === 0 && at[1] === lo[1];
  return at[0] === 0 && at[1] === 0 && at[2] === lo[2];
}

describe("vscode extension source", () => {
  it("draws a valid block as SVG with its table", () => {
    expectChart(preview(activate(), valid01), "bar");
  });

  it("paints through the --markvis-* variables, so preview.css can theme it", () => {
    const html = preview(activate(), valid02);
    expectChart(html, "line");
    expect(html).toContain("var(--markvis-ink,");
    expect(html).toContain("var(--markvis-series-1,");
  });

  it("draws the chart comment above a table", () => {
    expectChart(preview(activate(), valid08), "bar");
  });

  it("degrades an invalid block to its table and one error line", () => {
    expectFallback(preview(activate(), invalid01), "E_UNKNOWN_TYPE");
  });

  it("imports the published entry, not a monorepo path", () => {
    const source = readFileSync(join(extensionDir, "src/extension.ts"), "utf8");
    expect(source).toContain('from "markvis/markdown-it"');
    expect(source).not.toMatch(/from "\.\.?\//);
    expect(source).not.toContain("packages/");
  });
});

describe("vscode extension bundle", () => {
  let outDir = "";
  let bundle = "";
  let inputs: string[] = [];

  beforeAll(async () => {
    outDir = mkdtempSync(join(tmpdir(), "markvis-vscode-"));
    const result = await build({
      entryPoints: [join(extensionDir, "src/extension.ts")],
      absWorkingDir: extensionDir,
      bundle: true,
      platform: "node",
      format: "cjs",
      target: "node18",
      external: ["vscode"],
      metafile: true,
      write: false,
      logLevel: "silent",
    });
    bundle = result.outputFiles[0]!.text;
    inputs = Object.keys(result.metafile.inputs).map((input) =>
      relative(repoRoot, join(extensionDir, input)).replace(/\\/g, "/"),
    );
    writeFileSync(join(outDir, "extension.js"), bundle);
  });

  afterAll(() => {
    if (outDir) rmSync(outDir, { recursive: true, force: true });
  });

  it("matches the compile script's options", () => {
    const flags = manifest.scripts.compile;
    for (const flag of ["--bundle", "--platform=node", "--format=cjs", "--target=node18", "--external:vscode"]) {
      expect(flags).toContain(flag);
    }
    expect(flags).toContain(`--outfile=${manifest.main.replace(/^\.\//, "")}`);
  });

  it("bundles the built markvis entry and no package source", () => {
    expect(inputs).toContain("dist/markdown-it.js");
    expect(inputs.filter((input) => input.startsWith("packages/"))).toEqual([]);
  });

  it("carries one htmlTable, not a second copy", () => {
    expect(bundle.match(/\bfunction htmlTable\d*\s*\(/g)).toHaveLength(1);
  });

  it("loads as CommonJS and renders the same blocks", () => {
    const load = createRequire(join(outDir, "package.json"));
    const extension = (load(join(outDir, "extension.js")) as { activate: () => Extension }).activate();
    expectChart(preview(extension, valid01), "bar");
    expectFallback(preview(extension, invalid01), "E_UNKNOWN_TYPE");
  });
});

describe("vscode extension manifest", () => {
  it("is publishable", () => {
    expect(manifest.private).toBeUndefined();
    expect(manifest.description).not.toMatch(/sideload/i);
    expect(manifest.description.length).toBeLessThanOrEqual(200);
    expect(manifest.engines.vscode).toBe("^1.80.0");
    expect(manifest.repository.url).toContain("github.com/geekplux/markvis");
    expect(manifest.repository.directory).toBe("hosts/vscode");
    expect(manifest.keywords.length).toBeGreaterThan(0);
    expect(manifest.keywords.length).toBeLessThanOrEqual(30);
    expect(manifest.contributes["markdown.markdownItPlugins"]).toBe(true);
    expect(manifest.contributes["markdown.previewStyles"]).toEqual(["./preview.css"]);
    expect(existsSync(join(extensionDir, "LICENSE"))).toBe(true);
  });

  it("ships a 128 px PNG icon", () => {
    const png = readFileSync(join(extensionDir, manifest.icon));
    expect(png.subarray(1, 4).toString("latin1")).toBe("PNG");
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([128, 128]);
  });

  it("depends on a markvis range that includes the root version", () => {
    const range = manifest.dependencies?.markvis ?? manifest.devDependencies?.markvis;
    expect(range).toBe("^2.2.0");
    expect(caretIncludes(range!, rootVersion)).toBe(true);
  });

  it("checks ranges the way npm reads a caret", () => {
    expect(caretIncludes("^2.2.0", "2.2.0")).toBe(true);
    expect(caretIncludes("^2.2.0", "2.9.1")).toBe(true);
    expect(caretIncludes("^2.2.0", "2.1.9")).toBe(false);
    expect(caretIncludes("^2.2.0", "3.0.0")).toBe(false);
    expect(caretIncludes("^0.3.1", "0.3.4")).toBe(true);
    expect(caretIncludes("^0.3.1", "0.4.0")).toBe(false);
  });
});

describe("vscode preview.css", () => {
  const css = readFileSync(join(extensionDir, "preview.css"), "utf8");
  /** Every variable a chart reads, except the opt-in font: the editor keeps the chart's font. */
  const names = CSS_VARIABLES.filter((name) => name !== "--markvis-font");

  it("maps every paint variable onto an editor theme color", () => {
    const block = /\.markvis\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
    const declared = [...block.matchAll(/(--markvis-[\w-]+)\s*:\s*var\(--vscode-[\w-]+/g)].map((m) => m[1]);
    expect(names.length).toBe(18);
    expect(declared).toEqual(names);
  });

  it("draws the grid from the editor foreground, since a chart fades it itself", () => {
    expect(css).toMatch(/--markvis-grid:\s*var\(--vscode-editor-foreground\);/);
    expect(css).toMatch(/--markvis-paper:\s*var\(--vscode-editor-background\);/);
    expect(css).toMatch(/--markvis-plate:\s*var\(--vscode-editor-background\);/);
    expect(css).toMatch(/p\.markvis-error\s*\{\s*color:\s*var\(--vscode-errorForeground,/);
  });

  it("draws series from the editor's chart colors", () => {
    for (const hue of ["blue", "orange", "green", "purple", "red", "yellow"]) {
      expect(css).toContain(`var(--vscode-charts-${hue})`);
    }
  });
});
