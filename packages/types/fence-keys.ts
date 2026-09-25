import type { ChartType } from "@markvis/ir";
import { CORE_FENCE_KEYS } from "./contract.js";

export { CORE_FENCE_KEYS };

/**
 * Type-local extras by id. Wave 1 encodings:
 * bar/line/area → layout; pie → innerRadius; scatter/hist → none.
 * Wave 2: heatmap/funnel/waterfall/radar → none; gauge → min, max.
 * Packs must keep `extras` in sync with this table (integrity test checks).
 */
export const typeExtras: Record<ChartType, readonly string[]> = {
  bar: ["layout"],
  line: ["layout"],
  area: ["layout"],
  scatter: [],
  pie: ["innerRadius"],
  hist: [],
  heatmap: [],
  funnel: [],
  waterfall: [],
  radar: [],
  gauge: ["min", "max"],
};

export function allowedFenceKeys(type: ChartType): ReadonlySet<string> {
  return new Set<string>([...CORE_FENCE_KEYS, ...typeExtras[type]]);
}
