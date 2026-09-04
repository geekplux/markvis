import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";

export const SVG_WIDTH = 720;
export const SVG_HEIGHT = 480;
export const FONT =
  "ui-sans-serif, system-ui, sans-serif";

export type PlotBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type LegendItem = {
  name: string;
  color: string;
  x: number;
  y: number;
};

export type LegendLayout = {
  items: LegendItem[];
  height: number;
};

export function layoutLegend(
  names: string[],
  colors: string[],
  left: number,
  top: number,
  maxWidth: number,
): LegendLayout {
  const items: LegendItem[] = [];
  let x = left;
  let y = top;
  let rowHeight = 16;
  for (let i = 0; i < names.length; i++) {
    const name = names[i]!;
    const width = 16 + textWidth(name, 11) + 14;
    if (i > 0 && x + width > left + maxWidth) {
      x = left;
      y += 18;
    }
    items.push({
      name,
      color: colors[i] ?? "#0072B2",
      x,
      y,
    });
    x += width;
    rowHeight = y - top + 16;
  }
  return { items, height: names.length === 0 ? 0 : rowHeight };
}

export function cartesianMargins(opts: {
  yTickLabels: string[];
  xLabels: string[];
  yAxisTitle: string;
  xAxisTitle: string;
  legendHeight: number;
  rotateX: boolean;
}): { left: number; right: number; top: number; bottom: number } {
  const yTickWidth = Math.max(
    24,
    ...opts.yTickLabels.map((label) => textWidth(label, 10)),
  );
  const yTitleExtra = opts.yAxisTitle ? 16 : 0;
  const left = Math.min(
    140,
    Math.max(52, 14 + yTitleExtra + yTickWidth + 10),
  );
  const top = 36 + (opts.legendHeight > 0 ? opts.legendHeight + 8 : 0);
  let bottom = 40;
  if (opts.rotateX) {
    const longest = Math.max(
      0,
      ...opts.xLabels.map((label) => textWidth(label, 9)),
    );
    bottom = Math.min(150, 36 + Math.min(longest, 120) * 0.72 + 8);
  } else {
    bottom = 48;
  }
  if (opts.xAxisTitle) {
    bottom += 16;
  }
  return { left, right: 24, top, bottom };
}

export function shouldRotateX(labels: string[]): boolean {
  if (labels.length > 8) {
    return true;
  }
  const maxLen = Math.max(0, ...labels.map((label) => label.length));
  return maxLen > 8;
}

export function formatTickLabel(n: number): string {
  return formatNumber(n);
}
