import type { ChartIR } from "@markvis/ir";
import { renderPie } from "../_paint/pie.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const pie: TypePack = {
  id: "pie",
  extras: typeExtras.pie,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderPie(chart, svgId);
  },
};
