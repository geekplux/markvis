/**
 * Prompt eval. With no flags (stub mode) the gold fences in
 * examples/prompts.md are treated as model output and checked. With
 * `--outputs <dir>`, a directory of model answers (`01.md` … `30.md`, one
 * per prompt) is scored: valid-block rate, error codes, and whether the
 * chosen type matches the gold block's type. Failures belong in
 * docs/model-errors.md.
 */
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runCli } from "@markvis/cli";
import { extractCharts, parseMarkdown, readChartField } from "@markvis/parser";

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

export type OutputStatus = "valid" | "invalid" | "no-block" | "missing";

export type OutputResult = {
  n: number;
  title: string;
  status: OutputStatus;
  /** Stable error code when the first block does not parse. */
  code?: string;
  /** The type the answer chose, when it names one. */
  type?: string;
  goldType: string;
  typeMatch: boolean;
};

export type OutputReport = {
  results: OutputResult[];
  total: number;
  valid: number;
  typeMatch: number;
  codes: Record<string, number>;
};

/** The answer file for prompt `n`: `01.md` … `30.md`. */
export function outputFileName(n: number): string {
  return `${String(n).padStart(2, "0")}.md`;
}

function typeOf(raw: string): string | undefined {
  const parsed = parseMarkdown(raw);
  if (parsed.ok) {
    return parsed.chart.type;
  }
  return readChartField(raw, "type")?.trim().toLowerCase() || undefined;
}

/** Score one answer against its gold block. The first chart block counts. */
export function scoreOutput(pair: PromptPair, answer: string | undefined): OutputResult {
  const goldType = typeOf(pair.gold) ?? "";
  const base = { n: pair.n, title: pair.title, goldType };
  if (answer === undefined) {
    return { ...base, status: "missing", typeMatch: false };
  }
  const first = extractCharts(answer)[0];
  if (!first) {
    return { ...base, status: "no-block", typeMatch: false };
  }
  const parsed = parseMarkdown(first.raw);
  const type = typeOf(first.raw);
  const result: OutputResult = {
    ...base,
    status: parsed.ok ? "valid" : "invalid",
    typeMatch: type !== undefined && type === goldType,
  };
  if (type !== undefined) result.type = type;
  if (!parsed.ok) result.code = parsed.error.code;
  return result;
}

export function evaluateOutputs(pairs: PromptPair[], dir: string): OutputReport {
  const results = pairs.map((pair) => {
    const path = join(dir, outputFileName(pair.n));
    return scoreOutput(pair, existsSync(path) ? readFileSync(path, "utf8") : undefined);
  });
  const codes: Record<string, number> = {};
  for (const result of results) {
    const key = result.code ?? (result.status === "valid" ? undefined : result.status);
    if (key) codes[key] = (codes[key] ?? 0) + 1;
  }
  return {
    results,
    total: results.length,
    valid: results.filter((r) => r.status === "valid").length,
    typeMatch: results.filter((r) => r.typeMatch).length,
    codes,
  };
}

/** One line per prompt, then the totals. Tab-separated so it greps. */
export function formatOutputReport(report: OutputReport): string {
  const lines = report.results.map((r) =>
    [
      outputFileName(r.n),
      r.code ? `${r.status} ${r.code}` : r.status,
      `type=${r.type ?? "-"}`,
      `gold=${r.goldType}`,
      r.typeMatch ? "match" : "mismatch",
    ].join("\t"),
  );
  const pct = (k: number) => (report.total === 0 ? 0 : Math.round((100 * k) / report.total));
  lines.push(`valid ${report.valid}/${report.total} (${pct(report.valid)}%)`);
  lines.push(`type match ${report.typeMatch}/${report.total} (${pct(report.typeMatch)}%)`);
  const codes = Object.entries(report.codes).sort(([a], [b]) => a.localeCompare(b));
  lines.push(`failures ${codes.length === 0 ? "none" : codes.map(([c, k]) => `${c}=${k}`).join(" ")}`);
  return `${lines.join("\n")}\n`;
}

export function runEvalOutputs(options: {
  outputsDir: string;
  promptsPath?: string;
  stdout?: EvalIo["stdout"];
  stderr?: EvalIo["stderr"];
}): number {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const dir = resolve(options.outputsDir);
  if (!existsSync(dir)) {
    stderr.write(`no such directory: ${options.outputsDir}\n`);
    return 1;
  }
  let pairs: PromptPair[];
  try {
    pairs = loadPromptPairs(resolve(options.promptsPath ?? join(repoRoot, PROMPTS_RELATIVE_PATH)));
  } catch (err) {
    stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
    return 1;
  }
  const report = evaluateOutputs(pairs, dir);
  stdout.write(formatOutputReport(report));
  return report.valid === report.total ? 0 : 1;
}

function isMainModule(): boolean {
  const entry = process.argv[1];
  if (!entry) {
    return false;
  }
  return fileURLToPath(import.meta.url) === resolve(entry);
}

export function main(argv: string[] = process.argv.slice(2)): number {
  const at = argv.indexOf("--outputs");
  if (at !== -1) {
    const outputsDir = argv[at + 1];
    if (!outputsDir) {
      process.stderr.write("usage: eval-prompts --outputs <dir> [prompts.md]\n");
      return 1;
    }
    const rest = argv.filter((_, i) => i !== at && i !== at + 1);
    return runEvalOutputs(rest[0] ? { outputsDir, promptsPath: rest[0] } : { outputsDir });
  }
  const promptsPath = argv[0];
  return runEvalPrompts(promptsPath ? { promptsPath } : {});
}

if (isMainModule()) {
  process.exit(main());
}
