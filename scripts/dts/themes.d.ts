export type ThemeTokens = Record<string, unknown>;
export type PaletteTokens = Record<string, unknown>;

export declare const folio: ThemeTokens;
export declare const highcharts: ThemeTokens;
export declare const shadcn: ThemeTokens;
export declare const docs: ThemeTokens;
export declare const ant: ThemeTokens;
export declare const recharts: ThemeTokens;
export declare const themeRegistry: Record<string, ThemeTokens>;
export declare function resolveThemePack(id: string): ThemeTokens;
export declare function applyPaletteToTheme(
  theme: ThemeTokens,
  palette: PaletteTokens,
): ThemeTokens;
export declare const cool: PaletteTokens;
export declare const ink: PaletteTokens;
export declare const porcelain: PaletteTokens;
export declare const vivid: PaletteTokens;
export declare const warm: PaletteTokens;
export declare const paletteRegistry: Record<string, PaletteTokens>;
export declare function resolvePalette(id: string): PaletteTokens;
