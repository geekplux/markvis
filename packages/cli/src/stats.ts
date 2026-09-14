import { columnValues, type ChartIR } from "@markvis/ir";

export type ChartStats = {
  type: string;
  n: number;
  min: number;
  max: number;
  series: string;
};

export function chartStats(chart: ChartIR): ChartStats {
  const measure = chart.type === "hist" ? chart.x : (chart.y ?? chart.x);
  const nums = columnValues(chart.table, measure)
    .map((cell) => Number(cell.trim()))
    .filter((n) => Number.isFinite(n));
  return {
    type: chart.type,
    n: chart.table.rows.length,
    min: nums.length === 0 ? Number.NaN : Math.min(...nums),
    max: nums.length === 0 ? Number.NaN : Math.max(...nums),
    series: chart.series ?? "-",
  };
}
