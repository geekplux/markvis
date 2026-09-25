import type { ChartIR } from "@markvis/ir";
import { renderHorizontalBar } from "../_paint/bar-horizontal.js";
import { renderCartesian } from "../_paint/cartesian.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const bar: TypePack = {
  id: "bar",
  extras: typeExtras.bar,
  paint(chart: ChartIR, svgId: string): Painted {
    if (chart.orient === "horizontal") {
      return renderHorizontalBar(chart, svgId);
    }
    return renderCartesian(chart, svgId);
  },
};
