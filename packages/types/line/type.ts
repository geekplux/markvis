import type { ChartIR } from "@markvis/ir";
import { renderCartesian } from "../_paint/cartesian.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const line: TypePack = {
  id: "line",
  extras: typeExtras.line,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderCartesian(chart, svgId);
  },
};
