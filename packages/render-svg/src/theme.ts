import type { ChartTheme } from "@markvis/ir";
import { folio, type ThemeTokens } from "../themes/folio.js";

export type { ThemeTokens };

/** Resolve IR theme to a token table. C2: every named look still uses folio (no redesign). */
export function themeTokens(_theme: ChartTheme): ThemeTokens {
  return folio;
}
