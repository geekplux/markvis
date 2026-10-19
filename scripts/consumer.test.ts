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
const PKG_VERSION = JSON.parse(
  readFileSync(join(repoRoot, "package.json"), "utf8"),
).version as string;
const TGZ_NAME = `markvis-${PKG_VERSION}.tgz`;
const EXPORTS = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"))
  .exports as Record<string, unknown>;

/**
 * Every runtime name each public subpath must expose, as re-exported from
 * the workspace packages by src/<entry>.ts. "./min" is the classic script
 * (it runs on load), so it is checked as a file, not imported.
 */
const SUBPATH_NAMES: Record<string, { entry: string; names: string[] } | "file"> = {
  ".": {
    entry: "index",
    names: [
      "parse", "parseBlock", "parseMarkdown", "parseDocument", "extractCharts", "ERROR_CODES",
      "renderSvg", "render", "remarkMarkvis", "markdownItMarkvis",
      "CHART_TYPES", "THEMES", "PALETTES", "ChartIRSchema",
    ],
  },
  "./parser": {
    entry: "parser",
    names: [
      "parse", "parseBlock", "parseMarkdown", "parseDocument", "extractCharts",
      "readChartField", "setChartField", "ERROR_CODES",
    ],
  },
  "./render-svg": { entry: "render-svg", names: ["renderSvg"] },
  "./ir": { entry: "ir", names: ["CHART_TYPES", "THEMES", "PALETTES", "ChartIRSchema"] },
  "./remark": {
    entry: "remark",
    names: ["default", "remarkMarkvis", "chartBlockHtml", "resultToHtml", "htmlTable", "escapeHtml"],
  },
  "./rehype": { entry: "rehype", names: ["default", "rehypeMarkvis"] },
  "./markdown-it": {
    entry: "markdown-it",
    names: ["default", "markdownItMarkvis", "chartBlockHtml", "resultToHtml", "htmlTable", "escapeHtml"],
  },
  "./react": { entry: "react", names: ["Markvis", "markvisComponents", "remarkMarkvisStreaming"] },
  "./themes": {
    entry: "themes",
    names: [
      "folio", "highcharts", "shadcn", "docs", "ant", "recharts", "graphite",
      "themeRegistry", "resolveThemePack", "applyPaletteToTheme",
      "cool", "ink", "paletteRegistry", "porcelain", "resolvePalette", "vivid", "warm",
      "CSS_VARIABLES", "PAINT_NAMES",
    ],
  },
  "./cli": {
    entry: "cli",
    names: [
      "bakeMarkdown", "writeBake", "runCli", "USAGE", "VERSION", "collectMarkdownFiles",
      "collectSvgFiles", "displayPath", "CliError", "buildGalleryHtml", "chartStats",
      "STATS_HEADER", "failureToGfm", "formatStatsRow", "tableToGfm", "buildPreviewHtml",
    ],
  },
  "./min": "file",
  "./package.json": "file",
};

describe("subpath export table", () => {
  it("has a row for every key of package.json#exports", () => {
    expect(Object.keys(SUBPATH_NAMES).sort()).toEqual(Object.keys(EXPORTS).sort());
  });

  it.each(
    Object.entries(SUBPATH_NAMES).filter(
      (row): row is [string, { entry: string; names: string[] }] => row[1] !== "file",
    ),
  )("lists every runtime export of %s", async (_subpath, { entry, names }) => {
    const runtime = await import(join(repoRoot, "src", `${entry}.ts`));
    expect([...names].sort()).toEqual(Object.keys(runtime).sort());
  });
});

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
    // Pack the dist/ CI just built: a prepack rebuild would wipe dist/ under
    // the CLI tests running in parallel.
    tgz = packLib({ rebuild: false });
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

  it("packs the versioned tarball without workspace protocol", () => {
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
    expect(man.version).toBe(PKG_VERSION);
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

  it("turns a chart code block into hast with markvis/rehype", () => {
    writeFileSync(
      join(temp, "rehype.mjs"),
      `import rehypeMarkvis from "markvis/rehype";

const code = { type: "element", tagName: "code", properties: { className: ["language-chart"] },
  children: [{ type: "text", value: "type: bar\\nx: k\\ny: v\\n\\nk,v\\nA,1\\n" }] };
const tree = { type: "root", children: [{ type: "element", tagName: "pre", properties: {}, children: [code] }] };
rehypeMarkvis()(tree);
const figure = tree.children[0];
const tags = [];
const walk = (n) => { if (n.type === "element") tags.push(n.tagName); (n.children || []).forEach(walk); };
walk(tree);
process.stdout.write(JSON.stringify({ root: figure.tagName, svg: tags.includes("svg"), table: tags.includes("table") }));
`,
    );
    const out = run(temp, process.execPath, ["rehype.mjs"]);
    expect(out.status, out.stderr).toBe(0);
    expect(JSON.parse(out.stdout)).toEqual({ root: "figure", svg: true, table: true });
  });

  it("renders both React forms from markvis/react", () => {
    const install = run(temp, "npm", ["install", "react@19", "react-dom@19"]);
    expect(install.status, install.stderr).toBe(0);
    writeFileSync(
      join(temp, "react.mjs"),
      `import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "markvis/react";

const source = "type: bar\\nx: k\\ny: v\\n\\nk,v\\nA,1\\nB,2\\n";
const text = renderToStaticMarkup(createElement(Markvis, { source }));
const data = renderToStaticMarkup(
  createElement(Markvis, { chart: { type: "pie", x: "k", y: "v" }, data: [{ k: "A", v: -1 }] }),
);
process.stdout.write(JSON.stringify({
  text,
  data,
  components: Object.keys(markvisComponents).sort(),
  plugin: typeof remarkMarkvisStreaming,
}));
`,
    );
    const out = run(temp, process.execPath, ["react.mjs"]);
    expect(out.status, out.stderr).toBe(0);
    const result = JSON.parse(out.stdout) as {
      text: string;
      data: string;
      components: string[];
      plugin: string;
    };
    expect(result.text).toContain("<svg");
    expect(result.data).toContain("E_PIE_NEGATIVE");
    expect(result.data).toContain("<td>A</td><td>-1</td>");
    expect(result.components).toEqual(["code", "pre"]);
    expect(result.plugin).toBe("function");
    const listed = run(repoRoot, "tar", ["-tzf", tgz]);
    expect(listed.stdout).toContain("package/dist/react.js");
    expect(listed.stdout).toContain("package/dist/react.d.ts");
  }, TIMEOUT);

  it("runs npx markvis check and bake", () => {
    const version = run(temp, "npx", ["--no-install", "markvis", "-v"]);
    expect(version.status, version.stderr).toBe(0);
    expect(version.stdout.trim()).toBe(PKG_VERSION);

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

  it("resolves every package.json#exports subpath and exposes its names", () => {
    // markvis/react needs its optional peer; the React test above installs it
    // too, so this is a no-op when the file runs in order.
    const peers = run(temp, "npm", ["install", "react@19", "react-dom@19", "markdown-it"]);
    expect(peers.status, peers.stderr).toBe(0);
    writeFileSync(
      join(temp, "subpaths.mjs"),
      `import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const table = JSON.parse(process.argv[2]);
const report = {};
for (const [subpath, want] of Object.entries(table)) {
  const specifier = subpath === "." ? "markvis" : "markvis" + subpath.slice(1);
  try {
    const url = import.meta.resolve(specifier);
    if (want === "file") {
      report[subpath] = { bytes: readFileSync(fileURLToPath(url)).length };
      continue;
    }
    const mod = await import(specifier);
    report[subpath] = { missing: want.names.filter((name) => mod[name] === undefined) };
  } catch (err) {
    report[subpath] = { error: String(err) };
  }
}
process.stdout.write(JSON.stringify(report));
`,
    );
    const out = run(temp, process.execPath, ["subpaths.mjs", JSON.stringify(SUBPATH_NAMES)]);
    expect(out.status, out.stderr).toBe(0);
    const report = JSON.parse(out.stdout) as Record<
      string,
      { missing?: string[]; bytes?: number; error?: string }
    >;
    expect(Object.keys(report).sort()).toEqual(Object.keys(EXPORTS).sort());
    for (const [subpath, want] of Object.entries(SUBPATH_NAMES)) {
      const got = report[subpath]!;
      expect(got.error, subpath).toBeUndefined();
      if (want === "file") {
        expect(got.bytes, subpath).toBeGreaterThan(0);
      } else {
        expect(got.missing, subpath).toEqual([]);
      }
    }
  }, TIMEOUT);
});
