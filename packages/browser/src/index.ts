import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import {
  autoReplace,
  init,
  initialize,
  isChartBlock,
  renderWithDefaults as render,
  replaceInDocument,
  replaceLanguageBlocks,
  run,
} from "./dom.js";
import { enhanceChartSvg, tipTextForMark } from "./enhance.js";
import {
  chartBlockHtml,
  escapeHtml,
  htmlTable,
  resultToHtml,
  wrapFence,
} from "./html.js";

// The ES module draws nothing on import; call run() (the classic script
// in iife.ts runs on load).
export {
  autoReplace,
  chartBlockHtml,
  enhanceChartSvg,
  escapeHtml,
  htmlTable,
  init,
  initialize,
  isChartBlock,
  parseMarkdown,
  render,
  renderSvg,
  replaceInDocument,
  replaceLanguageBlocks,
  resultToHtml,
  run,
  tipTextForMark,
  wrapFence,
};
