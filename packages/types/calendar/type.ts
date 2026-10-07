import type { ChartIR } from "@markvis/ir";
import { renderCalendar } from "../_paint/calendar.js";
import type { Painted, TypePack } from "../contract.js";
import { typeExtras } from "../fence-keys.js";

export const calendar: TypePack = {
  id: "calendar",
  extras: typeExtras.calendar,
  paint(chart: ChartIR, svgId: string): Painted {
    return renderCalendar(chart, svgId);
  },
};
