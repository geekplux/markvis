import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { afterEach, describe, expect, it } from "vitest";
import { chartStats } from "../src/stats.js";
import { tableToGfm } from "../src/format.js";
import { collectMarkdownFiles, collectSvgFiles } from "../src/files.js";
import { buildGalleryHtml } from "../src/gallery.js";
import { runCli, USAGE } from "../src/cli.js";
import { parseMarkdown } from "@markvis/parser";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");
const valid01 = "examples/valid/01-bar-basic.md";
const valid02 = "examples/valid/02-line-multi.md";
const valid06 = "examples/valid/06-hist-basic.md";
const invalid01 = "examples/invalid/01-unknown-type.md";
const invalid05 = "examples/invalid/05-pie-negative.md";

const tmpDirs: string[] = [];

afterEach(() => {
  for (const dir of tmpDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function tmp(): string {
  const dir = mkdtempSync(join(tmpdir(), "markvis-cli-"));
  tmpDirs.push(dir);
  return dir;
}

function capture(argv: string[], cwd = repoRoot) {
  let stdout = "";
  let stderr = "";
  const opened: string[] = [];
  const code = runCli(argv, {
    cwd,
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
    open(path: string) {
      opened.push(path);
    },
  });
  return { code, stdout, stderr, opened };
}

describe("usage", () => {
  it("prints help for --help and lists every command", () => {
    const { code, stdout, stderr } = capture(["--help"]);
    expect(code).toBe(0);
    expect(stdout).toBe(USAGE);
    expect(stderr).toBe("");
    for (const command of [
      "check",
      "render",
      "preview",
      "stats",
      "to-table",
      "gallery",
      "bake",
    ]) {
      expect(stdout).toContain(command);
    }
  });

  it("prints version", () => {
    const { code, stdout } = capture(["-v"]);
    expect(code).toBe(0);
    expect(stdout.trim()).toBe("2.0.0-dev");
  });

  it("exits 1 with usage when no command is given", () => {
    const { code, stdout, stderr } = capture([]);
    expect(code).toBe(1);
    expect(stdout).toBe("");
    expect(stderr).toContain("Usage:");
  });

  it("exits 1 on an unknown command", () => {
    const { code, stderr } = capture(["serve"]);
    expect(code).toBe(1);
    expect(stderr).toContain("unknown command: serve");
  });
});

describe("collectMarkdownFiles", () => {
  it("collects sorted .md files from a directory", () => {
    const files = collectMarkdownFiles(["examples/valid"], repoRoot);
    expect(files).toHaveLength(52);
    expect(files[0]?.endsWith("01-bar-basic.md")).toBe(true);
    expect(files.every((file) => file.endsWith(".md"))).toBe(true);
  });

  it("throws when a path is missing", () => {
    expect(() => collectMarkdownFiles(["no-such.md"], repoRoot)).toThrow(
      /not found/,
    );
  });
});

describe("check", () => {
  it("exits 0 for a valid file", () => {
    const { code, stdout, stderr } = capture(["check", valid01]);
    expect(code).toBe(0);
    expect(stdout).toContain(`ok\t${valid01}\tbar\t3`);
    expect(stderr).toContain("1 ok");
  });

  it("exits 0 for examples/valid", () => {
    const { code, stdout, stderr } = capture(["check", "examples/valid"]);
    expect(code).toBe(0);
    const oks = stdout.split("\n").filter((line) => line.startsWith("ok\t"));
    expect(oks).toHaveLength(52);
    expect(stderr).toContain("52 ok");
    expect(stderr).not.toMatch(/error/i);
  });

  it("exits non-zero for examples/invalid", () => {
    const { code, stdout, stderr } = capture(["check", "examples/invalid"]);
    expect(code).not.toBe(0);
    const errors = stdout
      .split("\n")
      .filter((line) => line.startsWith("error\t"));
    expect(errors).toHaveLength(18);
    expect(stdout).toContain("E_UNKNOWN_TYPE");
    expect(stdout).toContain("E_PIE_NEGATIVE");
    expect(stderr).toContain("18 error");
  });

  it("exits non-zero when a path is missing", () => {
    const { code, stderr } = capture(["check", "missing.md"]);
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/not found/);
  });
});

describe("stats", () => {
  it("prints type n min max series for a bar", () => {
    const { code, stdout } = capture(["stats", valid01]);
    expect(code).toBe(0);
    expect(stdout).toContain("file\ttype\tn\tmin\tmax\tseries");
    expect(stdout).toContain(`${valid01}\tbar\t3\t120\t180\t-`);
  });

  it("prints the series column and y min/max for multi-series", () => {
    const { code, stdout } = capture(["stats", valid02]);
    expect(code).toBe(0);
    expect(stdout).toContain(`${valid02}\tline\t4\t12\t55\tplan`);
  });

  it("uses x for hist min/max", () => {
    const { code, stdout } = capture(["stats", valid06]);
    expect(code).toBe(0);
    expect(stdout).toContain(`${valid06}\thist\t6\t12\t42\t-`);
  });

  it("exits non-zero on invalid input", () => {
    const { code, stdout } = capture(["stats", invalid01]);
    expect(code).not.toBe(0);
    expect(stdout).toContain("E_UNKNOWN_TYPE");
    expect(stdout).not.toContain("\tdonut\t");
  });

  it("computes stats from Chart IR", () => {
    const source = readFileSync(join(repoRoot, valid01), "utf8");
    const result = parseMarkdown(source, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(chartStats(result.chart)).toEqual({
      type: "bar",
      n: 3,
      min: 120,
      max: 180,
      series: "-",
    });
  });
});

describe("to-table", () => {
  it("prints a GFM table for a valid chart", () => {
    const { code, stdout } = capture(["to-table", valid01]);
    expect(code).toBe(0);
    expect(stdout).toContain("| month | revenue |");
    expect(stdout).toContain("| --- | --- |");
    expect(stdout).toContain("| Jan | 120 |");
    expect(stdout).toContain("| Mar | 150 |");
    expect(stdout).not.toMatch(/E_/);
  });

  it("keeps recovered rows and one error line on failure", () => {
    const { code, stdout } = capture(["to-table", invalid05]);
    expect(code).not.toBe(0);
    expect(stdout).toContain("| name | value |");
    expect(stdout).toContain("| B | -5 |");
    const errorLines = stdout
      .trim()
      .split("\n")
      .filter((line) => line.includes("E_PIE_NEGATIVE"));
    expect(errorLines).toHaveLength(1);
  });

  it("renders a fallback table to GFM", () => {
    expect(
      tableToGfm({
        columns: ["month", "revenue"],
        rows: [
          ["Jan", "120"],
          ["Feb", "180"],
        ],
      }),
    ).toBe(
      ["| month | revenue |", "| --- | --- |", "| Jan | 120 |", "| Feb | 180 |"].join(
        "\n",
      ),
    );
  });
});

describe("render", () => {
  it("writes SVG to stdout for a single file", () => {
    const { code, stdout } = capture(["render", valid01]);
    expect(code).toBe(0);
    const snapshot = readFileSync(
      join(repoRoot, "examples/out/01-bar-basic.svg"),
      "utf8",
    );
    expect(stdout).toBe(snapshot);
    expect(stdout.startsWith("<svg ")).toBe(true);
  });

  it("writes SVG files into --out for a directory", () => {
    const outDir = tmp();
    const { code, stdout } = capture([
      "render",
      "examples/valid",
      "--out",
      outDir,
    ]);
    expect(code).toBe(0);
    const svgs = readdirSync(outDir)
      .filter((name) => name.endsWith(".svg"))
      .sort();
    expect(svgs).toHaveLength(52);
    expect(stdout).toContain("01-bar-basic.svg");
    const rendered = readFileSync(join(outDir, "01-bar-basic.svg"), "utf8");
    const snapshot = readFileSync(
      join(repoRoot, "examples/out/01-bar-basic.svg"),
      "utf8",
    );
    expect(rendered).toBe(snapshot);
  });

  it("exits non-zero and writes no SVG for invalid input", () => {
    const outDir = tmp();
    const { code, stderr } = capture([
      "render",
      invalid01,
      "--out",
      outDir,
    ]);
    expect(code).not.toBe(0);
    expect(stderr).toContain("E_UNKNOWN_TYPE");
    expect(readdirSync(outDir)).toEqual([]);
  });
});

describe("preview", () => {
  it("writes a left-source right-svg HTML file and opens it", () => {
    const outDir = tmp();
    const htmlPath = join(outDir, "preview.html");
    const { code, stdout, opened } = capture([
      "preview",
      valid01,
      "--out",
      htmlPath,
    ]);
    expect(code).toBe(0);
    expect(opened).toEqual([htmlPath]);
    expect(stdout).toContain(htmlPath);
    const html = readFileSync(htmlPath, "utf8");
    expect(html).toContain("preview-layout");
    expect(html).toContain("type: bar");
    expect(html).toContain("<svg ");
    expect(html).toContain("Feb led Q3 at 180");
    expect(html).toContain("<table");
    expect(html).toContain("Jan");
  });

  it("does not open when --no-open is set", () => {
    const outDir = tmp();
    const htmlPath = join(outDir, "preview.html");
    const { code, opened } = capture([
      "preview",
      valid01,
      "--out",
      htmlPath,
      "--no-open",
    ]);
    expect(code).toBe(0);
    expect(opened).toEqual([]);
  });

  it("shows table plus error for invalid input (no blank preview)", () => {
    const outDir = tmp();
    const htmlPath = join(outDir, "bad.html");
    const { code } = capture([
      "preview",
      invalid01,
      "--out",
      htmlPath,
      "--no-open",
    ]);
    expect(code).not.toBe(0);
    const html = readFileSync(htmlPath, "utf8");
    expect(html).toContain("E_UNKNOWN_TYPE");
    expect(html).toContain("<table");
    expect(html).toContain(">A<");
    expect(html).not.toContain("<svg");
    expect(html.length).toBeGreaterThan(100);
  });

  it("requires a single markdown file", () => {
    const { code, stderr } = capture(["preview", "examples/valid"]);
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/single markdown file/);
  });
});

describe("gallery", () => {
  it("collects sorted svg files from a directory", () => {
    const files = collectSvgFiles(["examples/out"], repoRoot);
    expect(files).toHaveLength(52);
    expect(files[0]?.endsWith("01-bar-basic.svg")).toBe(true);
    expect(files.every((file) => file.endsWith(".svg"))).toBe(true);
  });

  it("writes HTML catalog from examples/out", () => {
    const outDir = tmp();
    const htmlPath = join(outDir, "gallery.html");
    const { code, stdout } = capture([
      "gallery",
      "examples/out",
      "--out",
      htmlPath,
    ]);
    expect(code).toBe(0);
    expect(stdout).toContain("gallery.html");
    const html = readFileSync(htmlPath, "utf8");
    expect(html).toContain("markvis gallery");
    expect(html).toContain("52 charts from SVG snapshots");
    expect(html).toContain("generated by markvis gallery");
    expect(html).toContain('id="01-bar-basic"');
    expect(html).toContain("<figcaption>01-bar-basic.svg</figcaption>");
    expect(html).toContain("<figcaption>52-line-zeros.svg</figcaption>");
    expect(html).toContain("<svg ");
    expect(html).toContain("</svg>");
    expect(html).toContain("<title ");
    expect(html).toContain("<desc ");
  });

  it("defaults --out to sibling gallery.html of an svg directory", () => {
    const outDir = tmp();
    const svgDir = join(outDir, "out");
    mkdirSync(svgDir);
    writeFileSync(
      join(svgDir, "01-bar-basic.svg"),
      readFileSync(join(repoRoot, "examples/out/01-bar-basic.svg"), "utf8"),
    );
    const { code } = capture(["gallery", svgDir], outDir);
    expect(code).toBe(0);
    expect(existsSync(join(outDir, "gallery.html"))).toBe(true);
  });

  it("matches committed examples/gallery.html", () => {
    const files = collectSvgFiles(["examples/out"], repoRoot);
    const items = files.map((abs) => ({
      name: basename(abs),
      svg: readFileSync(abs, "utf8"),
    }));
    const html = buildGalleryHtml(items);
    const committed = readFileSync(
      join(repoRoot, "examples/gallery.html"),
      "utf8",
    );
    expect(html).toBe(committed);
    expect(committed).toContain("52 charts from SVG snapshots");
  });

  it("exits non-zero when the path is missing", () => {
    const { code, stderr } = capture(["gallery", "missing-out"]);
    expect(code).not.toBe(0);
    expect(stderr).toMatch(/not found/);
  });
});

describe("bake", () => {
  const oneFence = `<!-- intent: one fence -->

\`\`\`chart
markvis: 2
type: bar
title: Q3
x: month
y: revenue

month,revenue
Jan,120
Feb,180
Mar,150
\`\`\`
`;

  const twoFences = `## two

\`\`\`chart
markvis: 2
type: bar
title: First
x: month
y: revenue

month,revenue
Jan,1
Feb,2
\`\`\`

\`\`\`chart
markvis: 2
type: line
title: Second
x: month
y: revenue

month,revenue
Jan,3
Feb,4
\`\`\`
`;

  it("writes SVG and inserts a markdown image after one fence, keeping the fence", () => {
    const dir = tmp();
    const mdPath = join(dir, "one.md");
    writeFileSync(mdPath, oneFence);
    const { code, stdout } = capture(["bake", mdPath], dir);
    expect(code).toBe(0);
    expect(stdout).toContain("baked\t");
    const md = readFileSync(mdPath, "utf8");
    expect(md).toContain("```chart");
    expect(md).toContain("month,revenue");
    expect(md).toMatch(/```\n+!\[Q3\]\(\.\/one\.svg\)\n/);
    expect(existsSync(join(dir, "one.svg"))).toBe(true);
    const svg = readFileSync(join(dir, "one.svg"), "utf8");
    expect(svg.startsWith("<svg ")).toBe(true);
  });

  it("writes one SVG per fence in a two-fence file", () => {
    const dir = tmp();
    const mdPath = join(dir, "two.md");
    writeFileSync(mdPath, twoFences);
    const { code } = capture(["bake", mdPath], dir);
    expect(code).toBe(0);
    const md = readFileSync(mdPath, "utf8");
    expect(md).toContain("```chart");
    expect(md).toContain("![First](./two-1.svg)");
    expect(md).toContain("![Second](./two-2.svg)");
    const firstFenceEnd = md.indexOf("Feb,2");
    const firstImg = md.indexOf("![First](./two-1.svg)");
    const secondFence = md.indexOf("title: Second");
    const secondImg = md.indexOf("![Second](./two-2.svg)");
    expect(firstImg).toBeGreaterThan(firstFenceEnd);
    expect(firstImg).toBeLessThan(secondFence);
    expect(secondImg).toBeGreaterThan(secondFence);
    expect(existsSync(join(dir, "two-1.svg"))).toBe(true);
    expect(existsSync(join(dir, "two-2.svg"))).toBe(true);
  });

  it("is idempotent: bake twice yields no md or svg diff", () => {
    const dir = tmp();
    const mdPath = join(dir, "one.md");
    writeFileSync(mdPath, oneFence);
    expect(capture(["bake", mdPath], dir).code).toBe(0);
    const mdOnce = readFileSync(mdPath, "utf8");
    const svgOnce = readFileSync(join(dir, "one.svg"), "utf8");
    const second = capture(["bake", mdPath], dir);
    expect(second.code).toBe(0);
    expect(second.stdout).toContain("unchanged");
    expect(readFileSync(mdPath, "utf8")).toBe(mdOnce);
    expect(readFileSync(join(dir, "one.svg"), "utf8")).toBe(svgOnce);
    expect(mdOnce.match(/!\[Q3\]\(\.\/one\.svg\)/g)?.length).toBe(1);
  });

  it("does not insert a second image when already baked", () => {
    const dir = tmp();
    const mdPath = join(dir, "one.md");
    writeFileSync(
      mdPath,
      `${oneFence}\n![Q3](./one.svg)\n`,
    );
    writeFileSync(join(dir, "one.svg"), "<svg></svg>\n");
    const { code, stdout } = capture(["bake", mdPath], dir);
    expect(code).toBe(0);
    expect(stdout).toContain("unchanged");
    const md = readFileSync(mdPath, "utf8");
    expect(md.match(/!\[Q3\]\(\.\/one\.svg\)/g)?.length).toBe(1);
    expect(md).toContain("```chart");
    const svg = readFileSync(join(dir, "one.svg"), "utf8");
    expect(svg.startsWith("<svg ")).toBe(true);
    expect(svg).not.toBe("<svg></svg>\n");
  });
});

describe("bin", () => {
  it("runs check via packages/cli/bin.js", () => {
    const result = spawnSync(
      process.execPath,
      [join(repoRoot, "packages/cli/bin.js"), "check", valid01],
      { cwd: repoRoot, encoding: "utf8" },
    );
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(`ok\t${valid01}\tbar\t3`);
  });
});
