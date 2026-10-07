/**
 * The reusable GitHub Action (action.yml): its inputs and steps, and its
 * own shell steps run twice in a scratch repository. The second run is a
 * no-op, and a fork pull request bakes without committing.
 */
import { spawnSync } from "node:child_process";
import { chmodSync, cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repoRoot, "dist/cli.bin.js");

type Step = { name?: string; uses?: string; if?: string; shell?: string; run?: string; with: Record<string, string>; env: Record<string, string> };
type Action = { top: Record<string, string>; inputs: Record<string, Record<string, string>>; using: string; steps: Step[] };

const unquote = (value: string) => value.trim().replace(/^"(.*)"$/, "$1");

/** Just enough YAML for action.yml: maps by indentation, a step list, `run: |` blocks. */
function readAction(text: string): Action {
  const lines = text.split("\n");
  const action: Action = { top: {}, inputs: {}, using: "", steps: [] };
  let section = "";
  let input = "";
  let step: Step | undefined;
  let sub: "with" | "env" | undefined;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    const indent = line.length - line.trimStart().length;
    const m = line.trim().match(/^(-\s+)?([\w-]+):\s*(.*)$/);
    if (!m) continue;
    const [, dash, key, value] = m as unknown as [string, string | undefined, string, string];
    if (indent === 0) {
      section = key;
      if (value) action.top[key] = unquote(value);
      continue;
    }
    if (section === "inputs") {
      if (indent === 2) action.inputs[(input = key)] = {};
      else action.inputs[input]![key] = unquote(value);
      continue;
    }
    if (section !== "runs") continue;
    if (indent === 2 && key === "using") action.using = value;
    if (dash) {
      step = { with: {}, env: {} };
      action.steps.push(step);
      sub = undefined;
    }
    if (!step) continue;
    if (dash || indent === 6) {
      if (key === "with" || key === "env") {
        sub = key;
      } else if (key === "run" && value === "|") {
        const body: string[] = [];
        while (i + 1 < lines.length && (lines[i + 1]!.startsWith("        ") || lines[i + 1]!.trim() === "")) {
          body.push(lines[++i]!.slice(8));
        }
        step.run = `${body.join("\n").trimEnd()}\n`;
        sub = undefined;
      } else {
        (step as Record<string, unknown>)[key] = unquote(value);
        sub = undefined;
      }
    } else if (indent === 8 && sub) {
      step[sub][key] = unquote(value);
    }
  }
  return action;
}

const action = readAction(readFileSync(join(repoRoot, "action.yml"), "utf8"));

describe("action.yml", () => {
  it("is a composite action with paths, commit, and message inputs", () => {
    expect(action.top["name"]).toBe("markvis bake");
    expect(action.using).toBe("composite");
    expect(Object.keys(action.inputs)).toEqual(["paths", "commit", "message"]);
    expect(action.inputs["paths"]!["default"]).toBe("README.md");
    expect(action.inputs["commit"]!["default"]).toBe("true");
    expect(action.inputs["message"]!["default"]).toBe("chore: bake markvis charts");
  });

  it("sets up Node 20, bakes with markvis@2, then commits only when asked", () => {
    const [setup, bake, commit] = action.steps;
    expect(action.steps).toHaveLength(3);
    expect(setup).toMatchObject({ uses: "actions/setup-node@v4", with: { "node-version": "20" } });
    expect(bake!.run).toContain("npx --yes markvis@2 bake $MARKVIS_PATHS");
    expect(commit!.if).toBe("inputs.commit == 'true'");
    expect(commit!.run).toContain('git push origin "HEAD:$MARKVIS_BRANCH"');
  });

  it("passes inputs and context to shell through env only", () => {
    for (const step of action.steps.filter((s) => s.run)) {
      expect(step.run, step.name).not.toContain("${{");
      expect(step.shell).toBe("bash");
    }
  });
});

describe.runIf(existsSync(cli))("the action's steps in a scratch repository", () => {
  let dir = "";
  let work = "";
  let bin = "";

  const sh = (cwd: string, script: string, env: Record<string, string> = {}) =>
    spawnSync("bash", ["-e", "-c", script], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, PATH: `${bin}:${process.env["PATH"]}`, GIT_TERMINAL_PROMPT: "0", ...env },
    });
  const git = (args: string) => sh(work, `git ${args}`).stdout.trim();

  function runAction(env: Record<string, string>): { bake: string; commit: string } {
    const [, bake, commit] = action.steps;
    const shared = { MARKVIS_PATHS: "README.md docs" };
    const baked = sh(work, bake!.run!, shared);
    expect(baked.status, baked.stderr).toBe(0);
    const committed = sh(work, commit!.run!, {
      ...shared,
      MARKVIS_MESSAGE: "chore: bake markvis charts",
      MARKVIS_EVENT: "push",
      MARKVIS_HEAD_REPO: "",
      MARKVIS_REPO: "someone/site",
      MARKVIS_BRANCH: "main",
      ...env,
    });
    expect(committed.status, committed.stderr).toBe(0);
    return { bake: baked.stdout, commit: committed.stdout };
  }

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "markvis-action-"));
    bin = join(dir, "bin");
    work = join(dir, "work");
    sh(dir, `mkdir -p bin work/docs && git init -q --bare remote.git`);
    // npx --yes markvis@2 … runs this repository's CLI instead of the registry.
    writeFileSync(
      join(bin, "npx"),
      `#!/bin/sh\n[ "$1" = "--yes" ] && [ "$2" = "markvis@2" ] || { echo "unexpected npx $*" >&2; exit 2; }\nshift 2\nexec node "${cli}" "$@"\n`,
    );
    chmodSync(join(bin, "npx"), 0o755);
    cpSync(join(repoRoot, "examples/valid/01-bar-basic.md"), join(work, "README.md"));
    cpSync(join(repoRoot, "examples/valid/02-line-multi.md"), join(work, "docs/usage.md"));
    sh(
      work,
      "git init -q -b main && git config user.name t && git config user.email t@example.com && git add -A && git commit -qm init && git remote add origin ../remote.git && git push -q origin main",
    );
  });

  afterEach(() => rmSync(dir, { recursive: true, force: true }));

  it("commits the baked files once, and the second run is a no-op", () => {
    const first = runAction({});
    expect(first.bake).toContain("baked\tREADME.md\t1\tupdated");
    expect(git("log --format=%s -1")).toBe("chore: bake markvis charts");
    expect(git("show --name-only --format= HEAD").split("\n").sort()).toEqual([
      "README.md",
      "README.svg",
      "docs/usage.md",
      "docs/usage.svg",
    ]);
    expect(git("log --format=%s -1 origin/main")).toBe("chore: bake markvis charts");
    const head = git("rev-parse HEAD");

    const second = runAction({});
    expect(second.bake).toContain("baked\tREADME.md\t1\tunchanged");
    expect(second.commit).toContain("markvis: nothing to commit");
    expect(git("rev-parse HEAD")).toBe(head);
    expect(git("status --porcelain")).toBe("");
  });

  it("bakes a fork pull request without committing", () => {
    const head = git("rev-parse HEAD");
    const result = runAction({ MARKVIS_EVENT: "pull_request", MARKVIS_HEAD_REPO: "fork/site" });
    expect(result.commit).toContain("pull request from a fork");
    expect(git("rev-parse HEAD")).toBe(head);
    expect(readFileSync(join(work, "README.md"), "utf8")).toContain("![");
  });

  it("commits a same-repository pull request to its branch", () => {
    sh(work, "git checkout -q -b feature && git push -q origin feature");
    runAction({ MARKVIS_EVENT: "pull_request", MARKVIS_HEAD_REPO: "someone/site", MARKVIS_BRANCH: "feature" });
    expect(git("log --format=%s -1 origin/feature")).toBe("chore: bake markvis charts");
    expect(git("log --format=%s -1 origin/main")).toBe("init");
  });
});
