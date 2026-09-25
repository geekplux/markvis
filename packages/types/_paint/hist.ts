import { columnValues, type ChartIR } from "@markvis/ir";
import { cleanFloat } from "./scale.js";

export type HistSample = {
  value: number;
  weight: number;
};

export type HistBin = {
  left: number;
  right: number;
  weight: number;
  count: number;
};

/**
 * Histogram binning (deterministic).
 *
 * 1. Each finite x becomes a sample. Weight is Number(y) when y is set,
 *    otherwise 1. Non-finite weights become 0. Input rows are never sorted.
 * 2. n = sample count. If n === 0, return no bins.
 * 3. vmin / vmax = min / max of sample values.
 * 4. Bin count k = clamp(ceil(log2(n) + 1), 1, 20)  (Sturges).
 * 5. If vmin === vmax: one bin [vmin - 0.5, vmax + 0.5] holding all weight
 *    so a zero-range sample still draws a visible bar.
 * 6. Else width = (vmax - vmin) / k. Bin i has
 *      left  = vmin + i * width
 *      right = vmin + (i + 1) * width
 *    A value maps to i = min(k - 1, max(0, floor((value - vmin) / width))),
 *    so the last bin includes vmax.
 * 7. Bins stay in increasing-x order. Optional y is mass, not a second axis.
 */
export function binHistogram(samples: HistSample[]): HistBin[] {
  if (samples.length === 0) {
    return [];
  }
  let vmin = samples[0]!.value;
  let vmax = samples[0]!.value;
  for (const sample of samples) {
    if (sample.value < vmin) {
      vmin = sample.value;
    }
    if (sample.value > vmax) {
      vmax = sample.value;
    }
  }
  if (vmin === vmax) {
    let weight = 0;
    for (const sample of samples) {
      weight += sample.weight;
    }
    return [
      {
        left: cleanFloat(vmin - 0.5),
        right: cleanFloat(vmax + 0.5),
        weight,
        count: samples.length,
      },
    ];
  }
  const n = samples.length;
  const k = Math.min(20, Math.max(1, Math.ceil(Math.log2(n) + 1)));
  const width = (vmax - vmin) / k;
  const bins: HistBin[] = [];
  for (let i = 0; i < k; i++) {
    bins.push({
      left: cleanFloat(vmin + i * width),
      right: cleanFloat(vmin + (i + 1) * width),
      weight: 0,
      count: 0,
    });
  }
  for (const sample of samples) {
    let index = Math.floor((sample.value - vmin) / width);
    if (index < 0) {
      index = 0;
    }
    if (index >= k) {
      index = k - 1;
    }
    const bin = bins[index]!;
    bin.weight += sample.weight;
    bin.count += 1;
  }
  return bins;
}

export function histSamplesFromChart(chart: ChartIR): HistSample[] {
  const xValues = columnValues(chart.table, chart.x);
  const yValues =
    chart.y === undefined
      ? undefined
      : columnValues(chart.table, chart.y);
  const samples: HistSample[] = [];
  for (let i = 0; i < xValues.length; i++) {
    const value = Number((xValues[i] ?? "").trim());
    if (!Number.isFinite(value)) {
      continue;
    }
    let weight = 1;
    if (yValues) {
      const parsed = Number((yValues[i] ?? "").trim());
      weight = Number.isFinite(parsed) ? parsed : 0;
    }
    samples.push({ value, weight });
  }
  return samples;
}
