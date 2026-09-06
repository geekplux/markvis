import { isChartTheme, type ChartTheme, THEMES } from "@markvis/ir";

export { THEMES };
export type { ChartTheme };

const FENCE_RE =
  /(```(?:chart|markvis|vis)[ \t]*\r?\n)([\s\S]*?)(\r?\n```)/;

const THEME_HEADER_RE = /^[ \t]*theme:[ \t]*(\S+)[ \t]*$/m;

export function readThemeFromFence(source: string): ChartTheme {
  const body = fenceBodyOrSource(source);
  const match = body.match(THEME_HEADER_RE);
  const raw = match?.[1];
  if (raw && isChartTheme(raw)) {
    return raw;
  }
  return "folio";
}

export function rewriteThemeInFence(
  source: string,
  theme: ChartTheme,
): string {
  if (!isChartTheme(theme)) {
    return source;
  }
  const match = FENCE_RE.exec(source);
  if (!match || match.index === undefined) {
    return rewriteThemeInBody(source, theme);
  }
  const [full, open, body, close] = match;
  const nextBody = rewriteThemeInBody(body, theme);
  return (
    source.slice(0, match.index) +
    open +
    nextBody +
    close +
    source.slice(match.index + full.length)
  );
}

function fenceBodyOrSource(source: string): string {
  const match = FENCE_RE.exec(source);
  return match?.[2] ?? source;
}

function rewriteThemeInBody(body: string, theme: ChartTheme): string {
  if (THEME_HEADER_RE.test(body)) {
    return body.replace(THEME_HEADER_RE, `theme: ${theme}`);
  }
  if (/^[ \t]*markvis:[ \t]*.*$/m.test(body)) {
    return body.replace(
      /^[ \t]*markvis:[ \t]*.*$/m,
      (line) => `${line}\ntheme: ${theme}`,
    );
  }
  if (body.length === 0) {
    return `theme: ${theme}`;
  }
  return `theme: ${theme}\n${body}`;
}
