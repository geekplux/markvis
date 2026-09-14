export type ExampleFile = {
  id: string;
  filename: string;
  source: string;
};

export function filenameFromPath(path: string): string {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1] ?? path;
}

export function catalogFromModules(
  modules: Record<string, string>,
): ExampleFile[] {
  return Object.entries(modules)
    .map(([path, source]) => {
      const filename = filenameFromPath(path);
      return {
        id: filename.replace(/\.md$/i, ""),
        filename,
        source,
      };
    })
    .sort((a, b) => a.filename.localeCompare(b.filename));
}

const modules = import.meta.glob("../../../examples/valid/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const EXAMPLES: ExampleFile[] = catalogFromModules(modules);
