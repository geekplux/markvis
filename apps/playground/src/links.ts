export function stemFromId(value: string): string {
  return value.replace(/\.md$/i, "");
}

export function exampleIdFromSearch(search: string): string | null {
  const raw = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(raw);
  const value = params.get("example") ?? params.get("id");
  if (!value) {
    return null;
  }
  const stem = stemFromId(value.trim());
  return stem.length > 0 ? stem : null;
}

export function galleryHref(id: string): string {
  return `/examples?id=${encodeURIComponent(stemFromId(id))}`;
}

export function playgroundSearch(id: string): string {
  return `?example=${encodeURIComponent(stemFromId(id))}`;
}
