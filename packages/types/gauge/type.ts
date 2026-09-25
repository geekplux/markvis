import type { ChartIR } from "@markvis/ir";
import { renderGauge } from "../_paint/gauge.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const gauge: TypePack = {
  id: "gauge",
  extras: typeExtras.gauge,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderGauge(chart, svgId);
  },
};
