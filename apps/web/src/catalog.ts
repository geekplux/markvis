export const CHART_TYPES = [
  "bar",
  "line",
  "area",
  "scatter",
  "pie",
  "hist",
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

export type GalleryItem = {
  id: string;
  type: ChartType;
  title: string;
  fence: string;
  svg: string;
};

const TYPE_SET = new Set<string>(CHART_TYPES);

function filenameFromPath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] ?? path;
}

export function stemFromPath(path: string): string {
  return filenameFromPath(path).replace(/\.(md|svg)$/i, "");
}

function isChartType(value: string): value is ChartType {
  return TYPE_SET.has(value);
}

export function parseType(markdown: string): ChartType {
  const fence = markdown.match(
    /```(?:chart|markvis|vis)[ \t]*\r?\n([\s\S]*?)```/,
  );
  if (fence?.[1]) {
    const typeLine = fence[1].match(/^type:[ \t]*(\S+)/m);
    const value = typeLine?.[1]?.toLowerCase() ?? "";
    if (isChartType(value)) {
      return value;
    }
  }
  const comment = markdown.match(
    /<!--\s*(?:chart|markvis|vis)\s*:\s*([A-Za-z0-9_-]+)/i,
  );
  const value = comment?.[1]?.toLowerCase() ?? "";
  if (isChartType(value)) {
    return value;
  }
  throw new Error("gallery: missing or unknown type in fence");
}

export function parseFenceTitle(markdown: string): string | undefined {
  const fence = markdown.match(
    /```(?:chart|markvis|vis)[ \t]*\r?\n([\s\S]*?)```/,
  );
  if (fence?.[1]) {
    const titleLine = fence[1].match(/^title:[ \t]*(.+)$/m);
    const value = titleLine?.[1]?.trim();
    if (value) {
      return value;
    }
  }
  const comment = markdown.match(/\btitle\s*=\s*"([^"]+)"/i);
  const quoted = comment?.[1]?.trim();
  if (quoted) {
    return quoted;
  }
  return undefined;
}

export function parseSvgTitle(svg: string): string | undefined {
  const match = svg.match(/<title[^>]*>([^<]*)<\/title>/i);
  const value = match?.[1]?.trim();
  return value ? value : undefined;
}

export function cardTitle(svg: string, markdown: string): string {
  const title = parseSvgTitle(svg) ?? parseFenceTitle(markdown);
  if (!title) {
    throw new Error("gallery: missing conclusion title");
  }
  return title;
}

export function catalogFromMaps(
  markdownByStem: Record<string, string>,
  svgByStem: Record<string, string>,
): GalleryItem[] {
  const stems = Object.keys(markdownByStem).sort();
  if (stems.length === 0) {
    throw new Error("gallery: no examples/valid markdown");
  }
  return stems.map((id) => {
    const fence = markdownByStem[id];
    const svg = svgByStem[id];
    if (!fence) {
      throw new Error(`gallery: missing markdown for ${id}`);
    }
    if (!svg) {
      throw new Error(`gallery: missing examples/out/${id}.svg`);
    }
    return {
      id,
      type: parseType(fence),
      title: cardTitle(svg, fence),
      fence,
      svg,
    };
  });
}

export function mapsFromGlobs(
  markdownModules: Record<string, string>,
  svgModules: Record<string, string>,
): {
  markdownByStem: Record<string, string>;
  svgByStem: Record<string, string>;
} {
  const markdownByStem: Record<string, string> = {};
  const svgByStem: Record<string, string> = {};
  for (const [path, source] of Object.entries(markdownModules)) {
    markdownByStem[stemFromPath(path)] = source;
  }
  for (const [path, source] of Object.entries(svgModules)) {
    svgByStem[stemFromPath(path)] = source;
  }
  return { markdownByStem, svgByStem };
}
