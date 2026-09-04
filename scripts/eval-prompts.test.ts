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
  parsePromptPairs,
  runEvalPrompts,
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
