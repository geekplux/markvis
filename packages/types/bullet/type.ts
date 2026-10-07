import type { ChartIR } from "@markvis/ir";
import { renderBullet } from "../_paint/bullet.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const bullet: TypePack = {
  id: "bullet",
  extras: typeExtras.bullet,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderBullet(chart, svgId);
  },
};
