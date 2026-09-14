export declare const VERSION: string;
export declare const USAGE: string;
export declare const STATS_HEADER: string;

export type CliContext = {
  cwd: string;
  stdout: { write(chunk: string): void };
  stderr: { write(chunk: string): void };
  open?: (path: string) => void;
};

export declare function runCli(
  argv: string[],
  ctx?: Partial<CliContext>,
): number;

export declare class CliError extends Error {
  constructor(message: string);
}

export type BakeChartResult = {
  svgRel: string;
  svgAbs: string;
  svg: string;
  inserted: boolean;
};

export type BakeFileResult = {
  mdAbs: string;
  md: string;
  mdChanged: boolean;
  charts: BakeChartResult[];
  errors: string[];
};

export declare function bakeMarkdown(
  source: string,
  mdAbs: string,
): BakeFileResult;
export declare function writeBake(result: BakeFileResult): void;
export declare function collectMarkdownFiles(
  paths: string[],
  cwd: string,
): string[];
export declare function collectSvgFiles(paths: string[], cwd: string): string[];
export declare function displayPath(abs: string, cwd: string): string;
export type GalleryItem = { name: string; svg: string };
export declare function buildGalleryHtml(items: GalleryItem[]): string;
export type ChartStats = {
  type: string;
  n: number;
  min: number;
  max: number;
  series: string;
};
export declare function chartStats(chart: unknown): ChartStats;
export declare function failureToGfm(result: unknown): string;
export declare function formatStatsRow(file: string, stats: ChartStats): string;
export declare function tableToGfm(table: {
  columns: string[];
  rows: string[][];
}): string;
export declare function buildPreviewHtml(input: unknown): string;
