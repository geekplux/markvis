import type { ChartTheme } from "@markvis/ir";
import { folio, type ThemeTokens } from "../themes/folio.js";
import { highcharts } from "../themes/highcharts.js";
import { shadcn } from "../themes/shadcn.js";

export type { ThemeTokens };

/** Resolve IR theme to a token table. C4: shadcn has its own pack; docs still folio. */
export function themeTokens(theme: ChartTheme): ThemeTokens {
  if (theme === "highcharts") {
    return highcharts;
  }
  if (theme === "shadcn") {
    return shadcn;
  }
  return folio;
}
