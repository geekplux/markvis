/**
 * rehype plugin: `pre > code.language-chart|markvis|vis` becomes a real
 * hast figure (SVG subtree, caption, data table), or the table and one
 * error line. No raw HTML nodes, so it works in MDX and with
 * react-markdown. A chart comment followed by a table (when the pipeline
 * keeps comments) becomes a figure too.
 */
export declare function rehypeMarkvis(): (tree: unknown, file?: { path?: string }) => void;
export default rehypeMarkvis;
