/**
 * Play paint path — re-exports shared previewSource from @markvis/browser
 * so Examples detail and Play never fork parse→render.
 */
export {
  copyFence,
  copySvg,
  escapeHtml,
  htmlTable,
  previewSource,
  type PlaygroundView,
  type PreviewView,
} from "@markvis/browser/preview";
