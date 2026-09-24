import type { ChartIR } from "@markvis/ir";
import { renderCartesian } from "../_paint/cartesian.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const hist: TypePack = {
  id: "hist",
  extras: typeExtras.hist,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderCartesian(chart, svgId);
  },
};
