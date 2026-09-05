export function exampleQuery(search: string): string {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const value = params.get("example") ?? params.get("id");
  if (!value) {
    return "";
  }
  const stem = value.trim().replace(/\.md$/i, "");
  return stem.length > 0 ? `?example=${encodeURIComponent(stem)}` : "";
}

export function playAppIframeSrc(search: string): string {
  return `/play-app/index.html${exampleQuery(search)}`;
}
