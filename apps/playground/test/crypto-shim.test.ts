import { createHash as nodeCreateHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createHash, sha256 } from "../src/crypto-shim.js";
import { parseMarkdown } from "@markvis/parser";
import { chartId, renderSvg } from "@markvis/render-svg";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const valid01 = readFileSync(
  join(here, "../../../examples/valid/01-bar-basic.md"),
  "utf8",
);

function hex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

describe("sha256 shim", () => {
  it("matches FIPS empty and abc vectors", () => {
    expect(hex(sha256(new TextEncoder().encode("")))).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
    expect(hex(sha256(new TextEncoder().encode("abc")))).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    );
  });

  it("createHash sha256 hex matches node:crypto", () => {
    const payload = '{"markvis":2,"type":"bar"}';
    const shim = createHash("sha256").update(payload, "utf8").digest("hex");
    const node = nodeCreateHash("sha256").update(payload, "utf8").digest("hex");
    expect(shim).toBe(node);
  });

  it("ids for 01-bar-basic match node:crypto chartId", () => {
    const result = parseMarkdown(valid01, { filename: "01-bar-basic.md" });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    const svg = renderSvg(result.chart);
    expect(svg).toContain(chartId(result.chart));
    const canonical = JSON.stringify({
      markvis: result.chart.markvis,
      type: result.chart.type,
      title: result.chart.title,
      unit: result.chart.unit ?? "",
      x: result.chart.x,
      y: result.chart.y ?? "",
      series: result.chart.series ?? "",
      columns: result.chart.table.columns,
      rows: result.chart.table.rows,
    });
    const shimHex = createHash("sha256").update(canonical, "utf8").digest("hex");
    expect(`mv-${shimHex.slice(0, 16)}`).toBe(chartId(result.chart));
  });
});
