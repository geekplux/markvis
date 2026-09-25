import type { ChartIR } from "@markvis/ir";
import { renderFunnel } from "../_paint/funnel.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const funnel: TypePack = {
  id: "funnel",
  extras: typeExtras.funnel,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderFunnel(chart, svgId);
  },
};
