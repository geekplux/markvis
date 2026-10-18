/**
 * One version everywhere a release names it: the top CHANGELOG heading,
 * package.json, the CLI's VERSION, and the markvis pin in action.yml. On a
 * tag build (release.yml runs check.yml with the tag's GITHUB_REF), the tag
 * is v<version> and the heading carries its release date.
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

/** `## 2.2.0`, `## 2.2.0 — unreleased`, or `## 2.2.0 — 2026-10-20`. */
const HEADING = /^## (\d+\.\d+\.\d+)(?: — (unreleased|\d{4}-\d{2}-\d{2}))?\s*$/;

export function topHeading(changelog: string): { version: string; date: string | undefined } {
  const line = changelog.split("\n").find((l) => l.startsWith("## "));
  if (!line) throw new Error("CHANGELOG.md has no ## heading");
  const m = line.match(HEADING);
  if (!m) throw new Error(`CHANGELOG.md top heading is not "## <version>[ — unreleased|YYYY-MM-DD]": ${line}`);
  return { version: m[1]!, date: m[2] };
}

/** YYYY-MM-DD that names a real day (rejects 2026-13-45 and 2026-02-30). */
export function isRealDate(d: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false;
  const parsed = new Date(`${d}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === d;
}

/** The tag name when the ref is a tag, else undefined. */
export function tagOf(ref: string | undefined): string | undefined {
  return ref?.startsWith("refs/tags/") ? ref.slice("refs/tags/".length) : undefined;
}

const version = (JSON.parse(read("package.json")) as { version: string }).version;
const heading = topHeading(read("CHANGELOG.md"));
const pins = [...read("action.yml").matchAll(/markvis@(\d+\.\d+\.\d+)/g)].map((m) => m[1]);
const tag = tagOf(process.env["GITHUB_REF"]);

describe("release versions", () => {
  it("reads a heading with or without a date", () => {
    expect(topHeading("# Changelog\n\n## 2.2.0 — unreleased\n\n## 2.1.0 — 2026-09-25\n")).toEqual({ version: "2.2.0", date: "unreleased" });
    expect(topHeading("## 2.3.0 — 2026-11-02\n")).toEqual({ version: "2.3.0", date: "2026-11-02" });
    expect(topHeading("## 2.0.2\n")).toEqual({ version: "2.0.2", date: undefined });
    expect(() => topHeading("## Unreleased\n")).toThrow();
    expect(isRealDate("2026-10-20")).toBe(true);
    expect(isRealDate("2028-02-29")).toBe(true);
    expect(isRealDate("2026-13-45")).toBe(false);
    expect(isRealDate("2026-02-30")).toBe(false);
    expect(isRealDate("unreleased")).toBe(false);
    expect(tagOf("refs/tags/v2.2.0")).toBe("v2.2.0");
    expect(tagOf("refs/heads/master")).toBeUndefined();
    expect(tagOf(undefined)).toBeUndefined();
  });

  it("CHANGELOG top heading, package.json, CLI VERSION, and the action pin agree", () => {
    expect(heading.version).toBe(version);
    expect(read("packages/cli/src/cli.ts")).toContain(`export const VERSION = "${version}"`);
    expect(pins.length).toBeGreaterThan(0);
    for (const pin of pins) expect(pin).toBe(version);
  });

  it.runIf(tag !== undefined)("a tag build is v<version> with a dated CHANGELOG heading", () => {
    expect(tag).toBe(`v${version}`);
    const date = heading.date ?? "";
    expect(date, "set the CHANGELOG date before tagging").toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(isRealDate(date), `${date} is not a calendar date`).toBe(true);
  });
});

describe("release.yml", () => {
  const release = read(".github/workflows/release.yml");

  it("fires only on a v<digit> tag, runs check.yml first, and publishes with provenance", () => {
    expect(release).toMatch(/^on:\n {2}push:\n {4}tags: \["v\[0-9\]\*"\]\n\n/m);
    expect(release).not.toMatch(/branches:|pull_request|workflow_dispatch|schedule:/);
    expect(release).toContain("uses: ./.github/workflows/check.yml");
    expect(release).toContain("needs: check");
    expect(release).toContain("id-token: write");
    expect(release).toContain("npm publish --provenance --access public");
    expect(release).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN|secrets\./);
    expect(read(".github/workflows/check.yml")).toMatch(/^ {2}workflow_call:/m);
  });
});
