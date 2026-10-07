import type { ChartIR } from "@markvis/ir";
import { renderBoxplot } from "../_paint/boxplot.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const boxplot: TypePack = {
  id: "boxplot",
  extras: typeExtras.boxplot,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderBoxplot(chart, svgId);
  },
};
