import { mkdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, posix, relative, sep } from "node:path";
import { extractCharts, parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

const IMAGE_RE = /^\s*!\[([^\]]*)\]\(([^)]+)\)[ \t]*\r?\n?/;

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

function posixRel(fromDir: string, toFile: string): string {
  const rel = relative(fromDir, toFile).split(sep).join(posix.sep);
  return rel.startsWith(".") ? rel : `./${rel}`;
}

function svgName(stem: string, index: number, total: number): string {
  if (total === 1) {
    return `${stem}.svg`;
  }
  return `${stem}-${index + 1}.svg`;
}

function alreadyHasImage(after: string, svgRel: string): boolean {
  const rest = after.replace(/^\r?\n/, "");
  const match = rest.match(IMAGE_RE);
  if (!match) {
    return false;
  }
  const href = match[2]!.trim();
  const a = href.replace(/^\.\//, "");
  const b = svgRel.replace(/^\.\//, "");
  return a === b;
}

function imageLine(title: string, svgRel: string): string {
  const alt = title.replace(/]/g, "");
  return `![${alt}](${svgRel})\n`;
}

export function bakeMarkdown(source: string, mdAbs: string): BakeFileResult {
  const charts = extractCharts(source);
  const stem = basename(mdAbs).replace(/\.md$/i, "");
  const dir = dirname(mdAbs);
  const total = charts.length;
  const results: BakeChartResult[] = [];
  const errors: string[] = [];
  let md = source;

  for (let i = charts.length - 1; i >= 0; i--) {
    const extracted = charts[i]!;
    const parsed = parseMarkdown(extracted.raw, {
      filename: basename(mdAbs),
    });
    const name = svgName(stem, i, total);
    const svgAbs = join(dir, name);
    const svgRel = posixRel(dir, svgAbs);
    const insertAt = extracted.index + extracted.raw.length;

    if (!parsed.ok) {
      errors.push(parsed.error.code);
      continue;
    }

    const svg = renderSvg(parsed.chart);
    const after = md.slice(insertAt);
    const inserted = !alreadyHasImage(after, svgRel);
    results.push({ svgRel, svgAbs, svg, inserted });

    if (inserted) {
      const needsNl = extracted.raw.endsWith("\n") ? "" : "\n";
      const extraBlank =
        after.startsWith("\n") || after.startsWith("\r\n") || after.length === 0
          ? ""
          : "\n";
      const line = imageLine(parsed.chart.title, svgRel);
      md =
        md.slice(0, insertAt) + needsNl + extraBlank + line + md.slice(insertAt);
    }
  }

  results.reverse();
  return {
    mdAbs,
    md,
    mdChanged: md !== source,
    charts: results,
    errors,
  };
}

export function writeBake(result: BakeFileResult): void {
  for (const chart of result.charts) {
    mkdirSync(dirname(chart.svgAbs), { recursive: true });
    writeFileSync(chart.svgAbs, chart.svg, "utf8");
  }
  if (result.mdChanged) {
    writeFileSync(result.mdAbs, result.md, "utf8");
  }
}
