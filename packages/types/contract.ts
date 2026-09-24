import type { ChartIR, ChartType } from "@markvis/ir";

/** Painted mark layer — SVG chrome wraps this in render-svg. */
export type Painted = { height: number; lines: string[] };

/**
 * Type pack contract. Wave 0: extras empty; undeclared fence headers → E_UNKNOWN_FIELD.
 * Packs own paint; chrome (aria, title/desc, data-*) stays in render-svg.
 */
export type TypePack = {
  id: ChartType;
  /** Fence keys beyond CORE; Wave 0 = empty. Undeclared header → E_UNKNOWN_FIELD. */
  extras: readonly string[];
  paint(chart: ChartIR, svgId: string): Painted;
};

/** CORE fence keys shared by every pack (plus language `markvis`). */
export const CORE_FENCE_KEYS = [
  "markvis",
  "type",
  "title",
  "theme",
  "palette",
  "unit",
  "x",
  "y",
  "series",
] as const;
