import type { ChartTheme } from "@markvis/ir";
import { folio, type ThemeTokens } from "../themes/folio.js";
import { highcharts } from "../themes/highcharts.js";
import { shadcn } from "../themes/shadcn.js";
import { docs } from "../themes/docs.js";

export type { ThemeTokens };

/** Resolve IR theme to a token table. C5: docs has its own pack. */
export function themeTokens(theme: ChartTheme): ThemeTokens {
  if (theme === "highcharts") {
    return highcharts;
  }
  if (theme === "shadcn") {
    return shadcn;
  }
  if (theme === "docs") {
    return docs;
  }
  return folio;
}
