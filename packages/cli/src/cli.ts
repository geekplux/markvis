import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { parseMarkdown, type ParseResult } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import {
  CliError,
  collectMarkdownFiles,
  displayPath,
} from "./files.js";
import {
  STATS_HEADER,
  failureToGfm,
  formatStatsRow,
  tableToGfm,
} from "./format.js";
import { buildPreviewHtml } from "./preview.js";
import { chartStats } from "./stats.js";

export const VERSION = "2.0.0-dev";

export const USAGE = `Usage: markvis <command> [options] [paths...]

Commands:
  check       Parse charts; exit 0 only if every file is valid
  render      Write SVG (stdout if one file; --out DIR for many)
  preview     Side-by-side HTML for one markdown file
  stats       Print file, type, n, min, max, series
  to-table    Print GFM table; on error, table plus one error line

Options:
  -o, --out <path>  render: output directory; preview: html file
  --no-open         preview: do not open the html
  -h, --help
  -v, --version
`;

const COMMANDS = new Set([
  "check",
  "render",
  "preview",
  "stats",
  "to-table",
]);

export type CliContext = {
  cwd: string;
  stdout: { write(chunk: string): void };
  stderr: { write(chunk: string): void };
  open?: (path: string) => void;
};

type Flags = {
  out: string | undefined;
  noOpen: boolean;
  help: boolean;
  version: boolean;
};

function defaultOpen(target: string): void {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args =
    process.platform === "win32" ? ["/c", "start", "", target] : [target];
  const child = spawn(cmd, args, { detached: true, stdio: "ignore" });
  child.on("error", () => {});
  child.unref();
}

function resolveContext(ctx: Partial<CliContext> = {}): CliContext {
  const resolved: CliContext = {
    cwd: ctx.cwd ?? process.cwd(),
    stdout: ctx.stdout ?? process.stdout,
    stderr: ctx.stderr ?? process.stderr,
  };
  if (ctx.open) {
    resolved.open = ctx.open;
  }
  return resolved;
}

function parseArgv(argv: string[]): {
  command: string | undefined;
  paths: string[];
  flags: Flags;
} {
  const flags: Flags = {
    out: undefined,
    noOpen: false,
    help: false,
    version: false,
  };
  const paths: string[] = [];
  let command: string | undefined;
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    if (arg === "--") {
      paths.push(...argv.slice(i + 1));
      break;
    }
    if (arg === "--help" || arg === "-h") {
      flags.help = true;
      continue;
    }
    if (arg === "--version" || arg === "-v") {
      flags.version = true;
      continue;
    }
    if (arg === "--no-open") {
      flags.noOpen = true;
      continue;
    }
    if (arg === "--out" || arg === "-o") {
      const value = argv[++i];
      if (!value || value.startsWith("-")) {
        throw new CliError("missing value for --out");
      }
      flags.out = value;
      continue;
    }
    if (arg.startsWith("--out=")) {
      flags.out = arg.slice("--out=".length);
      continue;
    }
    if (arg.startsWith("-") && arg !== "-") {
      throw new CliError(`unknown option ${arg}`);
    }
    if (command === undefined) {
      command = arg;
      continue;
    }
    paths.push(arg);
  }
  return { command, paths, flags };
}

function parseFile(abs: string): { source: string; result: ParseResult } {
  const source = readFileSync(abs, "utf8");
  const result = parseMarkdown(source, { filename: basename(abs) });
  return { source, result };
}

function cmdCheck(paths: string[], ctx: CliContext): number {
  const files = collectMarkdownFiles(paths, ctx.cwd);
  if (files.length === 0) {
    throw new CliError("no markdown files");
  }
  let okCount = 0;
  let errCount = 0;
  for (const abs of files) {
    const file = displayPath(abs, ctx.cwd);
    const { result } = parseFile(abs);
    if (result.ok) {
      okCount += 1;
      ctx.stdout.write(
        `ok\t${file}\t${result.chart.type}\t${result.chart.table.rows.length}\n`,
      );
    } else {
      errCount += 1;
      ctx.stdout.write(`error\t${file}\t${result.error.code}\n`);
    }
  }
  if (errCount === 0) {
    ctx.stderr.write(`${okCount} ok\n`);
    return 0;
  }
  ctx.stderr.write(`${okCount} ok, ${errCount} error\n`);
  return 1;
}

function cmdStats(paths: string[], ctx: CliContext): number {
  const files = collectMarkdownFiles(paths, ctx.cwd);
  if (files.length === 0) {
    throw new CliError("no markdown files");
  }
  ctx.stdout.write(`${STATS_HEADER}\n`);
  let errCount = 0;
  for (const abs of files) {
    const file = displayPath(abs, ctx.cwd);
    const { result } = parseFile(abs);
    if (!result.ok) {
      errCount += 1;
      ctx.stdout.write(`error\t${file}\t${result.error.code}\n`);
      continue;
    }
    ctx.stdout.write(`${formatStatsRow(file, chartStats(result.chart))}\n`);
  }
  return errCount === 0 ? 0 : 1;
}

function cmdToTable(paths: string[], ctx: CliContext): number {
  const files = collectMarkdownFiles(paths, ctx.cwd);
  if (files.length === 0) {
    throw new CliError("no markdown files");
  }
  let errCount = 0;
  const chunks: string[] = [];
  for (const abs of files) {
    const file = displayPath(abs, ctx.cwd);
    const { result } = parseFile(abs);
    const parts: string[] = [];
    if (files.length > 1) {
      parts.push(`<!-- ${file} -->`);
    }
    if (result.ok) {
      parts.push(tableToGfm(result.chart.table));
    } else {
      errCount += 1;
      const gfm = failureToGfm(result);
      if (gfm) {
        parts.push(gfm);
      }
      parts.push(result.error.message);
    }
    chunks.push(parts.join("\n"));
  }
  ctx.stdout.write(`${chunks.join("\n\n")}\n`);
  return errCount === 0 ? 0 : 1;
}

function cmdRender(
  paths: string[],
  flags: Flags,
  ctx: CliContext,
): number {
  const files = collectMarkdownFiles(paths, ctx.cwd);
  if (files.length === 0) {
    throw new CliError("no markdown files");
  }
  const outDir = flags.out ? resolve(ctx.cwd, flags.out) : undefined;
  if (outDir === undefined && files.length > 1) {
    throw new CliError("render: pass --out DIR when rendering multiple files");
  }
  if (outDir) {
    mkdirSync(outDir, { recursive: true });
  }
  let errCount = 0;
  for (const abs of files) {
    const file = displayPath(abs, ctx.cwd);
    const { result } = parseFile(abs);
    if (!result.ok) {
      errCount += 1;
      ctx.stderr.write(`error\t${file}\t${result.error.code}\n`);
      continue;
    }
    const svg = renderSvg(result.chart);
    if (outDir) {
      const dest = join(outDir, basename(abs).replace(/\.md$/i, ".svg"));
      writeFileSync(dest, svg, "utf8");
      ctx.stdout.write(`wrote ${displayPath(dest, ctx.cwd)}\n`);
    } else {
      ctx.stdout.write(svg);
    }
  }
  return errCount === 0 ? 0 : 1;
}

function cmdPreview(
  paths: string[],
  flags: Flags,
  ctx: CliContext,
): number {
  if (paths.length !== 1) {
    throw new CliError("preview requires a single markdown file");
  }
  const abs = resolve(ctx.cwd, paths[0]!);
  let st;
  try {
    st = statSync(abs);
  } catch {
    throw new CliError(`path not found: ${abs}`);
  }
  if (!st.isFile() || !abs.toLowerCase().endsWith(".md")) {
    throw new CliError("preview requires a single markdown file");
  }
  const file = displayPath(abs, ctx.cwd);
  const { source, result } = parseFile(abs);
  const svg = result.ok ? renderSvg(result.chart) : undefined;
  const html = buildPreviewHtml({ file, source, result, svg });
  const outPath = flags.out
    ? resolve(ctx.cwd, flags.out)
    : join(tmpdir(), `markvis-preview-${basename(abs, ".md")}.html`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, "utf8");
  ctx.stdout.write(`preview ${displayPath(outPath, ctx.cwd)}\n`);
  if (!flags.noOpen) {
    if (ctx.open) {
      ctx.open(outPath);
    } else {
      defaultOpen(outPath);
    }
  }
  return result.ok ? 0 : 1;
}

export function runCli(argv: string[], ctx: Partial<CliContext> = {}): number {
  const io = resolveContext(ctx);
  try {
    const { command, paths, flags } = parseArgv(argv);
    if (flags.help) {
      io.stdout.write(USAGE);
      return 0;
    }
    if (flags.version) {
      io.stdout.write(`${VERSION}\n`);
      return 0;
    }
    if (command === undefined) {
      io.stderr.write(USAGE);
      return 1;
    }
    if (!COMMANDS.has(command)) {
      throw new CliError(`unknown command: ${command}`);
    }
    switch (command) {
      case "check":
        return cmdCheck(paths, io);
      case "stats":
        return cmdStats(paths, io);
      case "to-table":
        return cmdToTable(paths, io);
      case "render":
        return cmdRender(paths, flags, io);
      case "preview":
        return cmdPreview(paths, flags, io);
      default:
        throw new CliError(`unknown command: ${command}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    io.stderr.write(`${message}\n`);
    if (err instanceof CliError && message.startsWith("unknown command:")) {
      io.stderr.write(USAGE);
    }
    return 1;
  }
}
