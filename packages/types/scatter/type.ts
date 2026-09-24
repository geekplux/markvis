import type { ChartIR } from "@markvis/ir";
import { renderCartesian } from "../_paint/cartesian.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const scatter: TypePack = {
  id: "scatter",
  extras: typeExtras.scatter,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderCartesian(chart, svgId);
  },
};
