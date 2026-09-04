/**
 * Stub eval: treat gold fences in examples/prompts.md as model output
 * and run markvis check on each. Failures belong in docs/model-errors.md.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "@markvis/cli";
import { extractCharts } from "@markvis/parser";

export const EXPECTED_PROMPT_COUNT = 30;
export const PROMPTS_RELATIVE_PATH = "examples/prompts.md";

const HEADING_RE = /^## (\d+)\. (.+)$/;

export type PromptPair = {
  n: number;
  title: string;
  gold: string;
};

export type EvalIo = {
  stdout: { write(chunk: string): void };
  stderr: { write(chunk: string): void };
};

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

export function parsePromptPairs(markdown: string): PromptPair[] {
  const lines = markdown.split(/\r?\n/);
  const pairs: PromptPair[] = [];
  let current: { n: number; title: string; body: string[] } | undefined;

  const flush = (): void => {
    if (!current) {
      return;
    }
    const gold = current.body.join("\n").trim();
    if (!gold) {
      throw new Error(`prompt ${current.n} has no emitted fence`);
    }
    const charts = extractCharts(gold);
    if (charts.length !== 1) {
      throw new Error(
        `prompt ${current.n}: expected 1 fence, got ${charts.length}`,
      );
    }
    pairs.push({ n: current.n, title: current.title, gold });
  };

  for (const line of lines) {
    const match = line.match(HEADING_RE);
    if (match) {
      flush();
      current = {
        n: Number(match[1]),
        title: match[2]!.trim(),
        body: [],
      };
      continue;
    }
    if (current) {
      current.body.push(line);
    }
  }
  flush();
  return pairs;
}

export function loadPromptPairs(promptsPath: string): PromptPair[] {
  const markdown = readFileSync(promptsPath, "utf8");
  return parsePromptPairs(markdown);
}

export function checkEmittedFences(
  pairs: PromptPair[],
  io: EvalIo,
): number {
  if (pairs.length === 0) {
    io.stderr.write("no prompts\n");
    return 1;
  }
  const dir = mkdtempSync(join(tmpdir(), "markvis-eval-prompts-"));
  try {
    for (const pair of pairs) {
      const name = `${String(pair.n).padStart(2, "0")}.md`;
      writeFileSync(join(dir, name), `${pair.gold}\n`, "utf8");
    }
    return runCli(["check", dir], {
      cwd: dir,
      stdout: io.stdout,
      stderr: io.stderr,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function runEvalPrompts(
  options: {
    promptsPath?: string;
    stdout?: EvalIo["stdout"];
    stderr?: EvalIo["stderr"];
  } = {},
): number {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const promptsPath = resolve(
    options.promptsPath ?? join(repoRoot, PROMPTS_RELATIVE_PATH),
  );
  let pairs: PromptPair[];
  try {
    pairs = loadPromptPairs(promptsPath);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    stderr.write(`${message}\n`);
    return 1;
  }
  stdout.write(
    `eval-prompts stub: ${pairs.length} gold fences from ${PROMPTS_RELATIVE_PATH}\n`,
  );
  if (pairs.length !== EXPECTED_PROMPT_COUNT) {
    stderr.write(
      `expected ${EXPECTED_PROMPT_COUNT} prompts, got ${pairs.length}\n`,
    );
    return 1;
  }
  for (let i = 0; i < pairs.length; i++) {
    if (pairs[i]!.n !== i + 1) {
      stderr.write(
        `prompt numbers must be 1..${EXPECTED_PROMPT_COUNT}\n`,
      );
      return 1;
    }
  }
  const code = checkEmittedFences(pairs, { stdout, stderr });
  if (code !== 0) {
    stderr.write("record failures in docs/model-errors.md\n");
  }
  return code;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return fileURLToPath(import.meta.url) === resolve(entry);
}

export function main(argv: string[] = process.argv.slice(2)): number {
  const promptsPath = argv[0];
  return runEvalPrompts(promptsPath ? { promptsPath } : {});
}

if (isMainModule()) {
  process.exit(main());
}
