import { parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";
import { autoReplace, init, replaceInDocument, replaceLanguageBlocks } from "./dom.js";
import { enhanceChartSvg, tipTextForMark } from "./enhance.js";
import {
  chartBlockHtml,
  escapeHtml,
  htmlTable,
  resultToHtml,
  wrapFence,
} from "./html.js";

export {
  autoReplace,
  chartBlockHtml,
  enhanceChartSvg,
  escapeHtml,
  htmlTable,
  init,
  parseMarkdown,
  renderSvg,
  replaceInDocument,
  replaceLanguageBlocks,
  resultToHtml,
  tipTextForMark,
  wrapFence,
};

autoReplace();
