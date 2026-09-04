import { formatNumber } from "./scale.js";
import { textWidth } from "./text.js";
import {
  BAR_LABEL_MID_MIN_W,
  BAR_LABEL_MIN_WIDTH,
  BAR_LABEL_N_OFF,
  BAR_LABEL_N_ON,
  FONT,
  LABEL_MIN_GAP,
  LABEL_ROTATE_DEG,
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
  rotate: boolean;
  show: boolean[];
};

export type Frame = {
  width: number;
  height: number;
  plot: PlotBox;
  rotateX: boolean;
  show: boolean[];
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
  const showAll = labels.map(() => true);
  if (labels.length <= 1) {
    const width = labels[0] ? textWidth(labels[0], TYPE.tick.size) : 0;
    if (width > catStep - LABEL_MIN_GAP && labels.length === 1) {
      return { rotate: true, show: showAll };
    }
    return { rotate: false, show: showAll };
  }
  const widths = labels.map((label) => textWidth(label, TYPE.tick.size));
  if (!labelsOverlapZero(widths, catStep)) {
    return { rotate: false, show: showAll };
  }
  if (!labelsOverlapRotated(catStep)) {
    return { rotate: true, show: showAll };
  }
  return {
    rotate: true,
    show: labels.map((_, i) => i % 2 === 0),
  };
}

export function tickLeftMargin(yTickLabels: string[]): number {
  const yTickWidth = Math.max(
    0,
    ...yTickLabels.map((label) => textWidth(label, TYPE.tick.size)),
  );
  return Math.max(MARGIN.left, yTickWidth + TICK_TEXT_GAP);
}

export function categoryBottomMargin(
  labels: string[],
  rotate: boolean,
): number {
  if (labels.length === 0) {
    return TYPE.tick.size + 12;
  }
  if (rotate) {
    const longest = Math.max(
      0,
      ...labels.map((label) => textWidth(label, TYPE.tick.size)),
    );
    const rad = (Math.abs(LABEL_ROTATE_DEG) * Math.PI) / 180;
    return Math.sin(rad) * longest + 12;
  }
  return TYPE.tick.size + 12;
}

export function titleBlockTop(legendHeight: number): number {
  if (legendHeight > 0) {
    return TITLE_BASELINE + 8 + legendHeight + TITLE_TO_PLOT;
  }
  return TITLE_BASELINE + TITLE_TO_PLOT;
}

export function fitFrameHeight(top: number, bottom: number): number {
  const chrome = top + bottom;
  const needed = chrome / (1 - PLOT_MIN_RATIO);
  const rounded = Math.ceil(needed);
  return Math.min(SVG_HEIGHT_MAX, Math.max(SVG_HEIGHT, rounded));
}

export function layoutFrame(opts: {
  yTickLabels: string[];
  categoryLabels: string[];
  legendHeight: number;
  rightMin?: number;
}): Frame {
  const width = SVG_WIDTH;
  const left = tickLeftMargin(opts.yTickLabels);
  const right = Math.max(MARGIN.right, opts.rightMin ?? MARGIN.right);
  const top = titleBlockTop(opts.legendHeight);
  const draftW = Math.max(width - left - right, 1);
  const nCat = Math.max(opts.categoryLabels.length, 1);
  const catLay =
    opts.categoryLabels.length > 0
      ? categoryLayout(opts.categoryLabels, draftW / nCat)
      : { rotate: false, show: [] as boolean[] };
  const bottom = categoryBottomMargin(opts.categoryLabels, catLay.rotate);
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
