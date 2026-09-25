import type { ChartIR } from "@markvis/ir";
import { renderSankey } from "../_paint/sankey.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const sankey: TypePack = {
  id: "sankey",
  extras: typeExtras.sankey,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderSankey(chart, svgId);
  },
};
