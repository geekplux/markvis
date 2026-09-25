import type { ChartIR } from "@markvis/ir";
import { renderHeatmap } from "../_paint/heatmap.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const heatmap: TypePack = {
  id: "heatmap",
  extras: typeExtras.heatmap,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderHeatmap(chart, svgId);
  },
};
