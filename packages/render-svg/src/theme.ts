import type { ChartPalette, ChartTheme } from "@markvis/ir";
import {
  applyPaletteToTheme,
  resolveThemePack,
  type ThemeTokens,
} from "@markvis/themes";

export type { ThemeTokens };

/** Resolve IR theme (+ optional palette) to a token table via packages/themes. */
export function themeTokens(
  theme: ChartTheme,
  palette?: ChartPalette,
): ThemeTokens {
  return applyPaletteToTheme(resolveThemePack(theme), palette);
}
