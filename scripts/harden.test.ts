import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHART_TYPES } from "@markvis/ir";
import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import { runCli } from "@markvis/cli";

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
    expect(yaml).toContain("pnpm test");
    expect(yaml).toContain("pnpm markvis check examples/valid");
    expect(yaml).toContain("pnpm markvis check examples/invalid");
    expect(yaml).toMatch(
      /if pnpm markvis check examples\/invalid; then[\s\S]*exit 1/,
    );
    expect(yaml).toContain("pnpm --filter playground build");
    expect(yaml).toMatch(/node-version:\s*20\b/);
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
    expect(stdout).toContain(`ok\t${file}\tbar\t3`);
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
