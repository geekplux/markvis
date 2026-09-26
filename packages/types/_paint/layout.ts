import { formatNumber } from "./scale.js";
import { textWidth, wrapText } from "./text.js";
import {
  AXIS_TITLES,
  BAR_LABEL_MID_MIN_W,
  BAR_LABEL_MIN_WIDTH,
  BAR_LABEL_N_OFF,
  BAR_LABEL_N_ON,
  FONT,
  LABEL_MIN_GAP,
  LABEL_ROTATE_DEG,
  LEGEND_BELOW,
  MARGIN,
  PALETTE,
  PLOT_MIN_RATIO,
  ROTATE_LINE_HEIGHT,
  SVG_HEIGHT,
  SVG_HEIGHT_MAX,
  SVG_WIDTH,
  TICK_TEXT_GAP,
  TITLE_BASELINE,
  TITLE_TO_PLOT,
  TYPE,
} from "./tokens.js";

export { FONT, SVG_HEIGHT, SVG_WIDTH };

export type PlotBox = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
};

export type Painted = {
  lines: string[];
  height: number;
};

export type LegendItem = {
  name: string;
  color: string;
  opacity: number;
  x: number;
  y: number;
};

export type LegendLayout = {
  items: LegendItem[];
  height: number;
};

export type CategoryLayout = {
  /** Rotation is not used. Long labels wrap or truncate. */
  rotate: boolean;
  show: boolean[];
  lines: string[][];
  full: string[];
};

export type Frame = {
  width: number;
  height: number;
  plot: PlotBox;
  rotateX: boolean;
  show: boolean[];
  labelLines: string[][];
  fullLabels: string[];
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export function layoutLegend(
  names: string[],
  colors: string[],
  opacities: number[],
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
    const width = 16 + textWidth(name, TYPE.legend.size) + 14;
    if (i > 0 && x + width > left + maxWidth) {
      x = left;
      y += 18;
    }
    items.push({
      name,
      color: colors[i] ?? PALETTE[0]!,
      opacity: opacities[i] ?? 1,
      x,
      y,
    });
    x += width;
    rowHeight = y - top + 16;
  }
  return { items, height: names.length === 0 ? 0 : rowHeight };
}

function labelsOverlapZero(widths: number[], catStep: number): boolean {
  if (widths.length === 0) {
    return false;
  }
  for (const width of widths) {
    if (width > catStep - LABEL_MIN_GAP) {
      return true;
    }
  }
  for (let i = 0; i < widths.length - 1; i++) {
    const needed = widths[i]! / 2 + widths[i + 1]! / 2 + LABEL_MIN_GAP;
    if (needed > catStep) {
      return true;
    }
  }
  return false;
}

function labelsOverlapRotated(catStep: number): boolean {
  const rad = (Math.abs(LABEL_ROTATE_DEG) * Math.PI) / 180;
  return catStep * Math.sin(rad) < ROTATE_LINE_HEIGHT;
}

export function categoryLayout(
  labels: string[],
  catStep: number,
): CategoryLayout {
  const maxWidth = Math.max(catStep - LABEL_MIN_GAP, TYPE.tick.size);
  const wrapped = labels.map((label) =>
    wrapText(label, TYPE.tick.size, maxWidth, 3),
  );
  return {
    rotate: false,
    show: labels.map(() => true),
    lines: wrapped.map((item) => item.lines),
    full: labels,
  };
}

export function tickLeftMargin(
  yTickLabels: string[],
  axisTitles: boolean = AXIS_TITLES,
): number {
  const yTickWidth = Math.max(
    0,
    ...yTickLabels.map((label) => textWidth(label, TYPE.tick.size)),
  );
  const axisPad = axisTitles ? 18 : 0;
  return Math.max(MARGIN.left, yTickWidth + TICK_TEXT_GAP) + axisPad;
}

export function categoryBottomMargin(layout: CategoryLayout): number {
  const axisPad = AXIS_TITLES ? 18 : 0;
  const lineCount = Math.max(
    1,
    ...layout.lines.map((lines) => Math.max(lines.length, 1)),
  );
  return lineCount * (TYPE.tick.size + 3) + 10 + axisPad;
}

export let TITLE_LINE_COUNT = 1;

export function setTitleLineCount(count: number): void {
  TITLE_LINE_COUNT = Math.max(1, count);
}

export function titleBlockTop(legendHeight: number, legendBelow: boolean = LEGEND_BELOW): number {
  const extra = Math.max(0, TITLE_LINE_COUNT - 1) * (TYPE.title.size + 6);
  const base = TITLE_BASELINE + extra + TITLE_TO_PLOT;
  if (legendBelow) {
    return base;
  }
  if (legendHeight > 0) {
    return base + 8 + legendHeight;
  }
  return base;
}

export function fitFrameHeight(top: number, bottom: number): number {
  const chrome = top + bottom;
  const needed = chrome / (1 - PLOT_MIN_RATIO);
  const rounded = Math.ceil(needed);
  return Math.max(SVG_HEIGHT, rounded);
}

export function layoutFrame(opts: {
  yTickLabels: string[];
  categoryLabels: string[];
  legendHeight: number;
  rightMin?: number;
  axisTitles?: boolean;
}): Frame {
  const width = SVG_WIDTH;
  const axisTitles = opts.axisTitles ?? AXIS_TITLES;
  const left = tickLeftMargin(opts.yTickLabels, axisTitles);
  const right = Math.max(MARGIN.right, opts.rightMin ?? MARGIN.right);
  const top = titleBlockTop(opts.legendHeight, LEGEND_BELOW);
  const draftW = Math.max(width - left - right, 1);
  const nCat = Math.max(opts.categoryLabels.length, 1);
  const catLay =
    opts.categoryLabels.length > 0
      ? categoryLayout(opts.categoryLabels, draftW / nCat)
      : { rotate: false, show: [] as boolean[], lines: [] as string[][], full: [] as string[] };
  let bottom = categoryBottomMargin(catLay);
  if (axisTitles) {
    bottom += 18;
  }
  if (LEGEND_BELOW && opts.legendHeight > 0) {
    bottom += opts.legendHeight + 8;
  }
  const height = fitFrameHeight(top, bottom);
  const plot: PlotBox = {
    left,
    right: width - right,
    top,
    bottom: height - bottom,
    width: width - left - right,
    height: height - top - bottom,
  };
  return {
    width,
    height,
    plot,
    rotateX: catLay.rotate,
    show: catLay.show,
    labelLines: catLay.lines,
    fullLabels: catLay.full,
    left,
    right,
    top,
    bottom,
  };
}

/** Dual encoding: labels XOR interior y-grid on bar/hist. */
export function showBarValueLabels(nCat: number, barWidth: number): boolean {
  if (barWidth < BAR_LABEL_MIN_WIDTH) {
    return false;
  }
  if (nCat <= BAR_LABEL_N_ON) {
    return true;
  }
  if (nCat > BAR_LABEL_N_OFF) {
    return false;
  }
  return barWidth >= BAR_LABEL_MID_MIN_W;
}

export function formatTickLabel(n: number): string {
  return formatNumber(n);
}
