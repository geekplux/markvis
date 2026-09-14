import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHART_TYPES } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import { runCli } from "@markvis/cli";
import { publishManifest } from "./pack-lib.mjs";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const FORBIDDEN_DEPS = [
  "d3",
  "d3-node",
  "markvis-bar",
  "markvis-line",
  "markvis-pie",
  "markdown-it-fence",
  "babel-preset-es2015",
  "jsdom-as-renderer",
] as const;

const FORBIDDEN_IMPORT =
  /(?:from|import)\s+['"](?:d3|d3-node|markvis-bar|markvis-line|markvis-pie|markdown-it-fence|babel-preset-es2015|jsdom-as-renderer)['"]|require\(\s*['"](?:d3|d3-node|markvis-bar|markvis-line|markvis-pie)['"]\s*\)/;

function listWorkspacePackageJsons(): string[] {
  const out: string[] = [];
  for (const top of ["packages", "apps"] as const) {
    const dir = join(repoRoot, top);
    for (const name of readdirSync(dir)) {
      const pkg = join(dir, name, "package.json");
      if (existsSync(pkg)) {
        out.push(pkg);
      }
    }
  }
  return out.sort();
}

function walkSourceFiles(dir: string, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist") {
      continue;
    }
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walkSourceFiles(path, acc);
      continue;
    }
    if (/\.(ts|js|tsx|mjs|cjs)$/.test(name)) {
      acc.push(path);
    }
  }
  return acc;
}

function depKeys(pkg: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}): string[] {
  return [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
    ...Object.keys(pkg.optionalDependencies ?? {}),
  ];
}

function capture(argv: string[]) {
  let stdout = "";
  let stderr = "";
  const code = runCli(argv, {
    cwd: repoRoot,
    stdout: {
      write(chunk: string) {
        stdout += chunk;
      },
    },
    stderr: {
      write(chunk: string) {
        stderr += chunk;
      },
    },
    open() {},
  });
  return { code, stdout, stderr };
}

describe("CI contract", () => {
  const workflowPath = join(repoRoot, ".github/workflows/check.yml");
  const yaml = readFileSync(workflowPath, "utf8");

  it("lives at .github/workflows/check.yml", () => {
    expect(existsSync(workflowPath)).toBe(true);
    expect(yaml).toMatch(/^name:\s*check\b/m);
  });

  it("installs, tests, checks valid, checks invalid non-zero, builds playground", () => {
    expect(yaml).toContain("pnpm install");
    expect(yaml).toContain("pnpm build");
    expect(yaml).toContain("pnpm test");
    expect(yaml).toContain("pnpm markvis check examples/valid");
    expect(yaml).toContain("pnpm markvis check examples/invalid");
    expect(yaml).toMatch(
      /if pnpm markvis check examples\/invalid; then[\s\S]*exit 1/,
    );
    expect(yaml).toContain("pnpm --filter playground build");
    expect(yaml).toMatch(/node-version:\s*20\b/);
    const installAt = yaml.indexOf("pnpm install");
    const buildAt = yaml.indexOf("pnpm build");
    const testAt = yaml.indexOf("pnpm test");
    expect(installAt).toBeGreaterThan(-1);
    expect(buildAt).toBeGreaterThan(installAt);
    expect(testAt).toBeGreaterThan(buildAt);
  });
});

describe("vitest covers parser, render-svg, cli", () => {
  const vitestConfig = readFileSync(join(repoRoot, "vitest.config.ts"), "utf8");

  it("includes the three packages in vitest.config.ts", () => {
    expect(vitestConfig).toContain("packages/parser/");
    expect(vitestConfig).toContain("packages/render-svg/");
    expect(vitestConfig).toContain("packages/cli/");
  });

  it("keeps committed test files for parser, render-svg, and cli", () => {
    expect(existsSync(join(repoRoot, "packages/parser/test/fixtures.test.ts"))).toBe(
      true,
    );
    expect(
      existsSync(join(repoRoot, "packages/render-svg/test/render.test.ts")),
    ).toBe(true);
    expect(
      existsSync(join(repoRoot, "packages/render-svg/test/fixtures.test.ts")),
    ).toBe(true);
    expect(existsSync(join(repoRoot, "packages/cli/test/cli.test.ts"))).toBe(
      true,
    );
  });

  it("parses, renders, and checks a valid fixture through the three packages", () => {
    const file = "examples/valid/01-bar-basic.md";
    const source = readFileSync(join(repoRoot, file), "utf8");
    const parsed = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) {
      return;
    }
    const svg = renderSvg(parsed.chart);
    const snapshot = readFileSync(
      join(repoRoot, "examples/out/01-bar-basic.svg"),
      "utf8",
    );
    expect(svg).toBe(snapshot);
    const { code, stdout } = capture(["check", file]);
    expect(code).toBe(0);
    expect(stdout).toContain(`ok\t${file}\tbar\t8`);
  });

  it("cli check of examples/invalid exits non-zero", () => {
    const { code, stdout } = capture(["check", "examples/invalid"]);
    expect(code).not.toBe(0);
    expect(stdout).toContain("E_UNKNOWN_TYPE");
  });
});

describe("frozen language", () => {
  it("does not add a seventh chart type", () => {
    expect([...CHART_TYPES]).toEqual([
      "bar",
      "line",
      "area",
      "scatter",
      "pie",
      "hist",
    ]);
  });

  it("rejects heatmap in the parser", () => {
    const source = readFileSync(
      join(repoRoot, "examples/invalid/13-heatmap-type.md"),
      "utf8",
    );
    const result = parseMarkdown(source, { filename: "13-heatmap-type.md" });
    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.error.code).toBe("E_UNKNOWN_TYPE");
  });
});

describe("no d3 in packages or apps", () => {
  it("has no forbidden dependency names", () => {
    const pkgs = listWorkspacePackageJsons();
    expect(pkgs.length).toBeGreaterThan(0);
    for (const pkgPath of pkgs) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
        peerDependencies?: Record<string, string>;
        optionalDependencies?: Record<string, string>;
      };
      const keys = depKeys(pkg);
      for (const forbidden of FORBIDDEN_DEPS) {
        expect(keys, `${relative(repoRoot, pkgPath)}:${forbidden}`).not.toContain(
          forbidden,
        );
      }
    }
  });

  it("does not import forbidden packages from source", () => {
    const files = [
      ...walkSourceFiles(join(repoRoot, "packages")),
      ...walkSourceFiles(join(repoRoot, "apps")),
    ];
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source, relative(repoRoot, file)).not.toMatch(FORBIDDEN_IMPORT);
      expect(source, relative(repoRoot, file)).not.toMatch(
        /from ['"]legacy(?:\/|['"])/,
      );
    }
  });
});

function readRepo(rel: string): string {
  return readFileSync(join(repoRoot, rel), "utf8");
}

function walkFiles(dir: string, test: (name: string) => boolean, acc: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (
      name === "node_modules" ||
      name === "dist" ||
      name === ".vitepress" ||
      name === "coverage" ||
      name === "play-app"
    ) {
      continue;
    }
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      walkFiles(path, test, acc);
      continue;
    }
    if (test(name)) {
      acc.push(path);
    }
  }
  return acc;
}

function specFieldNotes(spec: string, field: string): string {
  const row = spec.split("\n").find((line) => line.includes(`| \`${field}\` |`));
  expect(row, `SPEC.md field row for ${field}`).toBeTruthy();
  return row ?? "";
}

function specListedValues(notes: string, skip: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const match of notes.matchAll(/`([a-z][a-z0-9-]*)`/g)) {
    const tok = match[1]!;
    if (skip.includes(tok) || seen.has(tok)) {
      continue;
    }
    seen.add(tok);
    out.push(tok);
  }
  return out;
}

describe("docs: live grammar, diagrams, unused shims", () => {
  const spec = readRepo("SPEC.md");
  const architecturePath = join(repoRoot, "docs/architecture.md");

  it("SPEC.md lists theme and palette allowed values", () => {
    const themeNotes = specFieldNotes(spec, "theme");
    const paletteNotes = specFieldNotes(spec, "palette");
    for (const value of [
      "folio",
      "highcharts",
      "shadcn",
      "docs",
      "ant",
      "recharts",
    ]) {
      expect(themeNotes).toContain(value);
    }
    for (const value of ["ink", "porcelain", "warm", "cool", "vivid"]) {
      expect(paletteNotes).toContain(value);
    }
  });

  it("current-product grammar docs include SPEC theme and palette values", () => {
    const themeValues = specListedValues(specFieldNotes(spec, "theme"), [
      "theme",
    ]);
    const paletteValues = specListedValues(specFieldNotes(spec, "palette"), [
      "palette",
      "theme",
    ]);
    expect(themeValues).toEqual([
      "folio",
      "highcharts",
      "shadcn",
      "docs",
      "ant",
      "recharts",
    ]);
    expect(paletteValues).toEqual([
      "ink",
      "porcelain",
      "warm",
      "cool",
      "vivid",
    ]);

    const grammarDocs = [
      "SPEC.md",
      "apps/web/spec.md",
      "apps/web/public/llms.txt",
      "llms.txt",
      "llms-full.txt",
      "docs/themes.md",
      "skills/markvis/SKILL.md",
    ];
    for (const rel of grammarDocs) {
      const text = readRepo(rel);
      expect(text, `${rel} theme field`).toMatch(/theme/i);
      expect(text, `${rel} palette field`).toMatch(/palette/i);
      for (const value of themeValues) {
        expect(text, `${rel} theme:${value}`).toContain(value);
      }
      for (const value of paletteValues) {
        expect(text, `${rel} palette:${value}`).toContain(value);
      }
    }
  });

  it("live-product specs do not ban theme: as current law", () => {
    const liveSpecs = [
      "SPEC.md",
      "docs/visual-spec.md",
      "docs/site.md",
      "docs/themes.md",
      "apps/web/spec.md",
      "extensions/vscode-markvis-preview/README.md",
    ];
    const stale = [
      /(?:\*\*)?no(?:\*\*)? `theme:`/,
      /Do \*\*not\*\* add a chart `theme:`/,
      /No theme field/,
    ];
    for (const rel of liveSpecs) {
      const text = readRepo(rel);
      for (const pattern of stale) {
        expect(text, `${rel} ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("commits architecture, parse/render workflow, and package-structure diagrams", () => {
    expect(existsSync(architecturePath)).toBe(true);
    const architecture = readRepo("docs/architecture.md");
    expect(architecture).toMatch(/^# /m);
    expect(architecture).toMatch(/## Architecture/i);
    expect(architecture).toMatch(/## .*(Workflow|Parse)/i);
    expect(architecture).toMatch(/## .*(Structure|Packages)/i);

    const mermaid = architecture.match(/```mermaid[\s\S]*?```/g) ?? [];
    expect(mermaid.length).toBeGreaterThanOrEqual(3);
    const diagramText = mermaid.join("\n");
    expect(diagramText).toMatch(/parser/i);
    expect(diagramText).toMatch(/Chart IR/i);
    expect(diagramText).toContain("@markvis/ir");
    expect(diagramText).toContain("@markvis/render-svg");
    expect(diagramText).toMatch(/table fallback/i);
    expect(diagramText).toContain("@markvis/parser");
    expect(diagramText).toContain("@markvis/cli");
    expect(diagramText).toContain("@markvis/remark");
    expect(diagramText).toContain("@markvis/markdown-it");
    expect(diagramText).toContain("@markvis/browser");
    expect(diagramText).toContain("@markvis/themes");
    expect(diagramText).not.toMatch(/\b(heatmap|donut|treemap|sankey|vega|echarts|d3)\b/i);
    expect(diagramText).not.toMatch(/JSON as default/i);
  });

  it("keeps mermaid out of README, landing, and apps/web", () => {
    const forbidden = [
      join(repoRoot, "README.md"),
      join(repoRoot, "docs/landing.md"),
      ...walkFiles(join(repoRoot, "apps/web"), (name) =>
        /\.(md|vue|ts|css|html)$/.test(name),
      ),
    ];
    expect(forbidden.length).toBeGreaterThan(2);
    for (const file of forbidden) {
      const text = readFileSync(file, "utf8");
      expect(text, relative(repoRoot, file)).not.toMatch(/mermaid/i);
    }
  });

  it("removes unreferenced render-svg theme shims and keeps product paths", () => {
    expect(existsSync(join(repoRoot, "packages/render-svg/themes"))).toBe(
      false,
    );
    const kept = [
      "VISION.md",
      "AGENTS.md",
      "SPEC.md",
      "llms.txt",
      "llms-full.txt",
      "docs/architecture.md",
      "docs/integrate.md",
      "docs/themes.md",
      "docs/visual-spec.md",
      "docs/site.md",
      "docs/examples.md",
      "docs/landing.md",
      "docs/research-brief.md",
      "docs/model-errors.md",
      "docs/best-practices.md",
      "docs/release.md",
      "packages/compat-legacy",
      "legacy",
    ];
    for (const rel of kept) {
      expect(existsSync(join(repoRoot, rel)), rel).toBe(true);
    }
  });

  it("states the English-only committed-text rule in AGENTS.md", () => {
    const agents = readRepo("AGENTS.md");
    expect(agents).toContain(
      "Committed repo text (documents, code, comments) is English only",
    );
    expect(agents).toContain(
      "English is the only source language in the repo",
    );
    expect(agents).toMatch(/The user may prompt in Chinese or any other language/i);
  });

  it("keeps only current-law markdown under docs/", () => {
    const docsDir = join(repoRoot, "docs");
    const names = readdirSync(docsDir).sort();
    expect(names).toEqual([
      "architecture.md",
      "best-practices.md",
      "examples.md",
      "integrate.md",
      "landing.md",
      "model-errors.md",
      "release.md",
      "research-brief.md",
      "site.md",
      "themes.md",
      "visual-spec.md",
    ]);
    for (const name of names) {
      expect(statSync(join(docsDir, name)).isFile(), name).toBe(true);
    }
  });

  it("deletes outdated critique, backlog, launch, and superseded copy", () => {
    const gone = [
      "docs/visual-critique.md",
      "docs/visual-critique-b.md",
      "docs/visual-critique-c.md",
      "docs/BACKLOG.md",
      "docs/launch/READY.md",
      "docs/launch/SHOW_HN.md",
      "docs/launch/TWEET.md",
      "docs/design/PALETTES.md",
      "docs/design/HOME.md",
      "docs/designer-language.md",
      "docs/gallery-spec.md",
      "docs/gallery-titles.md",
      "docs/site-copy.md",
      "docs/site-visual-spec.md",
      "docs/pages.md",
      "docs/POSITIONING.md",
      "docs/examples-data.md",
    ];
    for (const rel of gone) {
      expect(existsSync(join(repoRoot, rel)), rel).toBe(false);
    }
  });

  it("has no CJK prose in in-scope v2 files", () => {
    const han = /\p{Script=Han}/u;
    const files = [
      join(repoRoot, "VISION.md"),
      join(repoRoot, "AGENTS.md"),
      join(repoRoot, "SPEC.md"),
      join(repoRoot, "llms.txt"),
      join(repoRoot, "llms-full.txt"),
      join(repoRoot, "README.md"),
      join(repoRoot, "CONTRIBUTING.md"),
      join(repoRoot, "CODE_OF_CONDUCT.md"),
      join(repoRoot, "SECURITY.md"),
      join(repoRoot, "CHANGELOG.md"),
      ...walkFiles(join(repoRoot, "docs"), (name) =>
        /\.(md|ts|js|txt)$/.test(name),
      ),
      ...walkFiles(join(repoRoot, "packages"), (name) =>
        /\.(md|ts|js|tsx|mjs|cjs|vue|css|html|json|yml|yaml|txt)$/.test(name),
      ),
      ...walkFiles(join(repoRoot, "apps"), (name) =>
        /\.(md|ts|js|tsx|mjs|cjs|vue|css|html|json|yml|yaml|txt)$/.test(name),
      ),
      ...walkFiles(join(repoRoot, "scripts"), (name) =>
        /\.(md|ts|js|txt)$/.test(name),
      ),
      ...walkFiles(join(repoRoot, "skills"), (name) =>
        /\.(md|ts|js|txt)$/.test(name),
      ),
    ];
    expect(files.length).toBeGreaterThan(20);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text, relative(repoRoot, file)).not.toMatch(han);
    }
  });
});

describe("public contract", () => {
  it("removes process files from the repo root", () => {
    for (const rel of [
      "CONSTITUTION.md",
      "GOAL.md",
      "STATUS.md",
      "DECISIONS.tsv",
    ]) {
      expect(existsSync(join(repoRoot, rel)), rel).toBe(false);
    }
  });

  it("keeps community files", () => {
    for (const rel of [
      "CONTRIBUTING.md",
      "CODE_OF_CONDUCT.md",
      "SECURITY.md",
      "CHANGELOG.md",
      "docs/release.md",
    ]) {
      expect(existsSync(join(repoRoot, rel)), rel).toBe(true);
    }
    expect(readRepo("CODE_OF_CONDUCT.md")).toMatch(/Contributor Covenant/);
    expect(readRepo("CHANGELOG.md")).toContain("2.0.0-rc.1");
  });

  it("does not instruct pstack, /loop, or grok -p in public markdown", () => {
    const instruct = /pstack|\/loop\b|grok -p/;
    const files = [
      join(repoRoot, "README.md"),
      join(repoRoot, "AGENTS.md"),
      join(repoRoot, "CONTRIBUTING.md"),
      join(repoRoot, "VISION.md"),
      join(repoRoot, "SPEC.md"),
      join(repoRoot, "llms.txt"),
      join(repoRoot, "llms-full.txt"),
      ...walkFiles(join(repoRoot, "docs"), (name) => name.endsWith(".md")),
      ...walkFiles(join(repoRoot, "apps/web"), (name) =>
        /\.(md|vue)$/.test(name),
      ),
      ...walkFiles(join(repoRoot, "skills"), (name) => name.endsWith(".md")),
    ];
    expect(files.length).toBeGreaterThan(10);
    for (const file of files) {
      const text = readFileSync(file, "utf8");
      expect(text, relative(repoRoot, file)).not.toMatch(instruct);
    }
  });

  it("exports compiled dist, not an empty index.js", () => {
    expect(existsSync(join(repoRoot, "index.js"))).toBe(false);
    const pkg = JSON.parse(readRepo("package.json")) as {
      main: string;
      types: string;
      bin: { markvis: string };
      exports: Record<string, unknown>;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      version: string;
    };
    expect(pkg.version).toBe("2.0.0-rc.1");
    expect(pkg.main).toBe("./dist/index.js");
    expect(pkg.types).toBe("./dist/index.d.ts");
    expect(pkg.bin.markvis).toBe("./dist/cli.bin.js");
    expect(pkg.exports["."]).toMatchObject({
      types: "./dist/index.d.ts",
      import: "./dist/index.js",
    });
    expect(pkg.exports).not.toHaveProperty("./browser");
    expect(pkg.dependencies ?? {}).toEqual({});
    const workspaceKeys = Object.entries(pkg.devDependencies ?? {})
      .filter(([, ver]) => String(ver).startsWith("workspace:"))
      .map(([name]) => name);
    expect(workspaceKeys.length).toBeGreaterThan(0);
    expect(readRepo("README.md")).toContain('from "markvis"');
    expect(readRepo("README.md")).toContain("markvis/markdown-it");
  });

  it("packed manifest has no workspace protocol and no empty export", () => {
    const pkg = JSON.parse(readRepo("package.json")) as Record<string, unknown>;
    const manifest = publishManifest(pkg) as {
      main: string;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      exports: Record<string, unknown>;
    };
    const blob = JSON.stringify(manifest);
    expect(blob).not.toContain("workspace:");
    expect(blob).not.toContain("export {}");
    expect(manifest.main).toBe("./dist/index.js");
    expect(manifest.dependencies ?? {}).toEqual({});
    expect(manifest.devDependencies).toBeUndefined();
    expect(manifest.exports["."]).toMatchObject({
      import: "./dist/index.js",
    });
  });

  it("Skill and public llms.txt list only frozen fields and types", () => {
    const frozenTypes = ["bar", "line", "area", "scatter", "pie", "hist"];
    const frozenFields = [
      "markvis",
      "type",
      "title",
      "unit",
      "x",
      "y",
      "series",
    ];
    for (const rel of [
      "skills/markvis/SKILL.md",
      "llms.txt",
      "apps/web/public/llms.txt",
    ]) {
      const text = readRepo(rel);
      for (const value of frozenTypes) {
        expect(text, `${rel} type:${value}`).toContain(value);
      }
      for (const field of frozenFields) {
        expect(text, `${rel} field:${field}`).toContain(field);
      }
      expect(text, rel).not.toMatch(/type:\s*heatmap/);
      expect(text, rel).not.toMatch(/type:\s*donut/);
      expect(text, rel).not.toMatch(/type:\s*treemap/);
      expect(text, rel).not.toMatch(/type:\s*sankey/);
    }
  });

  it("does not claim v2 is npm latest or install-with-npm-now", () => {
    const readme = readRepo("README.md");
    expect(readme).toMatch(/not.*npm registry/i);
    expect(readme).toContain("0.0.13");
    expect(readme).toContain("markvis/remark");
    expect(readRepo("apps/web/index.md")).not.toContain("Install with npm");
    expect(readRepo("docs/site.md")).not.toMatch(
      /Install with npm or a script tag/,
    );
  });

  it("pages and bake fire on master (and v2 until merge)", () => {
    const pages = readRepo(".github/workflows/pages.yml");
    const bake = readRepo(".github/workflows/bake.yml");
    expect(pages).toMatch(/branches:\s*\[v2, master\]/);
    expect(bake).toMatch(/branches:\s*\[v2, master\]/);
    expect(readRepo("docs/release.md")).toContain("git merge --no-ff v2");
    expect(readRepo("docs/release.md")).toMatch(/[Ff]orbidden/);
    expect(readRepo("docs/release.md")).toMatch(/[Ss]quash-merge/);
    expect(readRepo("docs/release.md")).toMatch(/force-push|push --force/);
  });

  it("does not stamp npm or script as available now", () => {
    const home = readRepo("apps/web/index.md");
    expect(
      home.match(/home-host-name">npm<\/span>\s*<span class="home-host-status">([^<]+)/)?.[1],
    ).toBe("clone + build");
    expect(
      home.match(/home-host-name">script<\/span>\s*<span class="home-host-status">([^<]+)/)?.[1],
    ).toBe("clone + build");
    expect(
      home.match(/home-host-name">skill<\/span>\s*<span class="home-host-status">([^<]+)/)?.[1],
    ).toBe("available now");
    expect(readRepo("docs/site.md")).toMatch(
      /Do not stamp npm or script as .available now/,
    );
  });

  it("homepage copy does not say IR", () => {
    expect(readRepo("apps/web/index.md")).not.toMatch(/\bIR\b/);
    expect(readRepo("apps/web/get-started.md")).not.toMatch(/\bIR\b/);
  });

  it("does not advertise registry npx markvis as the bake command", () => {
    const home = readRepo("apps/web/index.md");
    expect(home).toContain(
      '<CopyChip command="pnpm markvis bake README.md"',
    );
    expect(home).not.toContain("npx markvis");
    expect(readRepo("apps/web/get-started.md")).toContain("pnpm markvis bake");
    expect(readRepo("apps/web/integrate.md")).toContain("pnpm markvis bake");
    expect(readRepo("README.md")).toContain("pnpm markvis bake README.md");
    expect(readRepo("docs/site.md")).toContain("$ pnpm markvis bake README.md");
    expect(readRepo("apps/web/test/chrome.test.ts")).not.toMatch(
      /toContain\(["']npx markvis bake/,
    );
    expect(readRepo("apps/web/test/chrome.test.ts")).not.toContain(
      '<CopyChip command="npx markvis bake',
    );
    const legacyPkg = JSON.parse(readRepo("legacy/package.json")) as {
      version: string;
      bin?: unknown;
    };
    expect(legacyPkg.version).toBe("0.0.13");
    expect(legacyPkg.bin).toBeUndefined();
  });

  it("README has no live HTML comment chart that bake would parse", () => {
    expect(readRepo("README.md")).not.toMatch(/<!--\s*(chart|markvis|vis)\s*:/);
  });

  it("legacy README does not link removed CONSTITUTION.md", () => {
    expect(readRepo("legacy/README.md")).not.toContain("CONSTITUTION.md");
    expect(existsSync(join(repoRoot, "CONSTITUTION.md"))).toBe(false);
  });

  it("points Skill blob URLs at master, not v2", () => {
    const files = [
      "apps/web/ai.md",
      "apps/web/get-started.md",
      "README.md",
      "CONTRIBUTING.md",
      "skills/markvis/SKILL.md",
    ];
    for (const rel of files) {
      const text = readRepo(rel);
      expect(text, rel).not.toContain("/blob/v2/");
    }
    expect(readRepo("apps/web/ai.md")).toContain(
      "github.com/geekplux/markvis/blob/master/skills/markvis/SKILL.md",
    );
  });
});

