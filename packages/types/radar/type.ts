import type { ChartIR } from "@markvis/ir";
import { renderRadar } from "../_paint/radar.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const radar: TypePack = {
  id: "radar",
  extras: typeExtras.radar,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderRadar(chart, svgId);
  },
};
