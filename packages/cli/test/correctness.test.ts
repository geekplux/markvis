import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runCli } from "../src/cli.js";

function capture(argv: string[], cwd: string) {
  let stdout = "";
  let stderr = "";
  const code = runCli(argv, {
    cwd,
    stdout: { write(chunk) { stdout += chunk; } },
    stderr: { write(chunk) { stderr += chunk; } },
    open() {},
  });
  return { code, stdout, stderr };
}

const valid = `\`\`\`chart
type: bar
title: First
x: month
y: revenue

month,revenue
Jan,10
Feb,12
\`\`\`
`;

const invalid = `\`\`\`chart
type: bar
title: Second
x: month
y: revenue

month,revenue
Jan,N/A
\`\`\`
`;

describe("check every chart", () => {
  it("fails a file when a later chart is invalid and still reports the valid one", () => {
    const dir = join(tmpdir(), `markvis-check-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "notes.md");
    writeFileSync(file, `${valid}\n${invalid}`);
    const once = capture(["check", file], dir);
    const twice = capture(["check", file], dir);
    expect(once.code).not.toBe(0);
    expect(twice).toEqual(once);
    expect(once.stdout).toContain("notes.md");
    expect(once.stdout).toContain("chart 1");
    expect(once.stdout).toContain("bar");
    expect(once.stdout).toContain("chart 2");
    expect(once.stdout).toContain("E_BAD_NUMBER");
    const nested = join(dir, "batch");
    mkdirSync(nested);
    writeFileSync(join(nested, "notes.md"), readFileSync(file, "utf8"));
    const dirRun = capture(["check", nested], dir);
    expect(dirRun.code).not.toBe(0);
    expect(dirRun.stdout).toContain("E_BAD_NUMBER");
    expect(dirRun.stdout).toContain("bar");
  });
});

describe("bake ownership", () => {
  it("keeps references current when a chart is added and the first chart changes", () => {
    const dir = join(tmpdir(), `markvis-bake-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "readme.md");
    writeFileSync(file, valid);
    writeFileSync(join(dir, "photo.png"), "not-an-svg");
    expect(capture(["bake", file], dir).code).toBe(0);
    const secondChart = `\`\`\`chart
type: line
title: Second
x: month
y: revenue

month,revenue
Jan,3
Feb,4
\`\`\`
`;
    const bakedOnce = readFileSync(file, "utf8").replace("Jan,10", "Jan,77");
    writeFileSync(file, `${bakedOnce}\n![photo](./photo.png)\n\n${secondChart}\n`);
    expect(capture(["bake", file], dir).code).toBe(0);
    const md = readFileSync(file, "utf8");
    expect(md).toContain("![photo](./photo.png)");
    expect(existsSync(join(dir, "photo.png"))).toBe(true);
    const firstHref = md.match(/!\[First\]\(([^)]+)\)/)?.[1];
    const secondHref = md.match(/!\[Second\]\(([^)]+)\)/)?.[1];
    expect(firstHref).toBeTruthy();
    expect(secondHref).toBeTruthy();
    expect(firstHref).not.toBe(secondHref);
    const firstSvg = readFileSync(join(dir, firstHref!.replace(/^\.\//, "")), "utf8");
    const secondSvg = readFileSync(join(dir, secondHref!.replace(/^\.\//, "")), "utf8");
    expect(firstSvg).toContain("77");
    expect(secondSvg).toContain('data-chart-type="line"');
    expect(firstSvg).not.toContain('data-chart-type="line"');
    const before = md;
    const again = capture(["bake", file], dir);
    expect(again.code).toBe(0);
    expect(again.stdout).toContain("unchanged");
    expect(readFileSync(file, "utf8")).toBe(before);
    expect(readFileSync(join(dir, firstHref!.replace(/^\.\//, "")), "utf8")).toBe(firstSvg);
  });

  it("drops every extra owned image and does not delete a file the markdown still names", () => {
    const dir = join(tmpdir(), `markvis-bake-extra-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const file = join(dir, "doc.md");
    writeFileSync(
      file,
      `${valid}
![One](./doc-1.svg)
![Two](./doc-2.svg)
![again](./doc-1.svg)
`,
    );
    writeFileSync(join(dir, "doc-1.svg"), "<svg>OLD1</svg>\n");
    writeFileSync(join(dir, "doc-2.svg"), "<svg>OLD2</svg>\n");
    expect(capture(["bake", file], dir).code).toBe(0);
    const md = readFileSync(file, "utf8");
    expect(md).toContain("![First](./doc.svg)");
    expect(md).not.toContain("doc-1.svg");
    expect(md).not.toContain("doc-2.svg");
    expect(existsSync(join(dir, "doc.svg"))).toBe(true);
    expect(existsSync(join(dir, "doc-1.svg"))).toBe(false);
    expect(existsSync(join(dir, "doc-2.svg"))).toBe(false);

    const many = join(dir, "many.md");
    writeFileSync(
      many,
      `${valid}
![One](./many-1.svg)
![Two](./many-2.svg)
![Three](./many-3.svg)
`,
    );
    writeFileSync(join(dir, "many-1.svg"), "<svg>OLD1</svg>\n");
    writeFileSync(join(dir, "many-2.svg"), "<svg>OLD2</svg>\n");
    writeFileSync(join(dir, "many-3.svg"), "<svg>OLD3</svg>\n");
    expect(capture(["bake", many], dir).code).toBe(0);
    const manyMd = readFileSync(many, "utf8");
    expect(manyMd).toContain("![First](./many.svg)");
    expect(manyMd).not.toContain("many-1.svg");
    expect(manyMd).not.toContain("many-2.svg");
    expect(manyMd).not.toContain("many-3.svg");
    const written = readFileSync(join(dir, "many.svg"), "utf8");
    expect(written.startsWith("<svg ")).toBe(true);
    expect(written).not.toContain("OLD3");
    expect(existsSync(join(dir, "many-3.svg"))).toBe(false);
  });
});
