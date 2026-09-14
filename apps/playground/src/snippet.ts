import { escapeHtml } from "./preview.js";

export function fenceBody(source: string): string {
  const match = source.match(
    /```(?:chart|markvis|vis)[ \t]*\r?\n([\s\S]*?)\r?\n```/,
  );
  return (match?.[1] ?? source).trimEnd();
}

export function dropinSnippet(
  source: string,
  scriptSrc = "./markvis.min.js",
): string {
  const body = fenceBody(source);
  return `<pre><code class="language-chart">${escapeHtml(body)}\n</code></pre>\n<script src="${scriptSrc}"></script>\n`;
}
