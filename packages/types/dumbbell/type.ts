import type { ChartIR } from "@markvis/ir";
import { renderDumbbell } from "../_paint/dumbbell.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const dumbbell: TypePack = {
  id: "dumbbell",
  extras: typeExtras.dumbbell,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderDumbbell(chart, svgId);
  },
};
