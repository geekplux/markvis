import type { ChartIR } from "./ir.js";

export type RenderOptions = {
  width?: number;
  surface?: "light" | "dark" | "export";
};

export declare function renderSvg(chart: ChartIR, options?: RenderOptions): string;
