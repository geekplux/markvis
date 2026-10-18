import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { extractCharts } from "@markvis/parser";
import {
  EXPECTED_PROMPT_COUNT,
  PROMPTS_RELATIVE_PATH,
  checkEmittedFences,
  loadPromptPairs,
  evaluateOutputs,
  formatOutputReport,
  outputFileName,
  parsePromptPairs,
  runEvalOutputs,
  runEvalPrompts,
  scoreOutput,
} from "./eval-prompts.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const promptsPath = join(repoRoot, PROMPTS_RELATIVE_PATH);

function capture(run: (io: {
  stdout: { write(chunk: string): void };
  stderr: { write(chunk: string): void };
}) => number) {
  let stdout = "";
  let stderr = "";
  const code = run({
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
  });
  return { code, stdout, stderr };
}

describe("parsePromptPairs", () => {
  it("loads 30 numbered gold fences from examples/prompts.md", () => {
    const pairs = loadPromptPairs(promptsPath);
    expect(pairs).toHaveLength(EXPECTED_PROMPT_COUNT);
    expect(pairs.map((pair) => pair.n)).toEqual(
      Array.from({ length: EXPECTED_PROMPT_COUNT }, (_, i) => i + 1),
    );
    expect(pairs[0]?.title).toBe("Bar of monthly revenue");
    expect(pairs[7]?.gold).toContain("<!-- chart:");
    expect(pairs[28]?.gold).toContain("<!-- chart:");
    for (const pair of pairs) {
      expect(extractCharts(pair.gold)).toHaveLength(1);
    }
  });

  it("rejects a heading with no fence", () => {
    expect(() => parsePromptPairs("## 1. Empty\n\n")).toThrow(/no emitted fence/);
  });
});

describe("checkEmittedFences", () => {
  it("exits 0 for gold fences in examples/prompts.md", () => {
    const pairs = loadPromptPairs(promptsPath);
    const { code, stdout, stderr } = capture((io) =>
      checkEmittedFences(pairs, io),
    );
    expect(code).toBe(0);
    const oks = stdout.split("\n").filter((line) => line.startsWith("ok\t"));
    expect(oks).toHaveLength(EXPECTED_PROMPT_COUNT);
    expect(stderr).toContain("30 ok");
    expect(stderr).not.toMatch(/error/i);
  });

  it("exits non-zero when an emitted fence is invalid", () => {
    const { code, stdout } = capture((io) =>
      checkEmittedFences(
        [
          {
            n: 1,
            title: "Invented type",
            gold: "```chart\ntype: donut\n\nname,n\nA,1\n```",
          },
        ],
        io,
      ),
    );
    expect(code).not.toBe(0);
    expect(stdout).toContain("E_UNKNOWN_TYPE");
  });
});

describe("runEvalPrompts", () => {
  it("exits 0 for the committed prompts file", () => {
    const { code, stdout, stderr } = capture((io) =>
      runEvalPrompts({ promptsPath, stdout: io.stdout, stderr: io.stderr }),
    );
    expect(code).toBe(0);
    expect(stdout).toContain("eval-prompts stub: 30 gold fences");
    expect(stderr).toContain("30 ok");
  });

  it("exits 1 when the prompt count is not 30", () => {
    const dir = mkdtempSync(join(tmpdir(), "markvis-eval-count-"));
    const path = join(dir, "prompts.md");
    writeFileSync(
      path,
      "## 1. One\n\n```chart\ntype: bar\n\nname,n\nA,1\n```\n",
      "utf8",
    );
    const { code, stderr } = capture((io) =>
      runEvalPrompts({ promptsPath: path, stdout: io.stdout, stderr: io.stderr }),
    );
    expect(code).toBe(1);
    expect(stderr).toContain("expected 30 prompts, got 1");
  });
});

describe("--outputs mode", () => {
  const pairs = loadPromptPairs(promptsPath);

  function outputsDir(answers: Record<number, string>): string {
    const dir = mkdtempSync(join(tmpdir(), "markvis-eval-outputs-"));
    for (const [n, text] of Object.entries(answers)) {
      writeFileSync(join(dir, outputFileName(Number(n))), text, "utf8");
    }
    return dir;
  }

  const all = (make: (gold: string, n: number) => string) =>
    Object.fromEntries(pairs.map((pair) => [pair.n, make(pair.gold, pair.n)]));

  it("scores gold answers inside prose as all valid and all matching", () => {
    const dir = outputsDir(all((gold) => `Here is the chart.\n\n${gold}\n\nThe table stays.\n`));
    const report = evaluateOutputs(pairs, dir);
    expect(report.valid).toBe(30);
    expect(report.typeMatch).toBe(30);
    expect(report.codes).toEqual({});
    const { code, stdout } = capture((io) => runEvalOutputs({ outputsDir: dir, ...io }));
    expect(code).toBe(0);
    expect(stdout).toContain("valid 30/30 (100%)");
    expect(stdout).toContain("type match 30/30 (100%)");
    expect(stdout).toContain("failures none");
  });

  it("reports a mix of valid, invalid, missing, and wrong-type answers", () => {
    const answers = all((gold) => gold);
    answers[1] = "```chart\ntype: donut\nx: name\ny: n\n\nname,n\nA,1\n```\n";
    answers[2] = '```chart\ntype: line\nx: month\ny: count\n\n[{"month":"Jan","count":1}]\n```\n';
    answers[4] = "```chart\ntype: bar\nx: height\ny: weight\n\nheight,weight\n160,55\n```\n";
    delete answers[5];
    const report = evaluateOutputs(pairs, outputsDir(answers));
    expect(report.valid).toBe(27);
    expect(report.typeMatch).toBe(27);
    expect(report.codes).toEqual({ E_JSON_DATA: 1, E_UNKNOWN_TYPE: 1, missing: 1 });
    expect(report.results[0]).toMatchObject({ status: "invalid", code: "E_UNKNOWN_TYPE", type: "donut", goldType: "bar", typeMatch: false });
    expect(report.results[1]).toMatchObject({ status: "invalid", code: "E_JSON_DATA", type: "line", typeMatch: true });
    expect(report.results[3]).toMatchObject({ status: "valid", type: "bar", goldType: "scatter", typeMatch: false });
    expect(report.results[4]).toMatchObject({ status: "missing", typeMatch: false });
    const text = formatOutputReport(report);
    expect(text).toContain("01.md\tinvalid E_UNKNOWN_TYPE\ttype=donut\tgold=bar\tmismatch");
    expect(text).toContain("valid 27/30 (90%)");
    expect(text).toContain("failures E_JSON_DATA=1 E_UNKNOWN_TYPE=1 missing=1");
  });

  it("scores answers that pick the wrong type as valid but mismatched", () => {
    const answers = all((gold) => gold.replace(/(type: |chart: )(\w+)/, (_, k, t) => `${k}${t === "line" ? "area" : "line"}`));
    const report = evaluateOutputs(pairs, outputsDir(answers));
    expect(report.typeMatch).toBe(0);
  });

  it("scores answers with no chart block at all", () => {
    const dir = outputsDir(all(() => "Revenue rose from 120 to 180.\n\n| month | revenue |\n| --- | --- |\n| Jan | 120 |\n"));
    const report = evaluateOutputs(pairs, dir);
    expect(report.valid).toBe(0);
    expect(report.codes).toEqual({ "no-block": 30 });
    const { code, stdout } = capture((io) => runEvalOutputs({ outputsDir: dir, ...io }));
    expect(code).toBe(1);
    expect(stdout).toContain("valid 0/30 (0%)");
  });

  it("counts the first block and reads the type of the comment form", () => {
    const pair = pairs[0]!;
    const comment = '<!-- chart: bar x=m y=n -->\n| m | n |\n| --- | --- |\n| A | 1 |\n';
    expect(scoreOutput(pair, comment)).toMatchObject({ status: "valid", type: "bar", typeMatch: true });
    const two = "```chart\ntype: pie\nx: a\ny: b\n\na,b\nA,1\n```\n\n" + pair.gold;
    expect(scoreOutput(pair, two)).toMatchObject({ type: "pie", typeMatch: false });
  });

  it("fails cleanly for a missing directory", () => {
    const { code, stderr } = capture((io) => runEvalOutputs({ outputsDir: join(tmpdir(), "markvis-no-such-dir"), ...io }));
    expect(code).toBe(1);
    expect(stderr).toContain("no such directory");
  });
});
