import type { ChartPalette } from "@markvis/ir";
import type { ThemeTokens } from "./folio/theme.js";

/**
 * Color-only series tables. Hex locked in docs/design/PALETTES.md — do not invent.
 * `palette=` overlays SERIES fills/strokes only; theme grammar untouched.
 */
export type PaletteTokens = {
  SERIES: readonly [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
  ];
};

export const ink: PaletteTokens = {
  SERIES: [
    "#2A2F2A",
    "#5C6560",
    "#8A9188",
    "#3D4A5C",
    "#6B5A4E",
    "#4A5C54",
    "#7A6E62",
    "#4E5560",
  ],
};

export const porcelain: PaletteTokens = {
  SERIES: [
    "#5B7C99",
    "#8FA3B0",
    "#6A8F8A",
    "#9AA4B2",
    "#7B8FA6",
    "#A8B4BC",
    "#6E7F8E",
    "#B0BEC5",
  ],
};

export const warm: PaletteTokens = {
  SERIES: [
    "#C45C26",
    "#D4892A",
    "#B33A2B",
    "#E0A05A",
    "#9C4A2F",
    "#C97B4A",
    "#A65D3A",
    "#D4A574",
  ],
};

export const cool: PaletteTokens = {
  SERIES: [
    "#2F6F8F",
    "#3D8B8C",
    "#4A6FA5",
    "#5B9AA8",
    "#3A5F7A",
    "#6B8FB8",
    "#2E7A6E",
    "#7A9BB0",
  ],
};

export const vivid: PaletteTokens = {
  SERIES: [
    "#E11D48",
    "#2563EB",
    "#16A34A",
    "#D97706",
    "#9333EA",
    "#0891B2",
    "#EA580C",
    "#4F46E5",
  ],
};

export const paletteRegistry: Record<ChartPalette, PaletteTokens> = {
  ink,
  porcelain,
  warm,
  cool,
  vivid,
};

/**
 * Resolve a palette id to its series table.
 * Missing / unregistered packs throw — parser already rejects unknown fence
 * ids with E_UNKNOWN_PALETTE; this guards registry integrity.
 */
export function resolvePalette(id: string): PaletteTokens {
  const pack = (paletteRegistry as Record<string, PaletteTokens | undefined>)[
    id
  ];
  if (pack == null) {
    throw new Error(
      `E_MISSING_PALETTE: no color table registered for palette id "${id}"`,
    );
  }
  return pack;
}

/**
 * Overlay palette series colors onto a theme grammar pack.
 * Omit / undefined → theme defaults unchanged.
 * Does not touch margins, ticks, legend, radius, grid, ink/quiet.
 */
export function applyPaletteToTheme(
  theme: ThemeTokens,
  paletteId: ChartPalette | undefined,
): ThemeTokens {
  if (paletteId === undefined) {
    return theme;
  }
  const p = resolvePalette(paletteId);
  return {
    ...theme,
    PALETTE: [...p.SERIES] as ThemeTokens["PALETTE"],
  };
}
