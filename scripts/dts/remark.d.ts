export declare function remarkMarkvis(): (
  tree: unknown,
  file: { value?: unknown; path?: string },
) => void;
export default remarkMarkvis;
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
