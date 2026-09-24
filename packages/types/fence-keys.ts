import type { ChartType } from "@markvis/ir";
import { CORE_FENCE_KEYS } from "./contract.js";

export { CORE_FENCE_KEYS };

/**
 * Type-local extras by id. Wave 1 encodings:
 * bar/line/area → layout; pie → innerRadius; scatter/hist → none.
 * Packs must keep `extras` in sync with this table (integrity test checks).
 */
export const typeExtras: Record<ChartType, readonly string[]> = {
  bar: ["layout"],
  line: ["layout"],
  area: ["layout"],
  scatter: [],
  pie: ["innerRadius"],
  hist: [],
};

export function allowedFenceKeys(type: ChartType): ReadonlySet<string> {
  return new Set<string>([...CORE_FENCE_KEYS, ...typeExtras[type]]);
}
