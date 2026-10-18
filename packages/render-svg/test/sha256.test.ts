/**
 * Chart ids hash with a plain-JavaScript SHA-256, so render-svg imports no
 * Node module and bundles for the browser as is. The ids must stay the
 * ones node:crypto gave.
 */
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseDocument } from "@markvis/parser";
import { canonicalJson } from "../src/xml.js";
import { sha256, sha256Hex } from "../src/sha256.js";
import { chartId } from "../src/index.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "../../..");

function nodeHex(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

describe("sha256", () => {
  it("matches the FIPS empty and abc vectors", () => {
    const hex = (bytes: Uint8Array) => Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    expect(hex(sha256(new TextEncoder().encode("")))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(hex(sha256(new TextEncoder().encode("abc")))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("matches node:crypto across block boundaries and non-ASCII text", () => {
    const samples = ["", "a", "Ωé ß ñ 🙂", '{"markvis":2,"type":"bar"}'];
    for (let n = 50; n <= 130; n++) {
      samples.push("x".repeat(n));
    }
    samples.push("row,1\n".repeat(20_000));
    for (const text of samples) {
      expect(sha256Hex(text), `length ${text.length}`).toBe(nodeHex(text));
    }
  });

  it("gives every example the id node:crypto gave", () => {
    for (const dir of ["valid", "invalid"]) {
      const full = join(repoRoot, "examples", dir);
      for (const name of readdirSync(full).filter((n) => n.endsWith(".md"))) {
        for (const located of parseDocument(readFileSync(join(full, name), "utf8"), { filename: name })) {
          if (located.result.ok) {
            const chart = located.result.chart;
            expect(chartId(chart), name).toBe(`mv-${nodeHex(canonicalJson(chart)).slice(0, 16)}`);
          }
        }
      }
    }
  });

  it("render-svg imports no Node module", () => {
    const src = join(repoRoot, "packages/render-svg/src");
    for (const name of readdirSync(src, { recursive: true }) as string[]) {
      if (!name.endsWith(".ts") || name.endsWith(".test.ts")) continue;
      expect(readFileSync(join(src, name), "utf8"), name).not.toMatch(/from\s+["']node:|from\s+["']crypto["']/);
    }
  });
});
