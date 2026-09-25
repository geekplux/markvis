import type { ChartIR } from "@markvis/ir";
import { renderTreemap } from "../_paint/treemap.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const treemap: TypePack = {
  id: "treemap",
  extras: typeExtras.treemap,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderTreemap(chart, svgId);
  },
};
