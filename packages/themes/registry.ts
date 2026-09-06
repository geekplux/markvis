import type { ChartTheme } from "@markvis/ir";
import { folio, type ThemeTokens } from "./folio/theme.js";
import { highcharts } from "./highcharts/theme.js";
import { shadcn } from "./shadcn/theme.js";
import { docs } from "./docs/theme.js";

export type { ThemeTokens };
export { folio, highcharts, shadcn, docs };

/** id → pack. Unknown / missing packs fail loudly via resolveThemePack. */
export const themeRegistry: Record<ChartTheme, ThemeTokens> = {
  folio,
  highcharts,
  shadcn,
  docs,
};

/**
 * Resolve a theme id to its token pack.
 * Missing or unregistered packs throw (loud fail) — parser already rejects
 * unknown fence ids with E_UNKNOWN_THEME; this guards registry integrity.
 */
export function resolveThemePack(id: string): ThemeTokens {
  const pack = (themeRegistry as Record<string, ThemeTokens | undefined>)[id];
  if (pack == null) {
    throw new Error(
      `E_MISSING_THEME_PACK: no pack registered for theme id "${id}"`,
    );
  }
  return pack;
}
