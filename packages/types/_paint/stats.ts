/** Summary of one group of observations for a box plot. */
export type BoxStats = {
  n: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  /** Furthest observations still inside 1.5 × IQR of the box. */
  whiskerLo: number;
  whiskerHi: number;
  /** Observations beyond the whiskers, in ascending order. */
  outliers: number[];
};

/**
 * Quantile by linear interpolation between order statistics (Hyndman–Fan
 * type 7, the default in numpy, R, and Excel QUARTILE.INC).
 */
export function quantile(sorted: readonly number[], p: number): number {
  if (sorted.length === 0) {
    return Number.NaN;
  }
  const h = (sorted.length - 1) * p;
  const lo = Math.floor(h);
  const hi = Math.min(lo + 1, sorted.length - 1);
  return sorted[lo]! + (h - lo) * (sorted[hi]! - sorted[lo]!);
}

/** Tukey box: quartiles, whiskers at the furthest points within 1.5 × IQR, the rest outliers. */
export function boxStats(values: readonly number[]): BoxStats | null {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return null;
  }
  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const loFence = q1 - 1.5 * iqr;
  const hiFence = q3 + 1.5 * iqr;
  const inside = sorted.filter((v) => v >= loFence && v <= hiFence);
  return {
    n: sorted.length,
    min: sorted[0]!,
    q1,
    median: quantile(sorted, 0.5),
    q3,
    max: sorted[sorted.length - 1]!,
    whiskerLo: inside[0] ?? q1,
    whiskerHi: inside[inside.length - 1] ?? q3,
    outliers: sorted.filter((v) => v < loFence || v > hiFence),
  };
}
