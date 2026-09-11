import { createHash } from "node:crypto";
import type { ChartIR } from "@markvis/ir";
import { canonicalJson } from "./xml.js";

/** Stable id from a SHA-256 of the canonical IR. No clocks or random. Node-only. */
export function chartId(chart: ChartIR): string {
  const hash = createHash("sha256")
    .update(canonicalJson(chart), "utf8")
    .digest("hex")
    .slice(0, 16);
  return `mv-${hash}`;
}
