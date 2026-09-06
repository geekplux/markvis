const THEMES = new Set(["folio", "highcharts", "shadcn", "docs"]);

export function exampleQuery(search: string): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const value = params.get("example") ?? params.get("id");
  const themeRaw = params.get("theme");
  const out = new URLSearchParams();
  if (value) {
    const stem = value.trim().replace(/\.md$/i, "");
    if (stem.length > 0) {
      out.set("example", stem);
    }
  }
  if (themeRaw && THEMES.has(themeRaw)) {
    out.set("theme", themeRaw);
  }
  const qs = out.toString();
  return qs.length > 0 ? `?${qs}` : "";
}

export function playAppIframeSrc(search: string): string {
  return `/play-app/index.html${exampleQuery(search)}`;
}
