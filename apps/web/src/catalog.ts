export const CHART_TYPES = [
  "bar",
  "line",
  "area",
  "scatter",
  "pie",
  "hist",
] as const;

export type ChartType = (typeof CHART_TYPES)[number];

export const THEMES = ["folio", "highcharts", "shadcn", "docs"] as const;

export type ChartTheme = (typeof THEMES)[number];

export type GalleryItem = {
  id: string;
  type: ChartType;
  title: string;
  fence: string;
  /** Folio (default) SVG — same as svgsByTheme.folio */
  svg: string;
  /** Pre-rendered SVG per theme; theme filter swaps these */
  svgsByTheme: Record<ChartTheme, string>;
};

const TYPE_SET = new Set<string>(CHART_TYPES);
const THEME_SET = new Set<string>(THEMES);

const FENCE_RE =
  /(```(?:chart|markvis|vis)[ \t]*\r?\n)([\s\S]*?)(\r?\n```)/;
const THEME_HEADER_RE = /^[ \t]*theme:[ \t]*(\S+)[ \t]*$/m;

function filenameFromPath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] ?? path;
}

export function stemFromPath(path: string): string {
  return filenameFromPath(path).replace(/\.(md|svg)$/i, "");
}

/** themes/highcharts/01-bar-basic.svg → { theme, stem } */
export function themeStemFromPath(
  path: string,
): { theme: ChartTheme; stem: string } | null {
  const normalized = path.replace(/\\/g, "/");
  const match = normalized.match(
    /(?:^|\/)themes\/(folio|highcharts|shadcn|docs)\/([^/]+)\.svg$/i,
  );
  if (!match) {
    return null;
  }
  const theme = match[1]!.toLowerCase();
  const stem = match[2]!;
  if (!isChartTheme(theme)) {
    return null;
  }
  return { theme, stem };
}

function isChartType(value: string): value is ChartType {
  return TYPE_SET.has(value);
}

export function isChartTheme(value: string): value is ChartTheme {
  return THEME_SET.has(value);
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

/** Ban stem-slug titles like "01-bar-basic" or "Bar Chart". */
export function isStemSlugTitle(title: string, id: string): boolean {
  const trimmed = title.trim();
  if (!trimmed) {
    return true;
  }
  if (trimmed.toLowerCase() === id.toLowerCase()) {
    return true;
  }
  if (/^[0-9]{2}-[a-z0-9-]+$/i.test(trimmed)) {
    return true;
  }
  if (/^(bar|line|area|scatter|pie|hist)(\s+chart)?$/i.test(trimmed)) {
    return true;
  }
  return false;
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

/** Insert or replace theme: in a fence body. Comment-only sources unchanged. */
export function rewriteThemeInFence(
  source: string,
  theme: ChartTheme,
): string {
  if (!isChartTheme(theme)) {
    return source;
  }
  const match = FENCE_RE.exec(source);
  if (!match || match.index === undefined) {
    return source;
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

export function fenceForTheme(fence: string, theme: ChartTheme): string {
  if (theme === "folio") {
    return fence;
  }
  return rewriteThemeInFence(fence, theme);
}

export function playHref(id: string, theme: ChartTheme): string {
  const params = new URLSearchParams();
  params.set("example", id);
  params.set("theme", theme);
  return `/play?${params.toString()}`;
}

export function catalogFromMaps(
  markdownByStem: Record<string, string>,
  svgByStem: Record<string, string>,
  themedSvgByThemeStem?: Record<ChartTheme, Record<string, string>>,
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
    const title = cardTitle(svg, fence);
    if (isStemSlugTitle(title, id)) {
      throw new Error(`gallery: stem-slug title for ${id}: ${title}`);
    }
    const svgsByTheme = {} as Record<ChartTheme, string>;
    for (const theme of THEMES) {
      const themed =
        themedSvgByThemeStem?.[theme]?.[id] ??
        (theme === "folio" ? svg : undefined);
      if (!themed) {
        throw new Error(
          `gallery: missing examples/out/themes/${theme}/${id}.svg`,
        );
      }
      svgsByTheme[theme] = themed;
    }
    return {
      id,
      type: parseType(fence),
      title,
      fence,
      svg: svgsByTheme.folio,
      svgsByTheme,
    };
  });
}

export function mapsFromGlobs(
  markdownModules: Record<string, string>,
  svgModules: Record<string, string>,
  themedSvgModules?: Record<string, string>,
): {
  markdownByStem: Record<string, string>;
  svgByStem: Record<string, string>;
  themedSvgByThemeStem: Record<ChartTheme, Record<string, string>>;
} {
  const markdownByStem: Record<string, string> = {};
  const svgByStem: Record<string, string> = {};
  const themedSvgByThemeStem = {
    folio: {},
    highcharts: {},
    shadcn: {},
    docs: {},
  } as Record<ChartTheme, Record<string, string>>;

  for (const [path, source] of Object.entries(markdownModules)) {
    markdownByStem[stemFromPath(path)] = source;
  }
  for (const [path, source] of Object.entries(svgModules)) {
    // Skip nested themes/ paths if a broad glob ever hits them
    if (/[/\\]themes[/\\]/i.test(path)) {
      continue;
    }
    svgByStem[stemFromPath(path)] = source;
  }
  if (themedSvgModules) {
    for (const [path, source] of Object.entries(themedSvgModules)) {
      const parsed = themeStemFromPath(path);
      if (!parsed) {
        continue;
      }
      themedSvgByThemeStem[parsed.theme][parsed.stem] = source;
    }
  }
  return { markdownByStem, svgByStem, themedSvgByThemeStem };
}

/** Count cards by type and by theme (each item counts for every theme it has). */
export function cardCounts(items: GalleryItem[]): {
  byType: Record<ChartType, number>;
  byTheme: Record<ChartTheme, number>;
} {
  const byType = {
    bar: 0,
    line: 0,
    area: 0,
    scatter: 0,
    pie: 0,
    hist: 0,
  } as Record<ChartType, number>;
  const byTheme = {
    folio: 0,
    highcharts: 0,
    shadcn: 0,
    docs: 0,
  } as Record<ChartTheme, number>;
  for (const item of items) {
    byType[item.type] += 1;
    for (const theme of THEMES) {
      if (item.svgsByTheme[theme]) {
        byTheme[theme] += 1;
      }
    }
  }
  return { byType, byTheme };
}

/** True when every chart type has ≥1 card under every theme. */
export function coversTypeThemeMatrix(items: GalleryItem[]): boolean {
  for (const theme of THEMES) {
    const types = new Set<ChartType>();
    for (const item of items) {
      if (item.svgsByTheme[theme]) {
        types.add(item.type);
      }
    }
    for (const type of CHART_TYPES) {
      if (!types.has(type)) {
        return false;
      }
    }
  }
  return true;
}
