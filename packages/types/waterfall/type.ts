import type { ChartIR } from "@markvis/ir";
import { renderWaterfall } from "../_paint/waterfall.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const waterfall: TypePack = {
  id: "waterfall",
  extras: typeExtras.waterfall,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderWaterfall(chart, svgId);
  },
};
