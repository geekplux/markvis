import type { ChartType } from "@markvis/ir";
import { bar } from "./bar/type.js";
import { line } from "./line/type.js";
import { area } from "./area/type.js";
import { scatter } from "./scatter/type.js";
import { pie } from "./pie/type.js";
import { hist } from "./hist/type.js";
import { heatmap } from "./heatmap/type.js";
import { funnel } from "./funnel/type.js";
import { waterfall } from "./waterfall/type.js";
import { radar } from "./radar/type.js";
import { gauge } from "./gauge/type.js";
import type { TypePack } from "./contract.js";

export type { Painted, TypePack } from "./contract.js";
export { CORE_FENCE_KEYS } from "./contract.js";
export { typeExtras, allowedFenceKeys } from "./fence-keys.js";

export {
  bar,
  line,
  area,
  scatter,
  pie,
  hist,
  heatmap,
  funnel,
  waterfall,
  radar,
  gauge,
};

/** id → pack. Unknown / missing packs fail loudly via resolveTypePack. */
export const typeRegistry: Record<ChartType, TypePack> = {
  bar,
  line,
  area,
  scatter,
  pie,
  hist,
  heatmap,
  funnel,
  waterfall,
  radar,
  gauge,
};

/**
 * Resolve a chart type id to its pack.
 * Missing or unregistered packs throw (loud fail) — parser already rejects
 * unknown fence ids with E_UNKNOWN_TYPE; this guards registry integrity.
 */
export function resolveTypePack(id: string): TypePack {
  const pack = (typeRegistry as Record<string, TypePack | undefined>)[id];
  if (pack == null) {
    throw new Error(
      `E_MISSING_TYPE_PACK: no pack registered for type id "${id}"`,
    );
  }
  return pack;
}
