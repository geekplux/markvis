import type { ParseResult } from "@markvis/parser";
import { escapeHtml } from "./format.js";

export function buildPreviewHtml(opts: {
  file: string;
  source: string;
  result: ParseResult;
  svg: string | undefined;
}): string {
  const title = escapeHtml(opts.file);
  const source = escapeHtml(opts.source);
  const right = opts.result.ok
    ? validPane(opts.svg ?? "", opts.result.chart.table)
    : errorPane(opts.result.error.message, opts.result.table);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>markvis preview — ${title}</title>
  <style>
    :root { color-scheme: light; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, sans-serif; }
    .preview-layout { display: grid; grid-template-columns: 1fr 1fr; min-height: 100vh; }
    section { padding: 16px; overflow: auto; }
    section.source { background: #0f172a; color: #e2e8f0; }
    h1 { font-size: 14px; margin: 0 0 12px; }
    pre { margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 12px; }
    .error { color: #b91c1c; font-weight: 600; margin-bottom: 12px; }
    table { border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th, td { border: 1px solid #cbd5e1; padding: 4px 8px; text-align: left; }
    svg { max-width: 100%; height: auto; }
    @media (max-width: 800px) { .preview-layout { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="preview-layout">
    <section class="source">
      <h1>Source</h1>
      <pre>${source}</pre>
    </section>
    <section class="preview">
      <h1>Preview</h1>
      ${right}
    </section>
  </div>
</body>
</html>
`;
}

function validPane(
  svg: string,
  table: { columns: string[]; rows: string[][] },
): string {
  return `${svg}\n${htmlTable(table)}`;
}

function errorPane(
  message: string,
  table: { columns: string[]; rows: string[][] },
): string {
  const gfm = table.columns.length > 0 ? htmlTable(table) : "";
  return `<p class="error">${escapeHtml(message)}</p>\n${gfm}`;
}

function htmlTable(table: { columns: string[]; rows: string[][] }): string {
  if (table.columns.length === 0) {
    return "";
  }
  const head = table.columns
    .map((col) => `<th>${escapeHtml(col)}</th>`)
    .join("");
  const body = table.rows
    .map((row) => {
      const cells = table.columns
        .map((_, i) => `<td>${escapeHtml(row[i] ?? "")}</td>`)
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}


