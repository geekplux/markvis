import type { ChartIR } from "@markvis/ir";
import { sha256Hex } from "./sha256.js";
import { canonicalJson } from "./xml.js";

/** Stable id from a SHA-256 of the canonical IR. No clocks or random. */
export function chartId(chart: ChartIR): string {
  return `mv-${sha256Hex(canonicalJson(chart)).slice(0, 16)}`;
}
