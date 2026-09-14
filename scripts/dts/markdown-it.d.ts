export declare function markdownItMarkvis(md: {
  core: { ruler: { after: (...args: unknown[]) => void } };
  renderer: { rules: Record<string, unknown> };
}): void;
export default markdownItMarkvis;
export declare function chartBlockHtml(
  raw: string,
  filename?: string,
): string;
export declare function resultToHtml(
  result: unknown,
  filename?: string,
): string;
export declare function htmlTable(table: {
  columns: string[];
  rows: string[][];
}): string;
export declare function escapeHtml(value: string): string;
