import type { ChartTheme } from "@markvis/ir";
import { folio, type ThemeTokens } from "../themes/folio.js";
import { highcharts } from "../themes/highcharts.js";

export type { ThemeTokens };

/** Resolve IR theme to a token table. C3: highcharts has its own pack; others still folio. */
export function themeTokens(theme: ChartTheme): ThemeTokens {
  if (theme === "highcharts") {
    return highcharts;
  }
  return folio;
}
