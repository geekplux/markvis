import type { ChartIR } from "./ir.js";

export type RenderOptions = {
  width?: number;
  surface?: "light" | "dark" | "export";
  /**
   * How colors are written. "host" (default) adds a `style` that reads the
   * page's `--markvis-*` CSS variables, with the fixed colors as fallbacks.
   * "static" writes fixed colors only. `surface: "export"` defaults
   * to "static".
   */
  colors?: "host" | "static";
};

export declare function renderSvg(chart: ChartIR, options?: RenderOptions): string;
