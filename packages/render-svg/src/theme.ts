import type { ChartTheme } from "@markvis/ir";
import {
  resolveThemePack,
  type ThemeTokens,
} from "@markvis/themes";

export type { ThemeTokens };

/** Resolve IR theme to a token table via packages/themes registry. */
export function themeTokens(theme: ChartTheme): ThemeTokens {
  return resolveThemePack(theme);
}
