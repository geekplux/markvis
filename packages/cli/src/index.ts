export { bakeMarkdown, writeBake } from "./bake.js";
export type { BakeChartResult, BakeFileResult } from "./bake.js";
export { runCli, USAGE, VERSION } from "./cli.js";
export type { CliContext } from "./cli.js";
export {
  collectMarkdownFiles,
  collectSvgFiles,
  displayPath,
  CliError,
} from "./files.js";
export { buildGalleryHtml } from "./gallery.js";
export type { GalleryItem } from "./gallery.js";
export { chartStats } from "./stats.js";
export type { ChartStats } from "./stats.js";
export {
  STATS_HEADER,
  failureToGfm,
  formatStatsRow,
  tableToGfm,
} from "./format.js";
export { buildPreviewHtml } from "./preview.js";
