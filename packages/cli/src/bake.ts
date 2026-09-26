import { existsSync, mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import { basename, dirname, join, posix, relative, sep } from "node:path";
import { extractCharts, parseMarkdown } from "@markvis/parser";
import { renderSvg } from "@markvis/render-svg";

const IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/;

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
  /** Owned SVG paths that no chart references after this bake. */
  remove: string[];
};

function posixRel(fromDir: string, toFile: string): string {
  const rel = relative(fromDir, toFile).split(sep).join(posix.sep);
  return rel.startsWith(".") ? rel : `./${rel}`;
}

function desiredName(stem: string, index: number, total: number): string {
  if (total === 1) {
    return `${stem}.svg`;
  }
  return `${stem}-${index + 1}.svg`;
}

function imageLine(title: string, svgRel: string, withMarker: boolean): string {
  const alt = title.replace(/]/g, "");
  const image = `![${alt}](${svgRel})\n`;
  return withMarker ? `${image}<!-- markvis-asset -->\n` : image;
}

function isExternal(href: string): boolean {
  return (
    href.startsWith("http:") ||
    href.startsWith("https:") ||
    href.startsWith("//") ||
    href.startsWith("data:")
  );
}

function ownedHref(href: string, stem: string): boolean {
  if (isExternal(href) || href.includes("..")) {
    return false;
  }
  const base = href.split("/").pop() ?? "";
  if (base === `${stem}.svg`) {
    return true;
  }
  return new RegExp(`^${stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}-\\d+\\.svg$`).test(
    base,
  );
}

function safeInside(dir: string, abs: string): boolean {
  const rel = relative(dir, abs);
  return rel !== "" && !rel.startsWith("..") && !rel.startsWith(`..${sep}`) && !abs.includes("\0");
}

type GapImage = {
  alt: string;
  href: string;
  start: number;
  end: number;
};

function firstImage(gap: string): GapImage | null {
  return imagesIn(gap)[0] ?? null;
}

function imagesIn(gap: string): GapImage[] {
  const found: GapImage[] = [];
  let cursor = 0;
  while (cursor < gap.length) {
    const match = IMAGE_RE.exec(gap.slice(cursor));
    if (!match) {
      break;
    }
    found.push({
      alt: match[1] ?? "",
      href: match[2] ?? "",
      start: cursor + match.index,
      end: cursor + match.index + match[0].length,
    });
    cursor += match.index + match[0].length;
  }
  return found;
}

function consumeLine(md: string, absEnd: number): number {
  let end = absEnd;
  if (md[end] === "\r") {
    end += 1;
  }
  if (md[end] === "\n") {
    end += 1;
  }
  const marker = /^<!-- markvis-asset -->\r?\n?/.exec(md.slice(end));
  if (marker) {
    end += marker[0].length;
  }
  return end;
}

function gapEnd(source: string, from: number, nextIndex: number | undefined): number {
  if (nextIndex === undefined) {
    return source.length;
  }
  return Math.max(from, Math.min(nextIndex, source.length));
}

export function bakeMarkdown(source: string, mdAbs: string): BakeFileResult {
  const charts = extractCharts(source);
  const stem = basename(mdAbs).replace(/\.md$/i, "");
  const dir = dirname(mdAbs);
  const total = charts.length;
  const results: BakeChartResult[] = [];
  const errors: string[] = [];
  const remove = new Set<string>();
  let md = source;

  const previousOwned: string[] = [];
  for (let i = 0; i < charts.length; i++) {
    const extracted = charts[i]!;
    const start = extracted.index + extracted.raw.length;
    const next = charts[i + 1]?.index;
    const gap = source.slice(start, gapEnd(source, start, next));
    const image = firstImage(gap);
    if (image && ownedHref(image.href, stem)) {
      previousOwned.push(join(dir, image.href.replace(/^\.\//, "")));
    }
  }

  for (let i = charts.length - 1; i >= 0; i--) {
    const extracted = charts[i]!;
    const parsed = parseMarkdown(extracted.raw, {
      filename: basename(mdAbs),
    });
    const name = desiredName(stem, i, total);
    const svgAbs = join(dir, name);
    const svgRel = posixRel(dir, svgAbs);
    const fenceEnd = extracted.index + extracted.raw.length;
    const next = i + 1 < charts.length ? charts[i + 1]!.index : undefined;
    // Offsets are from the original source. Edits happen at the end of the
    // file first, so earlier fence offsets stay valid.
    const gapFrom = fenceEnd;
    const gapTo = gapEnd(md, gapFrom, next);
    const gap = md.slice(gapFrom, gapTo);
    const image = firstImage(gap);

    if (!parsed.ok) {
      errors.push(`${i + 1}:${parsed.error.code}`);
      continue;
    }

    const svg = renderSvg(parsed.chart);
    const alt = parsed.chart.title.replace(/]/g, "");
    let inserted = false;

    if (image && ownedHref(image.href, stem)) {
      const already =
        image.href === svgRel &&
        image.alt === alt;
      if (!already) {
        const replacement = `![${alt}](${svgRel})`;
        md =
          md.slice(0, gapFrom + image.start) +
          replacement +
          md.slice(gapFrom + image.end);
      }
      const oldAbs = join(dir, image.href.replace(/^\.\//, ""));
      if (oldAbs !== svgAbs) {
        remove.add(oldAbs);
      }
    } else if (image && !ownedHref(image.href, stem)) {
      inserted = false;
    } else {
      inserted = true;
      const after = md.slice(fenceEnd);
      const needsNl = extracted.raw.endsWith("\n") ? "" : "\n";
      const extraBlank =
        after.startsWith("\n") || after.startsWith("\r\n") || after.length === 0
          ? ""
          : "\n";
      const line = imageLine(parsed.chart.title, svgRel, true);
      md = md.slice(0, fenceEnd) + needsNl + extraBlank + line + md.slice(fenceEnd);
    }

    results.push({ svgRel, svgAbs, svg, inserted });

    // Extra owned images left in this gap (a removed neighbor chart).
    const refreshedFrom = fenceEnd;
    const refreshedTo = gapEnd(md, refreshedFrom, next === undefined ? undefined : next + (md.length - source.length));
    // next index is stale after insertions above this chart. Only scan the
    // original gap length plus what we inserted at this fence.
  }

  // Second pass on the updated markdown: drop owned images that are no
  // longer the image immediately after a fence and are not otherwise kept.
  const kept = new Set(results.map((chart) => chart.svgAbs));
  for (const abs of previousOwned) {
    if (!kept.has(abs)) {
      remove.add(abs);
    }
  }

  const finalCharts = extractCharts(md);
  // Walk from the end so removing an earlier gap does not shift later fences.
  for (let i = finalCharts.length - 1; i >= 0; i--) {
    const extracted = finalCharts[i]!;
    const start = extracted.index + extracted.raw.length;
    const next = finalCharts[i + 1]?.index;
    const gap = md.slice(start, gapEnd(md, start, next));
    const owned = imagesIn(gap).filter((image) => ownedHref(image.href, stem));
    const kept = owned[0];
    if (!kept) {
      continue;
    }
    const keptAbs = join(dir, kept.href.replace(/^\.\//, ""));
    for (let k = owned.length - 1; k >= 1; k--) {
      const extra = owned[k]!;
      const extraAbs = join(dir, extra.href.replace(/^\.\//, ""));
      if (extraAbs === keptAbs) {
        continue;
      }
      const absStart = start + extra.start;
      const lineEnd = consumeLine(md, start + extra.end);
      md = md.slice(0, absStart) + md.slice(lineEnd);
      remove.add(extraAbs);
    }
  }

  // A file stays if any image in the markdown still points at it.
  for (const match of md.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = match[1] ?? "";
    if (!ownedHref(href, stem)) {
      continue;
    }
    remove.delete(join(dir, href.replace(/^\.\//, "")));
  }

  results.reverse();
  return {
    mdAbs,
    md,
    mdChanged: md !== source,
    charts: results,
    errors,
    remove: [...remove],
  };
}

export function writeBake(result: BakeFileResult): void {
  const dir = dirname(result.mdAbs);
  const written = new Set<string>();
  for (const chart of result.charts) {
    mkdirSync(dirname(chart.svgAbs), { recursive: true });
    writeFileSync(chart.svgAbs, chart.svg, "utf8");
    written.add(chart.svgAbs);
  }
  for (const abs of result.remove) {
    if (written.has(abs) || !safeInside(dir, abs) || !existsSync(abs)) {
      continue;
    }
    unlinkSync(abs);
  }
  if (result.mdChanged) {
    writeFileSync(result.mdAbs, result.md, "utf8");
  }
}
