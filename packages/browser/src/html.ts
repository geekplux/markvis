import { chartBlockHtml as blockHtml } from "@markvis/html";

export { escapeHtml, htmlTable, resultToHtml } from "@markvis/html";

export const LANGS = ["chart", "markvis", "vis"] as const;
export type ChartLang = (typeof LANGS)[number];

export function isChartLang(value: string): value is ChartLang {
  return value === "chart" || value === "markvis" || value === "vis";
}

export function unescapeHtml(value: string): string {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

export function wrapFence(body: string, lang: string = "chart"): string {
  const trimmed = body.replace(/^﻿/, "").replace(/^\n/, "");
  const t = trimmed.trim();
  if (/^```(?:chart|markvis|vis)\b/i.test(t)) {
    return trimmed;
  }
  if (/^<!--\s*(?:chart|markvis|vis)\s*:/i.test(t)) {
    return trimmed;
  }
  const tag = isChartLang(lang.toLowerCase()) ? lang.toLowerCase() : "chart";
  const inner = trimmed.endsWith("\n") ? trimmed : `${trimmed}\n`;
  return `\`\`\`${tag}\n${inner}\`\`\``;
}

export function chartBlockHtml(
  raw: string,
  filename?: string,
  lang: string = "chart",
): string {
  return blockHtml(wrapFence(raw, lang), filename);
}
