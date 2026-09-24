import type { ChartIR } from "@markvis/ir";
import { renderCartesian } from "../_paint/cartesian.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const bar: TypePack = {
  id: "bar",
  extras: typeExtras.bar,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderCartesian(chart, svgId);
  },
};
